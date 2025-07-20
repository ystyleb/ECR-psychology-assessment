# Stripe沙箱环境配置指南

## 问题分析
当前支付流程的问题在于：
1. Payment Link未配置`after_completion`重定向URL
2. 用户支付完成后无法自动返回应用
3. 手动刷新支付状态也无法获取结果

## 解决方案

### 方法一：使用Stripe Dashboard配置（推荐）

1. **登录Stripe沙箱环境**
   - 访问：https://dashboard.stripe.com/test/dashboard
   - 使用您的测试密钥登录

2. **创建或编辑Payment Link**
   - 进入"Payment Links"页面
   - 找到您的测试链接：`test_7sY8wRgnY56zd8F7Wk83C00`
   - 点击"Edit"编辑链接

3. **配置重定向设置**
   - 在"After payment"部分选择"Redirect to another page"
   - 设置成功重定向URL：
     ```
     本地测试：http://localhost:8000/payment-success.html
     GitHub Pages：https://yourusername.github.io/repository-name/payment-success.html
     ```
   - 设置取消重定向URL：
     ```
     本地测试：http://localhost:8000/payment-cancel.html
     GitHub Pages：https://yourusername.github.io/repository-name/payment-cancel.html
     ```

### 方法二：使用Stripe CLI创建新Payment Link

1. **安装Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   choco install stripecli
   ```

2. **登录CLI**
   ```bash
   stripe login
   ```

3. **创建带重定向的Payment Link**
   ```bash
   stripe payment_links create \
     --line-items price_1234567890,1 \
     --after-completion type=redirect \
     --after-completion "redirect[url]=http://localhost:8000/payment-success.html"
   ```

4. **更新代码中的链接**
   将新创建的链接URL更新到`index.html`中的`PAYMENT_CONFIG.paymentLinkBase`

### 方法三：使用curl API创建（高级）

```bash
curl https://api.stripe.com/v1/payment_links \
  -u "sk_test_你的测试密钥:" \
  -d "line_items[0][price]"="price_你的价格ID" \
  -d "line_items[0][quantity]"=1 \
  -d "after_completion[type]"="redirect" \
  --data-urlencode "after_completion[redirect][url]"="http://localhost:8000/payment-success.html" \
  --data-urlencode "after_completion[redirect][url]"="http://localhost:8000/payment-cancel.html"
```

## 本地测试步骤

1. **启动本地服务器**
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```

2. **访问测试**
   - 打开：http://localhost:8000
   - 完成测评
   - 点击"查看详细报告"
   - 使用Stripe测试卡：4242 4242 4242 4242

3. **验证流程**
   - 支付完成后应自动跳转到payment-success.html
   - 然后重定向回index.html并显示详细报告

## GitHub Pages部署配置

1. **更新重定向URL**
   在创建Payment Link时，使用您的GitHub Pages完整URL：
   ```
   https://yourusername.github.io/your-repository-name/payment-success.html
   ```

2. **测试验证**
   - 确保payment-success.html和payment-cancel.html已部署
   - 在GitHub Pages环境下测试完整流程

## 常见问题排查

- **没有session_id参数**：检查Payment Link的重定向配置
- **localStorage数据丢失**：确保浏览器没有阻止第三方cookie
- **跨域问题**：GitHub Pages支持自定义域名可解决
- **测试卡无效**：确保使用Stripe提供的测试卡号

## 验证配置成功

在浏览器控制台执行：
```javascript
// 检查当前Payment Link配置
console.log('Payment Link:', PAYMENT_CONFIG.paymentLinkBase);

// 测试支付流程
processPaymentLink();
```

配置成功后，支付流程将：
1. 用户点击"查看详细报告"
2. 跳转到Stripe支付页面
3. 支付完成后自动返回payment-success.html
4. 立即重定向回应用并显示详细报告