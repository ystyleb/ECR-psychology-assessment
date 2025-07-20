<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">测评报告</h1>
        <p class="text-gray-600">您的依恋类型分析结果</p>
      </div>

      <!-- 基础报告 -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div class="text-center mb-8">
          <div
            class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="fas fa-heart text-blue-600 text-3xl"></i>
          </div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">安全型依恋</h2>
          <p class="text-gray-600">您在亲密关系中表现出安全型依恋特征</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">得分情况</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">依恋焦虑</span>
                <span class="font-semibold text-blue-600">3.2分</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">依恋回避</span>
                <span class="font-semibold text-purple-600">2.8分</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">主要特征</h3>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                <span>在关系中感到安全和舒适</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                <span>能够有效表达情感需求</span>
              </li>
              <li class="flex items-start">
                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                <span>信任伴侣并支持其独立性</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">基础建议</h3>
          <p class="text-gray-600 leading-relaxed">
            您的依恋模式相对健康，建议继续保持开放的沟通方式，
            在关系中保持适度的独立性，同时给予伴侣足够的支持和理解。
          </p>
        </div>
      </div>

      <!-- 解锁详细报告 -->
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="mb-6">
          <i class="fas fa-lock text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">解锁详细报告</h3>
          <p class="text-gray-600">获取更深入的分析、个性化建议和专业图表</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-6 mb-6">
          <h4 class="font-semibold text-gray-800 mb-3">详细报告包含：</h4>
          <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div class="flex items-center">
              <i class="fas fa-chart-pie text-blue-500 mr-2"></i>
              <span>专业可视化图表</span>
            </div>
            <div class="flex items-center">
              <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
              <span>个性化改善建议</span>
            </div>
            <div class="flex items-center">
              <i class="fas fa-heart text-red-500 mr-2"></i>
              <span>关系发展指导</span>
            </div>
            <div class="flex items-center">
              <i class="fas fa-download text-green-500 mr-2"></i>
              <span>PDF报告下载</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center space-x-4 mb-6">
          <span class="text-2xl font-bold text-gray-800">¥19.9</span>
          <span class="text-sm text-gray-500 line-through">¥39.9</span>
          <span class="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">限时5折</span>
        </div>

        <button
          @click="unlockDetailedReport"
          class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          解锁详细报告
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePaymentStore } from '@/stores/payment'

const route = useRoute()
const paymentStore = usePaymentStore()

const unlockDetailedReport = () => {
  const assessmentId = route.params.id as string
  paymentStore.initiatePayment(assessmentId)
}
</script>
