# ECR项目部署指南

本指南将帮助你将ECR亲密关系经历量表项目部署到GitHub Pages，并配置Stripe Payment Links支付功能。

## 🚀 快速部署（无支付功能）

如果你只需要基础的测评功能，可以直接部署：

1. **Fork项目**
   ```bash
   # 访问项目页面并点击Fork按钮
   https://github.com/your-username/ECR-psychology-assessment
   ```

2. **启用GitHub Pages**
   - 进入你的项目设置页面
   - 找到"Pages"选项
   - 在"Source"中选择"Deploy from a branch"
   - 选择"main"分支和"/ (root)"文件夹
   - 点击"Save"

3. **访问网站**
   - 等待几分钟后访问：`https://yourusername.github.io/ECR-psychology-assessment/`

## 💳 配置支付功能

### 步骤1：创建Stripe账户

1. 访问 [Stripe官网](https://stripe.com/) 并注册账户
2. 完成账户验证（可能需要提供身份信息）
3. 进入 [Stripe Dashboard](https://dashboard.stripe.com/)

### 步骤2：创建产品和价格

1. 在Stripe Dashboard中，点击"Products"
2. 点击"Add product"
3. 填写产品信息：
   - **Name**: ECR专业版心理分析报告
   - **Description**: 详细的依恋类型分析和个性化建议
4. 设置价格：
   - **Price**: ¥19.90
   - **Currency**: CNY (人民币)
   - **Billing**: One time (一次性付费)

### 步骤3：创建Payment Link

1. 在产品页面，点击"Create payment link"
2. 配置Payment Link：
   - **Success URL**: `https://yourusername.github.io/ECR-psychology-assessment/payment-success.html`
   - **Cancel URL**: `https://yourusername.github.io/ECR-psychology-assessment/payment-cancel.html`
   - 启用"Collect customer information"（可选）
3. 点击"Create link"
4. 复制生成的Payment Link URL

### 步骤4：更新代码配置

1. 编辑 `index.html` 文件
2. 找到 `PAYMENT_CONFIG` 对象（大约在第2876行）：

```javascript
const PAYMENT_CONFIG = {
    // 替换为你的实际Stripe Payment Link
    paymentLinkBase: 'https://buy.stripe.com/your_actual_payment_link',
    successUrl: window.location.origin + '/payment-success.html',
    cancelUrl: window.location.origin + '/payment-cancel.html'
};
```

3. 将 `paymentLinkBase` 替换为你在步骤3中复制的Payment Link URL

### 步骤5：测试支付功能

1. 提交代码更改到GitHub
2. 等待GitHub Pages重新部署
3. 访问你的网站并测试支付流程
4. 使用Stripe提供的测试卡号进行测试：
   - 卡号: `4242 4242 4242 4242`
   - 过期日期: 任何未来日期
   - CVC: 任何3位数字

## 🔧 高级配置

### 自定义域名

1. 在项目根目录创建 `CNAME` 文件
2. 在文件中写入你的域名，如：`ecr.yourdomain.com`
3. 在域名DNS设置中添加CNAME记录指向 `yourusername.github.io`

### 启用HTTPS

GitHub Pages自动为 `.github.io` 域名提供HTTPS。如果使用自定义域名：

1. 在项目设置的Pages部分
2. 勾选"Enforce HTTPS"选项

### 配置Google Analytics（可选）

在 `index.html` 的 `<head>` 部分添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 常见问题

### Q: 支付后没有跳转到成功页面
A: 检查Payment Link配置中的Success URL是否正确，确保URL完整且可访问。

### Q: 支付成功但报告没有显示
A: 检查浏览器的localStorage是否被清除，或者检查控制台是否有JavaScript错误。

### Q: 在移动端支付体验不佳
A: Stripe Payment Links会自动适配移动端，确保你的Success/Cancel页面也是响应式的。

### Q: 如何查看支付记录
A: 在Stripe Dashboard的"Payments"部分可以查看所有支付记录和详细信息。

## 📊 监控和分析

### Stripe Dashboard
- 查看支付成功率
- 监控收入统计
- 处理退款请求
- 查看客户信息

### GitHub Pages统计
- 在项目的Insights > Traffic中查看访问统计
- 使用Google Analytics获取更详细的用户行为数据

## 🔒 安全注意事项

1. **不要在前端代码中暴露Stripe的Secret Key**
2. **定期检查Stripe Dashboard的安全设置**
3. **启用Stripe的欺诈检测功能**
4. **定期更新项目依赖**

## 📞 获取帮助

- **Stripe文档**: https://stripe.com/docs
- **GitHub Pages文档**: https://docs.github.com/en/pages
- **项目Issues**: https://github.com/your-username/ECR-psychology-assessment/issues

---

完成以上步骤后，你就拥有了一个功能完整的心理测评网站，支持在线支付和专业报告生成！
