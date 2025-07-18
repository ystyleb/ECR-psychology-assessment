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
        id: 'test-123',
        createdAt: new Date(),
        responses: [1, 2, 3, 4, 5],
        basicResult: {
          anxious: 3.5,
          avoidant: 2.8,
          attachmentStyle: 'secure'
        }
      };
      
      await assessmentService.saveAssessment(mockData);
      
      const saved = localStorage.getItem('assessment_test-123');
      expect(saved).toBeTruthy();
      
      const retrieved = await assessmentService.getAssessment('test-123');
      expect(retrieved).toEqual(mockData);
    });
    
    it('应该处理保存失败的情况', async () => {
      // Mock localStorage.setItem 抛出错误
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      const mockData = { id: 'test-123' };
      
      await expect(assessmentService.saveAssessment(mockData))
        .rejects.toThrow('保存失败，请重试');
    });
  });
  
  describe('calculateAttachmentStyle', () => {
    it('应该正确计算安全型依恋', () => {
      const responses = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
      
      const result = assessmentService.calculateAttachmentStyle(responses);
      
      expect(result.attachmentStyle).toBe('secure');
      expect(result.anxious).toBeCloseTo(4.0, 1);
      expect(result.avoidant).toBeCloseTo(4.0, 1);
    });
    
    it('应该正确计算焦虑型依恋', () => {
      const responses = [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
      
      const result = assessmentService.calculateAttachmentStyle(responses);
      
      expect(result.attachmentStyle).toBe('anxious');
      expect(result.anxious).toBeGreaterThan(5.0);
      expect(result.avoidant).toBeLessThan(3.0);
    });
  });
});
```

### 4.2 组件测试
```typescript
// tests/unit/components/AssessmentForm.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import AssessmentForm from '@/components/assessment/AssessmentForm.vue';

describe('AssessmentForm', () => {
  const createWrapper = (props = {}) => {
    return mount(AssessmentForm, {
      global: {
        plugins: [createPinia()]
      },
      props: {
        questions: [
          { id: 1, text: '测试问题1', category: 'anxious' },
          { id: 2, text: '测试问题2', category: 'avoidant' }
        ],
        ...props
      }
    });
  };
  
  it('应该正确渲染问题', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.text()).toContain('测试问题1');
    expect(wrapper.find('[data-testid="question-text"]').text()).toBe('测试问题1');
  });
  
  it('应该在用户选择答案时触发事件', async () => {
    const wrapper = createWrapper();
    
    await wrapper.find('[data-testid="score-5"]').trigger('click');
    
    expect(wrapper.emitted('answer')).toBeTruthy();
    expect(wrapper.emitted('answer')[0]).toEqual([5]);
  });
  
  it('应该显示正确的进度', () => {
    const wrapper = createWrapper();
    
    expect(wrapper.find('[data-testid="progress"]').text()).toContain('1 / 2');
  });
});
```

### 4.3 E2E测试
```typescript
// tests/e2e/assessment-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('测评流程', () => {
  test('用户应该能够完成完整的测评流程', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    
    // 点击开始测评
    await page.click('[data-testid="start-assessment"]');
    
    // 验证跳转到测评页面
    await expect(page).toHaveURL(/\/assessment/);
    
    // 完成所有36道题
    for (let i = 0; i < 36; i++) {
      await page.click('[data-testid="score-4"]'); // 选择中性答案
      
      if (i < 35) {
        await page.click('[data-testid="next-question"]');
      }
    }
    
    // 提交测评
    await page.click('[data-testid="submit-assessment"]');
    
    // 验证跳转到结果页面
    await expect(page).toHaveURL(/\/report/);
    
    // 验证基础报告显示
    await expect(page.locator('[data-testid="attachment-style"]')).toBeVisible();
    await expect(page.locator('[data-testid="basic-description"]')).toBeVisible();
    
    // 验证付费解锁按钮
    await expect(page.locator('[data-testid="unlock-detailed-report"]')).toBeVisible();
  });
  
  test('用户应该能够购买详细报告', async ({ page }) => {
    // 先完成测评（可以通过直接访问结果页面模拟）
    await page.goto('/report/test-assessment-id');
    
    // 点击购买详细报告
    await page.click('[data-testid="unlock-detailed-report"]');
    
    // 验证跳转到支付页面（Stripe Checkout）
    await page.waitForURL(/checkout\.stripe\.com/);
    
    // 注意：实际E2E测试中不应该完成真实支付
    // 这里只验证跳转是否正确
    await expect(page.url()).toContain('checkout.stripe.com');
  });
});
```

## 5. 部署流程

### 5.1 开发环境部署

#### 本地开发
```bash
# 启动前端开发服务器
pnpm dev

