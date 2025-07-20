<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">隐私政策</h1>
        <p class="text-gray-600">我们如何保护您的个人信息和测评数据</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="prose prose-lg max-w-none text-gray-600">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">1. 信息收集</h2>
          <p class="mb-6">我们仅收集为提供测评服务所必需的最少信息：</p>
          <ul class="mb-6 space-y-2">
            <li>• 测评问卷的回答数据</li>
            <li>• 基本的设备和浏览器信息（用于技术支持）</li>
            <li>• 支付相关信息（通过第三方支付平台处理）</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">2. 数据处理</h2>
          <p class="mb-6">我们采用以下方式保护您的数据：</p>
          <ul class="mb-6 space-y-2">
            <li>• <strong>本地处理</strong>：测评数据在您的设备上本地计算，不上传至我们的服务器</li>
            <li>• <strong>加密存储</strong>：本地存储的数据采用加密技术保护</li>
            <li>• <strong>匿名化</strong>：即使需要传输的数据也会进行匿名化处理</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">3. 数据使用</h2>
          <p class="mb-6">您的数据仅用于以下目的：</p>
          <ul class="mb-6 space-y-2">
            <li>• 生成个人测评报告</li>
            <li>• 提供技术支持服务</li>
            <li>• 改进测评系统的质量（仅使用匿名化数据）</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">4. 数据共享</h2>
          <p class="mb-6">我们承诺：</p>
          <ul class="mb-6 space-y-2">
            <li>• 不会向任何第三方出售您的个人信息</li>
            <li>• 不会与广告商分享您的测评数据</li>
            <li>• 仅在法律要求的情况下配合执法部门</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">5. 您的权利</h2>
          <p class="mb-6">您拥有以下权利：</p>
          <ul class="mb-6 space-y-2">
            <li>• <strong>访问权</strong>：查看我们存储的关于您的信息</li>
            <li>• <strong>删除权</strong>：要求删除您的个人数据</li>
            <li>• <strong>更正权</strong>：更正不准确的个人信息</li>
            <li>• <strong>数据可携权</strong>：以结构化格式获取您的数据</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">6. Cookie使用</h2>
          <p class="mb-6">我们使用Cookie来：</p>
          <ul class="mb-6 space-y-2">
            <li>• 保存您的测评进度</li>
            <li>• 记住您的偏好设置</li>
            <li>• 分析网站使用情况（匿名数据）</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">7. 第三方服务</h2>
          <p class="mb-6">我们使用以下第三方服务：</p>
          <ul class="mb-6 space-y-2">
            <li>• <strong>Stripe</strong>：处理支付（遵循PCI DSS标准）</li>
            <li>• <strong>Vercel</strong>：网站托管服务</li>
            <li>• <strong>Sentry</strong>：错误监控（不包含个人数据）</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">8. 数据安全</h2>
          <p class="mb-6">我们采取以下安全措施：</p>
          <ul class="mb-6 space-y-2">
            <li>• HTTPS加密传输</li>
            <li>• 定期安全审计</li>
            <li>• 访问控制和权限管理</li>
            <li>• 数据备份和恢复机制</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">9. 政策更新</h2>
          <p class="mb-6">
            我们可能会不时更新本隐私政策。重大变更将通过网站公告的方式通知您。
            继续使用我们的服务即表示您同意更新后的政策。
          </p>

          <h2 class="text-xl font-semibold text-gray-800 mb-4">10. 联系我们</h2>
          <p class="mb-6">
            如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
          </p>
          <ul class="mb-6 space-y-2">
            <li>• 邮箱：privacy@ecr-assessment.com</li>
            <li>• GitHub Issues：提交隐私相关问题</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <p class="text-sm text-blue-800">
              <strong>最后更新时间：</strong>2024年1月<br />
              <strong>生效时间：</strong>2024年1月
            </p>
          </div>
        </div>
      </div>

      <!-- 返回按钮 -->
      <div class="text-center mt-8">
        <router-link
          to="/"
          class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 隐私政策页面组件逻辑
</script>
