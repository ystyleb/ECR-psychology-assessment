# ECR心理测评系统 - 技术规格说明书

## 1. 系统架构概述

### 1.1 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                    静态前端 (Vue.js)                         │
│  ├── 测评流程（完全静态）                                      │
│  ├── 基础报告生成（客户端计算）                                │
│  ├── 可视化图表（客户端渲染）                                  │
│  └── 支付触发（调用Serverless）                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Serverless Functions (仅3个函数)                 │
│  ├── /api/create-payment.js    (创建支付会话)                 │
│  ├── /api/verify-payment.js    (验证支付状态)                 │
│  └── /api/generate-token.js    (生成访问令牌)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    第三方服务                                │
│  ├── Stripe (支付处理)                                       │
│  ├── Vercel/Netlify (托管部署)                              │
│  └── Sentry (错误监控)                                      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选择

#### 前端技术栈
- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **UI组件**: 自定义组件 + Tailwind CSS
- **图表库**: Chart.js / D3.js
- **状态管理**: Pinia
- **路由**: Vue Router 4

#### 后端技术栈（Serverless）
- **运行时**: Node.js 18+
- **语言**: TypeScript
- **框架**: 原生 Serverless Functions
- **支付**: Stripe API
- **部署**: Vercel Functions

#### 第三方服务
- **支付**: Stripe Checkout
- **托管**: Vercel / Netlify
- **监控**: Sentry
- **CDN**: 自动集成（Vercel/Netlify）

## 2. 数据模型设计

### 2.1 前端数据结构

#### 测评数据模型
```typescript
interface AssessmentData {
  id: string;                    // 测评唯一标识
  createdAt: Date;              // 创建时间
  responses: number[];          // 36题答案数组 [1-7]
  basicResult: {
    anxious: number;            // 焦虑依恋得分
    avoidant: number;           // 回避依恋得分
    attachmentStyle: AttachmentStyle;
  };
  paymentStatus?: {
    sessionId?: string;         // Stripe会话ID
    paid: boolean;             // 是否已支付
    unlockedAt?: Date;         // 解锁时间
    expiresAt?: Date;          // 访问过期时间
  };
}

enum AttachmentStyle {
  SECURE = 'secure',           // 安全型
  ANXIOUS = 'anxious',         // 焦虑型  
  AVOIDANT = 'avoidant',       // 回避型
  DISORGANIZED = 'disorganized' // 混乱型
}
```

#### 详细报告数据模型
```typescript
interface DetailedReport {
  assessmentId: string;
  basicResult: BasicResult;
  detailedAnalysis: {
    personalityTraits: string[];     // 性格特征
    relationshipPatterns: string[];  // 关系模式
    growthSuggestions: string[];     // 成长建议
    strengthsAndChallenges: {
      strengths: string[];
      challenges: string[];
    };
  };
  visualizations: {
    radarChart: ChartData;          // 雷达图数据
    comparisonChart: ChartData;     // 对比图数据
  };
  generatedAt: Date;
}
```

### 2.2 本地存储结构

```typescript
// localStorage 键值设计
interface LocalStorageSchema {
  // 测评数据
  [`assessment_${assessmentId}`]: AssessmentData;
  
  // 支付状态
  [`payment_${assessmentId}`]: {
    sessionId: string;
    status: 'pending' | 'completed' | 'failed';
    expiresAt: number;
  };
  
  // 访问令牌
  [`token_${assessmentId}`]: {
    token: string;
    expiresAt: number;
  };
  
  // 用户偏好
  'user_preferences': {
    language: 'zh-CN' | 'en-US';
    theme: 'light' | 'dark';
  };
}
```

## 3. API接口设计

### 3.1 Serverless Functions 接口

