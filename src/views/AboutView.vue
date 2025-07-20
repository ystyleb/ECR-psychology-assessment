<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">关于ECR心理测评系统</h1>
        <p class="text-gray-600">了解我们的专业测评工具和服务理念</p>
      </div>

      <div class="space-y-8">
        <!-- 系统介绍 -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">系统介绍</h2>
          <div class="prose prose-lg max-w-none text-gray-600">
            <p class="mb-4">
              ECR（Experiences in Close Relationships）亲密关系经历量表是基于Brennan, Clark & Shaver
              (1998)
              依恋理论开发的标准化心理测评工具。本系统将这一权威量表数字化，为用户提供专业、便捷的依恋类型评估服务。
            </p>
            <p class="mb-4">
              依恋理论认为，我们在早期与照顾者的关系经历会形成内在的工作模式，影响我们成年后在亲密关系中的行为和感受。
              通过科学的测评，您可以更好地了解自己的依恋模式，从而改善人际关系质量。
            </p>
          </div>
        </div>

        <!-- 专业性保证 -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">专业性保证</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3">科学依据</h3>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-start">
                  <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span>基于国际权威的ECR-R量表</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span>经过大量实证研究验证</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span>符合心理测量学标准</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3">质量控制</h3>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-start">
                  <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span>专业心理学团队审核</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span>严格的算法验证流程</span>
                </li>
                <li class="flex items-start">
                  <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span>持续的内容更新优化</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 隐私承诺 -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">隐私承诺</h2>
          <div class="text-gray-600">
            <p class="mb-4">我们深知心理测评数据的敏感性，承诺严格保护您的隐私：</p>
            <ul class="space-y-2">
              <li class="flex items-start">
                <i class="fas fa-shield-alt text-blue-500 mt-1 mr-2"></i>
                <span>所有测评数据在本地处理，不上传至服务器</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-shield-alt text-blue-500 mt-1 mr-2"></i>
                <span>采用端到端加密技术保护数据传输</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-shield-alt text-blue-500 mt-1 mr-2"></i>
                <span>用户可随时删除本地存储的测评记录</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-shield-alt text-blue-500 mt-1 mr-2"></i>
                <span>严格遵守相关隐私法规要求</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 免责声明 -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">重要声明</h2>
          <div class="text-gray-700">
            <p class="mb-4">
              <strong>本测评工具仅供参考，不能替代专业心理咨询或医疗诊断。</strong>
            </p>
            <ul class="space-y-2 text-sm">
              <li>• 测评结果反映的是您当前的依恋倾向，可能随时间和经历发生变化</li>
              <li>• 如果您正在经历严重的心理困扰，建议寻求专业心理咨询师的帮助</li>
              <li>• 本系统适用于18岁以上成年人，未成年人请在监护人指导下使用</li>
              <li>• 测评结果仅作为自我了解的参考，不应作为重要决策的唯一依据</li>
            </ul>
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
// 关于页面组件逻辑
</script>
