# 支付配置指南

## 微信支付和支付宝配置

系统已经支持通过 Stripe 处理微信支付、支付宝和银行卡支付。

### 代码已完成的配置

✅ API 端点已更新支持多种支付方式：
- `api/create-payment.js` 中使用 `payment_method_configuration` 来配置支付方式
- `api/verify-payment.js` 中正确获取支付方式信息
- 支持微信支付、支付宝、银行卡等多种支付方式

✅ 前端界面已更新：
- 支付说明文案已更新为"支持微信支付、支付宝、银行卡支付"
- PaymentButton 组件保持兼容

### 需要在 Stripe Dashboard 中配置

要启用微信支付和支付宝，您需要在 Stripe Dashboard 中进行以下配置：

#### 1. 登录 Stripe Dashboard
访问 https://dashboard.stripe.com

#### 2. 启用支付方式

**启用支付宝 (Alipay):**
1. 进入 Settings → Payment methods
2. 找到 "Alipay" 选项
3. 点击 "Enable" 启用
4. 配置相关设置（如果需要）

**启用微信支付 (WeChat Pay):**
1. 进入 Settings → Payment methods  
2. 找到 "WeChat Pay" 选项
3. 点击 "Enable" 启用
4. 完成微信支付的商户验证流程
5. 配置相关设置

#### 3. 测试配置

在测试环境中：
1. 使用测试密钥
2. 在 Checkout 页面确认能看到微信支付和支付宝选项
3. 使用 Stripe 提供的测试号码进行测试

#### 4. 生产环境配置

1. 确保您的 Stripe 账户已完成 KYC 验证
2. 对于中国市场，可能需要额外的商户资质
3. 配置 Webhook 来处理支付状态更新

### 环境变量

确保以下环境变量已正确配置：

```bash
# Stripe 配置
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key  # 生产环境
STRIPE_SECRET_KEY=sk_live_your_secret_key          # 服务端环境变量

# 支付功能开关
VITE_ENABLE_PAYMENT=true
VITE_ENABLE_STRIPE_PAYMENT=true
```

### 重要注意事项

1. **地区限制**: 微信支付和支付宝在某些地区可能有使用限制
2. **货币支持**: 确保使用支持的货币（如 CNY）
3. **手续费**: 不同支付方式的手续费可能不同
4. **合规要求**: 遵守当地的支付合规要求

### 故障排查

如果支付方式没有显示：
1. 检查 Stripe Dashboard 中是否已启用相应支付方式
2. 确认货币设置为 CNY
3. 检查浏览器控制台是否有错误信息
4. 验证 API 端点的 payment_method_types 配置

### 测试支付方式

在测试模式下，您可以使用以下方式测试：
- **Alipay**: 在测试环境中会显示测试界面
- **WeChat Pay**: 会显示二维码测试界面
- **Card**: 使用 Stripe 测试卡号 4242424242424242

配置完成后，用户在支付时将看到所有可用的支付选项。