#### 3.1.1 创建支付会话
```typescript
// POST /api/create-payment
interface CreatePaymentRequest {
  assessmentId: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

interface CreatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  sessionId?: string;
  error?: string;
}

// 实现示例
export default async function createPayment(req: VercelRequest, res: VercelResponse) {
  try {
    const { assessmentId, returnUrl } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${returnUrl}/report/${assessmentId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/assessment/${assessmentId}`,
      metadata: { assessmentId },
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30分钟过期
    });
    
    res.json({
      success: true,
      paymentUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

#### 3.1.2 验证支付状态
```typescript
// GET /api/verify-payment?session_id=xxx
interface VerifyPaymentResponse {
  success: boolean;
  paid: boolean;
  assessmentId?: string;
  accessToken?: string;
  expiresAt?: number;
  error?: string;
}

export default async function verifyPayment(req: VercelRequest, res: VercelResponse) {
  try {
    const { session_id } = req.query;
    
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    
    if (session.payment_status === 'paid') {
      const assessmentId = session.metadata.assessmentId;
      const accessToken = generateAccessToken(assessmentId);
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30天
      
      res.json({
        success: true,
        paid: true,
        assessmentId,
        accessToken,
        expiresAt
      });
    } else {
      res.json({
        success: true,
        paid: false
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

#### 3.1.3 生成访问令牌
```typescript
// POST /api/generate-token
interface GenerateTokenRequest {
  assessmentId: string;
  sessionId: string;
}

interface GenerateTokenResponse {
  success: boolean;
  token?: string;
  expiresAt?: number;
  error?: string;
}

function generateAccessToken(assessmentId: string): string {
  const payload = {
    assessmentId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30天
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET);
}
```

### 3.2 前端API服务

```typescript
// services/paymentService.ts
class PaymentService {
  async createPayment(assessmentId: string): Promise<CreatePaymentResponse> {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentId,
        returnUrl: window.location.origin
      })
    });
    
    return response.json();
  }
  
  async verifyPayment(sessionId: string): Promise<VerifyPaymentResponse> {
    const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
    return response.json();
  }
  
  isReportUnlocked(assessmentId: string): boolean {
    const tokenData = localStorage.getItem(`token_${assessmentId}`);
    if (!tokenData) return false;
    
    const { expiresAt } = JSON.parse(tokenData);
    return Date.now() < expiresAt;
  }
}
```

## 4. 安全设计

### 4.1 数据安全
- **敏感数据加密**: 测评结果在localStorage中加密存储
- **访问令牌**: JWT令牌验证，30天有效期
- **支付安全**: 完全依赖Stripe安全体系
- **HTTPS强制**: 生产环境强制HTTPS

### 4.2 访问控制
```typescript
// 报告访问控制
function validateReportAccess(assessmentId: string): boolean {
  // 1. 检查本地访问令牌
  const tokenData = localStorage.getItem(`token_${assessmentId}`);
  if (tokenData) {
    const { expiresAt } = JSON.parse(tokenData);
    if (Date.now() < expiresAt) return true;
  }
  
  // 2. 检查URL中的session_id（支付后跳转）
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  if (sessionId) {
    // 异步验证支付状态
    return verifyPaymentAndUnlock(sessionId, assessmentId);
  }
  
  return false;
}
```

### 4.3 环境变量配置
```bash
# .env.local (Vercel环境变量)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx  
STRIPE_PRICE_ID=price_xxx
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 5. 性能优化

### 5.1 前端优化
- **代码分割**: 路由级别的懒加载
- **资源压缩**: Vite自动压缩
- **缓存策略**: 静态资源长期缓存
- **图片优化**: WebP格式，响应式图片

### 5.2 Serverless优化
- **冷启动优化**: 最小化依赖包
- **内存配置**: 根据函数需求调整
- **超时设置**: 合理的超时时间（10-30秒）

```typescript
// vercel.json 配置
{
  "functions": {
    "api/create-payment.js": {
      "memory": 256,
      "maxDuration": 10
    },
    "api/verify-payment.js": {
      "memory": 128,
      "maxDuration": 5
    }
  }
}
```

## 6. 监控和日志

### 6.1 错误监控
```typescript
// Sentry集成
import * as Sentry from "@sentry/vue";

Sentry.init({
  app,
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// 支付错误监控
try {
  await paymentService.createPayment(assessmentId);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
      assessmentId
    }
  });
}
```

### 6.2 业务指标监控
```typescript
// 自定义埋点
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
}

class Analytics {
  track(event: string, properties: Record<string, any>) {
    // Google Analytics 4
    gtag('event', event, properties);
    
    // 自定义埋点
    if (window.dataLayer) {
      window.dataLayer.push({
        event,
        ...properties
      });
    }
  }
}

// 使用示例
analytics.track('assessment_completed', {
  assessmentId,
  attachmentStyle,
  duration: completionTime
});

analytics.track('payment_initiated', {
  assessmentId,
  amount: 19.9,
  currency: 'CNY'
});
```

## 7. 部署配置

### 7.1 Vercel部署配置
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

### 7.2 构建脚本
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "deploy": "vercel --prod",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

# ECR心理测评系统 - 开发指南

## 1. 开发环境搭建

### 1.1 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 或 **pnpm**: >= 7.0.0
- **Git**: 最新版本
- **VSCode**: 推荐IDE（可选）