# 启动Serverless Functions（需要Vercel CLI）
vercel dev

# 或者使用Netlify CLI
netlify dev
```

#### 预览部署
```bash
# 构建项目
pnpm build

# 本地预览
pnpm preview

# 部署到Vercel预览环境
vercel

# 部署到Netlify预览环境
netlify deploy
```

### 5.2 生产环境部署

#### Vercel部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署到生产环境
vercel --prod

# 或者通过Git集成自动部署
git push origin main
```

#### 环境变量配置
```bash
# 通过CLI设置环境变量
vercel env add STRIPE_SECRET_KEY production
vercel env add JWT_SECRET production
vercel env add STRIPE_PRICE_ID production

# 或者通过Vercel Dashboard设置
```

#### 域名配置
```bash
# 添加自定义域名
vercel domains add your-domain.com

# 配置DNS记录
# A记录: 76.76.19.61
# CNAME记录: cname.vercel-dns.com
```

### 5.3 CI/CD配置

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test
        
      - name: Run E2E tests
        run: pnpm test:e2e
        
      - name: Build project
        run: pnpm build
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 6. 调试和故障排除

### 6.1 常见问题

#### 支付相关问题
```typescript
// 调试支付流程
const debugPayment = {
  // 1. 检查Stripe配置
  checkStripeConfig() {
    console.log('Stripe Publishable Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    console.log('Environment:', import.meta.env.MODE);
  },
  
  // 2. 检查支付会话创建
  async testCreatePayment(assessmentId: string) {
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          returnUrl: window.location.origin
        })
      });
      
      const data = await response.json();
      console.log('Payment session:', data);
      return data;
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  },
  
  // 3. 检查支付验证
  async testVerifyPayment(sessionId: string) {
    try {
      const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
      const data = await response.json();
      console.log('Payment verification:', data);
      return data;
    } catch (error) {
      console.error('Payment verification failed:', error);
    }
  }
};

// 在浏览器控制台中使用
// debugPayment.checkStripeConfig();
// await debugPayment.testCreatePayment('test-123');
```

#### 本地存储问题
```typescript
// 调试本地存储
const debugStorage = {
  // 查看所有测评数据
  listAssessments() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('assessment_')
    );
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      console.log(key, JSON.parse(atob(data || '')));
    });
  },
  
  // 清理过期数据
  cleanExpiredData() {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('token_')) {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.expiresAt && data.expiresAt < now) {
          localStorage.removeItem(key);
          console.log('Removed expired token:', key);
        }
      }
    });
  },
  
  // 重置所有数据
  resetAll() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('assessment_') || 
      key.startsWith('token_') || 
      key.startsWith('payment_')
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log('Reset all assessment data');
  }
};
```

### 6.2 性能监控

#### 前端性能监控
```typescript
// utils/performance.ts
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  // 监控页面加载时间
  measurePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        total: navigation.loadEventEnd - navigation.navigationStart
      };
      
      console.log('Page Load Metrics:', metrics);
      
      // 发送到监控服务
      this.sendMetrics('page_load', metrics);
    });
  }
  
  // 监控API请求时间
  measureApiCall(name: string, promise: Promise<any>) {
    const start = performance.now();
    
    return promise
      .then(result => {
        const duration = performance.now() - start;
        this.sendMetrics('api_call', { name, duration, success: true });
        return result;
      })
      .catch(error => {
        const duration = performance.now() - start;
        this.sendMetrics('api_call', { name, duration, success: false, error: error.message });
        throw error;
      });
  }
  
  private sendMetrics(type: string, data: any) {
    // 发送到Google Analytics或其他监控服务
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        event_category: type,
        event_label: JSON.stringify(data),
        value: Math.round(data.duration || data.total || 0)
      });
    }
  }
}

// 使用示例
const monitor = PerformanceMonitor.getInstance();
monitor.measurePageLoad();

// 监控API调用
const paymentPromise = fetch('/api/create-payment', { /* ... */ });
monitor.measureApiCall('create_payment', paymentPromise);
```

