# ECR心理测评系统

一个基于Vue3+TypeScript的现代化心理测评系统，用于评估个体在亲密关系中的依恋模式。

## 项目概述

ECR（Experiences in Close Relationships）亲密关系经历量表是一个专业的心理测评工具，本项目将其实现为现代化的Web应用，提供科学、便捷的依恋类型评估服务。

## 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **样式**: Tailwind CSS
- **图表**: Chart.js + vue-chartjs
- **工具库**: @vueuse/core

### 开发工具
- **代码规范**: ESLint + Prettier
- **Git钩子**: Husky + lint-staged
- **类型检查**: TypeScript
- **包管理**: npm

### 部署
- **平台**: Vercel
- **Serverless**: Vercel Functions
- **支付**: Stripe

## 项目结构

```
ECR/
├── src/                          # 前端源码
│   ├── components/               # Vue组件
│   │   ├── common/              # 通用组件
│   │   ├── layout/              # 布局组件
│   │   ├── assessment/          # 测评相关组件
│   │   ├── payment/             # 支付相关组件
│   │   ├── report/              # 报告相关组件
│   │   └── charts/              # 图表组件
│   ├── views/                   # 页面组件
│   ├── stores/                  # Pinia状态管理
│   ├── services/                # 服务层
│   ├── types/                   # TypeScript类型定义
│   ├── assets/                  # 静态资源
│   └── router/                  # 路由配置
├── api/                         # Serverless Functions
├── docs/                        # 项目文档
├── demo/                        # 原型演示
└── public/                      # 公共静态资源
```

## 开发进度

### ✅ 第1周：基础框架搭建
- [x] **ENV-001**: 创建项目仓库和基础目录结构
- [x] **ENV-002**: 配置开发环境（Vue3 + Vite + TypeScript）
- [x] **ENV-003**: 安装和配置核心依赖包
- [x] **ENV-004**: 配置ESLint、Prettier、Husky
- [x] **ENV-005**: 设置Vercel部署配置文件
- [x] **1.1 项目初始化**: 完成基础项目搭建

### 🚧 进行中
- [ ] **1.2 基础架构设计**: 路由结构、类型定义、状态管理、服务层
- [ ] **1.3 UI组件库搭建**: 设计系统、基础组件、布局组件

### 📋 待完成
- [ ] **第2周**: 测评功能实现
- [ ] **第3周**: 支付系统集成
- [ ] **第4周**: 详细报告和优化
- [ ] **第5-6周**: 测试和部署

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

### 代码格式化
```bash
npm run format
```

## 环境变量

复制 `.env.example` 到 `.env.local` 并配置以下变量：

```bash
# 应用配置
VITE_APP_TITLE=ECR心理测评系统

# Stripe配置
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# 错误监控
VITE_SENTRY_DSN=your_sentry_dsn

# API配置
VITE_API_BASE_URL=http://localhost:3000
```

## 功能特点

- 📊 **科学测评**: 基于标准ECR量表的36题测评
- 🎨 **现代界面**: 响应式设计，支持移动端
- 🔒 **隐私保护**: 本地数据处理，保护用户隐私
- 💳 **安全支付**: 集成Stripe支付系统
- 📈 **可视化报告**: 专业的图表展示
- 🚀 **高性能**: 基于Vite的快速构建

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有任何问题或建议，请通过 GitHub Issues 联系我们。