### 1.2 快速开始

#### 1. 克隆项目
```bash
git clone https://github.com/your-org/ecr-assessment.git
cd ecr-assessment
```

#### 2. 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

#### 3. 环境变量配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
vim .env.local
```

```bash
# .env.local
VITE_APP_TITLE=ECR心理测评系统
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_API_BASE_URL=http://localhost:3000

# Serverless Functions 环境变量 (部署时配置)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_ID=price_xxx
JWT_SECRET=your-super-secret-jwt-key
```

#### 4. 启动开发服务器
```bash
# 前端开发服务器
pnpm dev

# 本地Serverless Functions (需要Vercel CLI)
vercel dev
```

访问 `http://localhost:5173` 查看应用

### 1.3 VSCode开发环境配置

#### 推荐插件
```json
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin", 
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### 工作区配置
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "vue.inlayHints.missingProps": true
}
```

## 2. 项目结构

```
ecr-assessment/
├── public/                    # 静态资源
│   ├── favicon.ico
│   └── images/
├── src/                       # 前端源码
│   ├── components/            # Vue组件
│   │   ├── common/           # 通用组件
│   │   ├── assessment/       # 测评相关组件
│   │   └── report/          # 报告相关组件
│   ├── views/                # 页面组件
│   │   ├── Home.vue
│   │   ├── Assessment.vue
│   │   └── Report.vue
│   ├── services/             # API服务
│   │   ├── assessmentService.ts
│   │   ├── paymentService.ts
│   │   └── reportService.ts
│   ├── stores/               # Pinia状态管理
│   │   ├── assessment.ts
│   │   └── payment.ts
│   ├── utils/                # 工具函数
│   │   ├── calculations.ts
│   │   ├── storage.ts
│   │   └── validation.ts
│   ├── types/                # TypeScript类型定义
│   │   ├── assessment.ts
│   │   ├── payment.ts
│   │   └── api.ts
│   ├── assets/               # 资源文件
│   │   ├── styles/
│   │   └── images/
│   ├── router/               # 路由配置
│   │   └── index.ts
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── api/                      # Serverless Functions
│   ├── create-payment.ts
│   ├── verify-payment.ts
│   └── generate-token.ts
├── tests/                    # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                     # 文档
├── .env.example             # 环境变量模板
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── vercel.json              # Vercel部署配置
└── README.md
```

## 3. 开发规范

### 3.1 代码规范

#### TypeScript规范
```typescript
// ✅ 推荐：明确的类型定义
interface AssessmentQuestion {
  id: number;
  text: string;
  category: 'anxious' | 'avoidant';
}

// ✅ 推荐：使用枚举
enum AttachmentStyle {
  SECURE = 'secure',
  ANXIOUS = 'anxious', 
  AVOIDANT = 'avoidant',
  DISORGANIZED = 'disorganized'
}

// ❌ 避免：使用any类型
const data: any = response.data; // 不推荐

// ✅ 推荐：具体的类型
const data: AssessmentData = response.data;
```

#### 命名规范
```typescript
// 文件命名：kebab-case
assessment-form.vue
payment-service.ts
detailed-report.vue

// 组件命名：PascalCase
export default defineComponent({
  name: 'AssessmentForm'
});

// 变量和函数：camelCase
const assessmentId = generateId();
const calculateAttachmentStyle = (scores: number[]) => {};

// 常量：SCREAMING_SNAKE_CASE
const MAX_QUESTIONS = 36;
const DEFAULT_TIMEOUT = 5000;

// 类型和接口：PascalCase
interface AssessmentData {}
type PaymentStatus = 'pending' | 'completed';
```

#### Vue组件规范
```vue
<!-- ✅ 推荐的组件结构 -->
<template>
  <div class="assessment-form">
    <h2 class="text-2xl font-bold mb-6">{{ title }}</h2>
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { AssessmentQuestion } from '@/types/assessment';

// Props定义
interface Props {
  questions: AssessmentQuestion[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '心理测评'
});

// Emits定义
interface Emits {
  submit: [responses: number[]];
  progress: [current: number, total: number];
}

const emit = defineEmits<Emits>();

// 响应式数据
const currentQuestion = ref(0);
const responses = ref<number[]>([]);

// 计算属性
const progress = computed(() => 
  Math.round((currentQuestion.value / props.questions.length) * 100)
);

// 方法
const handleAnswer = (score: number) => {
  responses.value[currentQuestion.value] = score;
  emit('progress', currentQuestion.value + 1, props.questions.length);
};

// 生命周期
onMounted(() => {
  // 初始化逻辑
});
</script>

<style scoped>
.assessment-form {
  @apply max-w-2xl mx-auto p-6;
}
</style>
```

