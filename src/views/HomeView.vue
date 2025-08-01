<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl md:text-6xl font-bold text-gray-800 mb-6">ECR心理测评系统</h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        基于科学的亲密关系经历量表，帮助您了解自己在亲密关系中的依恋模式
      </p>

      <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">测评特点</h2>
        <div class="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <div class="text-center">
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4"
            >
              <i class="fas fa-brain text-blue-600 text-lg sm:text-xl md:text-2xl"></i>
            </div>
            <h3 class="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">科学专业</h3>
            <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">基于心理学研究的标准化量表</p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4"
            >
              <i class="fas fa-shield-alt text-green-600 text-lg sm:text-xl md:text-2xl"></i>
            </div>
            <h3 class="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">隐私安全</h3>
            <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">本地处理，保护您的隐私</p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4"
            >
              <i class="fas fa-chart-line text-purple-600 text-lg sm:text-xl md:text-2xl"></i>
            </div>
            <h3 class="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">可视化报告</h3>
            <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">直观的图表展示测评结果</p>
          </div>
        </div>
      </div>

      <router-link
        to="/assessment"
        class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        开始测评
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页组件逻辑
</script>
