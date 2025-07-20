<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4"
  >
    <div class="max-w-md mx-auto text-center">
      <div class="mb-8">
        <div class="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 class="text-3xl font-bold text-gray-800 mb-4">页面未找到</h1>
        <p class="text-gray-600 mb-8">抱歉，您访问的页面不存在或已被移动。</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">您可以尝试：</h2>
        <div class="space-y-3 text-left">
          <div class="flex items-center text-gray-600">
            <i class="fas fa-home text-blue-500 mr-3"></i>
            <span>返回首页重新开始</span>
          </div>
          <div class="flex items-center text-gray-600">
            <i class="fas fa-clipboard-list text-green-500 mr-3"></i>
            <span>直接开始心理测评</span>
          </div>
          <div class="flex items-center text-gray-600">
            <i class="fas fa-info-circle text-purple-500 mr-3"></i>
            <span>了解更多关于我们的信息</span>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <router-link
          to="/"
          class="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          <i class="fas fa-home mr-2"></i>
          返回首页
        </router-link>

        <router-link
          to="/assessment"
          class="block w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition-all duration-300"
        >
          <i class="fas fa-play mr-2"></i>
          开始测评
        </router-link>

        <router-link
          to="/about"
          class="block w-full bg-gray-100 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all duration-300"
        >
          <i class="fas fa-info-circle mr-2"></i>
          关于我们
        </router-link>
      </div>

      <div class="mt-8 text-sm text-gray-500">
        <p>如果问题持续存在，请联系我们的技术支持</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面组件逻辑
</script>
