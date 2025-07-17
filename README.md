# ECR亲密关系经历量表

一个专业的心理测评系统，用于评估个体在亲密关系中的依恋模式。现已优化为纯静态网站，支持GitHub Pages部署。

## 项目简介

ECR（Experiences in Close Relationships）亲密关系经历量表是一个基于Web的心理测评工具，帮助用户了解自己在亲密关系中的依恋类型和行为模式。

## 功能特点

- 📊 **科学测评**: 基于心理学研究的标准化量表
- 🎨 **现代界面**: 简洁美观的用户界面设计
- 📱 **响应式设计**: 支持各种设备和屏幕尺寸
- 📈 **可视化报告**: 直观的图表展示测评结果
- 🔒 **隐私保护**: 本地处理，不存储个人数据
- 💳 **安全支付**: 集成Stripe Payment Links，支持多种支付方式
- 🚀 **静态部署**: 无需后端服务器，完美适配GitHub Pages

## 技术栈

- HTML5
- CSS3 (使用现代CSS特性)
- JavaScript (原生JS)
- Chart.js (图表库)
- Font Awesome (图标库)
- Stripe Payment Links (支付集成)

## 项目结构

```
ECR/
├── index.html                  # 主要的测评页面
├── quadrant-comparison.html    # 四象限对比页面
├── payment-success.html        # 支付成功页面
├── payment-cancel.html         # 支付取消页面
└── README.md                   # 项目说明文档
```

## 使用方法

1. 打开 `index.html` 文件
2. 按照页面提示完成测评
3. 查看免费的基础测评报告
4. 可选择购买详细的专业版报告

## 在线访问

项目已部署到 GitHub Pages，您可以直接访问：
https://ystyleb.github.io/ECR-psychology-assessment/

## 本地开发

```bash
# 克隆项目
git clone https://github.com/ystyleb/ECR-psychology-assessment.git

# 进入项目目录
cd ECR-psychology-assessment

# 使用本地服务器打开（推荐）
python -m http.server 8000
# 或者
npx serve
```

## 支付配置

如果需要启用支付功能，请按以下步骤配置：

1. **创建Stripe账户**
   - 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
   - 创建账户并完成验证

2. **创建Payment Link**
   - 在Stripe Dashboard中创建产品
   - 设置价格为 ¥19.90
   - 创建Payment Link
   - 配置重定向URL：
     - 成功URL: `https://yourdomain.com/payment-success.html`
     - 取消URL: `https://yourdomain.com/payment-cancel.html`

3. **更新配置**
   - 在 `index.html` 中找到 `PAYMENT_CONFIG` 对象
   - 将 `paymentLinkBase` 替换为你的Payment Link URL
   - 更新 `successUrl` 和 `cancelUrl` 为你的域名

```javascript
const PAYMENT_CONFIG = {
    paymentLinkBase: 'https://buy.stripe.com/your_payment_link',
    successUrl: 'https://yourdomain.com/payment-success.html',
    cancelUrl: 'https://yourdomain.com/payment-cancel.html'
};
```

## 部署到GitHub Pages

1. **Fork项目**
   - Fork本项目到你的GitHub账户

2. **配置支付（可选）**
   - 按照上述支付配置步骤设置Stripe Payment Links
   - 更新代码中的配置信息

3. **启用GitHub Pages**
   - 在项目设置中启用GitHub Pages
   - 选择从main分支部署
   - 访问 `https://yourusername.github.io/ECR-psychology-assessment/`

## 功能说明

### 基础功能（免费）
- 完整的36题ECR量表测评
- 依恋类型判断（安全型、焦虑型、回避型、混乱型）
- 基础的结果展示和说明
- 四象限可视化图表

### 专业版功能（付费）
- 详细的心理学分析报告
- 个性化的改善建议
- 可下载的PDF报告
- 深度的依恋模式解读

## 技术特点

- **纯静态**: 无需后端服务器，完全基于前端技术
- **安全支付**: 使用Stripe官方Payment Links，PCI合规
- **响应式**: 完美适配桌面端和移动端
- **高性能**: 优化的代码结构，快速加载
- **易部署**: 一键部署到GitHub Pages

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有任何问题或建议，请通过GitHub Issues联系我们。