### 6.3 错误处理

#### 全局错误处理
```typescript
// main.ts
import { createApp } from 'vue';
import * as Sentry from '@sentry/vue';

const app = createApp(App);

// Sentry错误监控
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
    }),
  ],
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // 过滤不重要的错误
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        // 忽略代码分割加载错误
        return null;
      }
    }
    return event;
  }
});

// Vue全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue Error:', error, info);
  
  Sentry.captureException(error, {
    contexts: {
      vue: {
        componentName: instance?.$options.name || 'Unknown',
        propsData: instance?.$props,
        info
      }
    }
  });
};

// 未捕获的Promise错误
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled Promise Rejection:', event.reason);
  
  Sentry.captureException(event.reason, {
    tags: {
      type: 'unhandled_promise_rejection'
    }
  });
});
```

#### 优雅降级处理
```typescript
// utils/errorBoundary.ts
export class ErrorBoundary {
  static wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    fallback?: (...args: Parameters<T>) => ReturnType<T>
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(`Error in ${fn.name}:`, error);
        
        // 记录错误
        Sentry.captureException(error, {
          tags: {
            function: fn.name,
            args: JSON.stringify(args)
          }
        });
        
        // 返回降级结果
        if (fallback) {
          return fallback(...args);
        }
        
        throw error;
      }
    }) as T;
  }
  
  static wrapComponent(component: any, fallbackComponent?: any) {
    return {
      ...component,
      errorCaptured(error: Error, instance: any, info: string) {
        console.error('Component Error:', error, info);
        
        Sentry.captureException(error, {
          contexts: {
            vue: {
              componentName: instance.$options.name,
              info
            }
          }
        });
        
        // 显示降级组件
        if (fallbackComponent) {
          return fallbackComponent;
        }
        
        return false; // 阻止错误向上传播
      }
    };
  }
}

// 使用示例
const safePaymentService = {
  createPayment: ErrorBoundary.wrapAsyncFunction(
    paymentService.createPayment,
    async () => ({ success: false, error: '支付服务暂时不可用' })
  )
};
```

## 7. 维护和更新

### 7.1 依赖更新
```bash
# 检查过期依赖
pnpm outdated

# 更新所有依赖到最新版本
pnpm update

# 更新特定依赖
pnpm update vue@latest

# 检查安全漏洞
pnpm audit

# 修复安全漏洞
pnpm audit --fix
```

### 7.2 代码质量检查
```bash
# ESLint检查
pnpm lint

# 自动修复ESLint问题
pnpm lint --fix

# TypeScript类型检查
pnpm type-check

# 代码格式化
pnpm format
```

### 7.3 监控和告警

#### 设置监控指标
```typescript
// 关键业务指标监控
const businessMetrics = {
  // 测评完成率
  trackAssessmentCompletion(assessmentId: string, completed: boolean) {
    gtag('event', 'assessment_completion', {
      event_category: 'engagement',
      event_label: assessmentId,
      value: completed ? 1 : 0
    });
  },
  
  // 支付转化率
  trackPaymentConversion(assessmentId: string, step: 'initiated' | 'completed' | 'failed') {
    gtag('event', 'payment_conversion', {
      event_category: 'revenue',
      event_label: assessmentId,
      custom_parameter_step: step
    });
  },
  
  // 用户体验指标
  trackUserExperience(metric: 'satisfaction' | 'difficulty', value: number) {
    gtag('event', 'user_experience', {
      event_category: 'ux',
      event_label: metric,
      value: value
    });
  }
};
```

通过以上完整的技术规格说明书和开发指南，开发团队可以：

1. **快速上手**: 清晰的项目结构和开发规范
2. **保证质量**: 完整的测试策略和代码规范
3. **高效部署**: 自动化的CI/CD流程
4. **稳定运行**: 完善的监控和错误处理机制
5. **持续改进**: 规范的维护和更新流程

这个方案既保持了静态网站的优势（简单、快速、低成本），又通过Serverless Functions解决了支付验证的核心问题，是一个非常适合快速上线和迭代的技术方案。