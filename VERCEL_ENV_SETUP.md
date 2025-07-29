# Vercel 环境变量配置指南

## 需要在Vercel Dashboard中设置的环境变量

### 1. 访问Vercel Dashboard
1. 登录 https://vercel.com
2. 进入你的ECR项目
3. 点击 "Settings" -> "Environment Variables"

### 2. 添加以下环境变量

#### Stripe 配置
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

#### API 配置
```
VITE_API_BASE_URL=https://ecr-kappa.vercel.app
```

#### JWT 密钥
```
JWT_SECRET=ecr_assessment_secret_key_2024
```

#### 应用配置
```
NODE_ENV=production
VITE_APP_TITLE=ECR心理测评系统
```

### 3. 设置环境（Environment）
- 确保所有环境变量都设置为 "Production", "Preview", 和 "Development"
- 这样可以确保在所有环境中都能正常工作

### 4. 重新部署
设置完环境变量后：
1. 在Vercel Dashboard中点击 "Deployments"
2. 找到最新的部署
3. 点击右侧的 "..." 菜单
4. 选择 "Redeploy" 

或者你可以推送一个新的提交触发自动部署。

### 5. 验证配置
部署完成后：
1. 访问你的应用
2. 完成ECR评估
3. 在报告页面点击支付按钮
4. 检查控制台是否显示正确的API URL

## 预期结果

设置完环境变量并重新部署后，支付按钮应该能够：
- 连接到正确的API端点（https://ecr-kappa.vercel.app/api/create-payment）
- 成功创建Stripe支付会话
- 跳转到Stripe Checkout页面
- 显示正确的价格 ¥19.90

## 故障排除

如果仍然无法工作：
1. 检查Vercel函数日志（Functions -> View Function Logs）
2. 确认环境变量已正确设置
3. 验证域名解析是否正确
4. 检查CORS配置

完成这些设置后，支付系统应该可以正常工作了！