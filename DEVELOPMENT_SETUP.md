# ECR项目本地开发设置指南

## 前置要求

1. **安装 Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # 或直接从官网下载
   # https://github.com/stripe/stripe-cli/releases
   ```

2. **登录 Stripe CLI**
   ```bash
   stripe login
   ```

## 本地开发步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 设置环境变量
创建 `.env.local` 文件：
```bash
# Stripe配置（从Stripe Dashboard获取测试密钥）
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key_here

# API配置
VITE_API_BASE_URL=http://localhost:3000

# 开发环境标识
NODE_ENV=development
```

### 3. 启动开发服务器

有三种方式启动开发环境：

#### 方式1：同时启动前端和API（推荐）
```bash
npm run dev:full
```

#### 方式2：分别启动
```bash
# 终端1：启动前端开发服务器
npm run dev

# 终端2：启动API开发服务器
npm run dev:api
```

#### 方式3：手动启动（用于调试）
```bash
# 启动前端（端口5174）
npm run dev

# 启动API（端口3000）
vercel dev --listen 3000
```

### 4. 设置Stripe Webhook监听器

在新的终端窗口中运行：
```bash
npm run stripe:listen
```

或者直接使用Stripe CLI：
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

运行后，CLI会显示一个webhook签名密钥，将其添加到环境变量：
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

### 5. 测试支付流程

现在你可以：
1. 访问 http://localhost:5174
2. 完成一个测评
3. 点击"立即解锁详细报告"按钮
4. 使用Stripe测试卡号进行支付：
   - 成功支付: `4242424242424242`
   - 需要验证: `4000002500003155`
   - 支付被拒: `4000000000009995`

## 服务端口说明

- **前端开发服务器**: http://localhost:5174
- **API开发服务器**: http://localhost:3000
- **Stripe Webhook**: http://localhost:3000/api/stripe-webhook

## 调试工具

### 触发测试事件
```bash
# 触发支付成功事件
stripe trigger payment_intent.succeeded

# 触发支付失败事件
stripe trigger payment_intent.payment_failed
```

### 查看Stripe事件
```bash
# 查看最近的事件
stripe events list

# 查看特定事件
stripe events retrieve evt_xxx
```

## 常见问题

### Q: API请求失败 (ERR_CONNECTION_REFUSED)
A: 确保API服务器运行在端口3000：
```bash
npm run dev:api
```

### Q: Webhook事件没有接收到
A: 检查Stripe CLI监听器是否正确运行：
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

### Q: 支付按钮点击无反应
A: 检查环境变量是否正确设置，特别是 `VITE_API_BASE_URL`。

### Q: Vercel CLI未安装
```bash
npm install -g vercel
```

## 生产环境部署

生产环境下，API将部署在同一域名下，无需特殊配置。确保在Vercel的环境变量中设置正确的Stripe生产密钥。 