### 3.2 API服务规范

#### 服务类结构
```typescript
// services/assessmentService.ts
class AssessmentService {
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  async saveAssessment(data: AssessmentData): Promise<void> {
    try {
      // 本地存储逻辑
      const encrypted = this.encryptData(data);
      localStorage.setItem(`assessment_${data.id}`, encrypted);
    } catch (error) {
      console.error('保存测评数据失败:', error);
      throw new Error('保存失败，请重试');
    }
  }
  
  async getAssessment(id: string): Promise<AssessmentData | null> {
    try {
      const encrypted = localStorage.getItem(`assessment_${id}`);
      if (!encrypted) return null;
      
      return this.decryptData(encrypted);
    } catch (error) {
      console.error('获取测评数据失败:', error);
      return null;
    }
  }
  
  private encryptData(data: any): string {
    // 简单的加密实现
    return btoa(JSON.stringify(data));
  }
  
  private decryptData(encrypted: string): any {
    return JSON.parse(atob(encrypted));
  }
}

export const assessmentService = new AssessmentService();
```

#### Serverless Functions规范
```typescript
// api/create-payment.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: VercelRequest, 
  res: VercelResponse
) {
  // CORS处理
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { assessmentId, returnUrl } = req.body;
    
    // 参数验证
    if (!assessmentId || !returnUrl) {
      return res.status(400).json({ 
        error: '缺少必要参数' 
      });
    }
    
    // 创建支付会话
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${returnUrl}/report/${assessmentId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/assessment/${assessmentId}`,
      metadata: { assessmentId },
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30分钟过期
    });
    
    res.json({
      success: true,
      paymentUrl: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('创建支付会话失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
}
```

### 3.3 状态管理规范

#### Pinia Store结构
```typescript
// stores/assessment.ts
import { defineStore } from 'pinia';
import type { AssessmentData, AssessmentQuestion } from '@/types/assessment';
import { assessmentService } from '@/services/assessmentService';

export const useAssessmentStore = defineStore('assessment', () => {
  // State
  const currentAssessment = ref<AssessmentData | null>(null);
  const questions = ref<AssessmentQuestion[]>([]);
  const currentQuestionIndex = ref(0);
  const isLoading = ref(false);
  
  // Getters
  const currentQuestion = computed(() => 
    questions.value[currentQuestionIndex.value]
  );
  
  const progress = computed(() => 
    Math.round((currentQuestionIndex.value / questions.value.length) * 100)
  );
  
  const isCompleted = computed(() => 
    currentQuestionIndex.value >= questions.value.length
  );
  
  // Actions
  const startAssessment = async () => {
    isLoading.value = true;
    try {
      questions.value = await assessmentService.getQuestions();
      currentAssessment.value = {
        id: generateId(),
        createdAt: new Date(),
        responses: new Array(questions.value.length).fill(0),
        basicResult: null
      };
      currentQuestionIndex.value = 0;
    } finally {
      isLoading.value = false;
    }
  };
  
  const answerQuestion = (score: number) => {
    if (!currentAssessment.value) return;
    
    currentAssessment.value.responses[currentQuestionIndex.value] = score;
    currentQuestionIndex.value++;
    
    // 自动保存
    assessmentService.saveAssessment(currentAssessment.value);
  };
  
  const calculateResult = () => {
    if (!currentAssessment.value) return;
    
    const result = assessmentService.calculateAttachmentStyle(
      currentAssessment.value.responses
    );
    
    currentAssessment.value.basicResult = result;
    assessmentService.saveAssessment(currentAssessment.value);
  };
  
  return {
    // State
    currentAssessment,
    questions,
    currentQuestionIndex,
    isLoading,
    
    // Getters
    currentQuestion,
    progress,
    isCompleted,
    
    // Actions
    startAssessment,
    answerQuestion,
    calculateResult
  };
});
```

## 4. 测试规范

### 4.1 单元测试
```typescript
// tests/unit/assessmentService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { assessmentService } from '@/services/assessmentService';

describe('AssessmentService', () => {
  beforeEach(() => {
    // 清理localStorage
    localStorage.clear();
    // 重置所有mock
    vi.clearAllMocks();
  });
  
  describe('saveAssessment', () => {
    it('应该成功保存测评数据', async () => {
      const mockData = {
        i