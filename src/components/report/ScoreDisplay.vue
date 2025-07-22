<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="text-center mb-6">
      <h3 class="text-xl font-bold text-gray-800 mb-2">依恋维度得分</h3>
      <p class="text-gray-600 text-sm">您在不同依恋维度上的得分分布</p>
    </div>

    <!-- 得分展示 -->
    <div class="space-y-6">
      <!-- 焦虑依恋得分 -->
      <div class="score-item">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-red-500 rounded-full"></div>
            <span class="font-medium text-gray-800">焦虑依恋</span>
            <i
              class="fas fa-info-circle text-gray-400 cursor-help"
              :title="scoreExplanations.anxiety"
            ></i>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-red-600">{{ scores.anxious.toFixed(1) }}</span>
            <span class="text-sm text-gray-500">/7.0</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="relative">
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out"
              :style="{ width: `${(scores.anxious / 7) * 100}%` }"
            ></div>
          </div>
          <!-- 刻度标记 -->
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>低</span>
            <span>中等</span>
            <span>高</span>
          </div>
        </div>

        <!-- 百分位数 -->
        <div class="mt-2 text-sm text-gray-600">
          <span>超过了 {{ percentiles.anxious }}% 的人群</span>
        </div>
      </div>

      <!-- 回避依恋得分 -->
      <div class="score-item">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span class="font-medium text-gray-800">回避依恋</span>
            <i
              class="fas fa-info-circle text-gray-400 cursor-help"
              :title="scoreExplanations.avoidance"
            ></i>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-blue-600">{{ scores.avoidant.toFixed(1) }}</span>
            <span class="text-sm text-gray-500">/7.0</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="relative">
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
              :style="{ width: `${(scores.avoidant / 7) * 100}%` }"
            ></div>
          </div>
          <!-- 刻度标记 -->
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>低</span>
            <span>中等</span>
            <span>高</span>
          </div>
        </div>

        <!-- 百分位数 -->
        <div class="mt-2 text-sm text-gray-600">
          <span>超过了 {{ percentiles.avoidant }}% 的人群</span>
        </div>
      </div>

      <!-- 安全依恋得分（计算得出） -->
      <div class="score-item">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-green-500 rounded-full"></div>
            <span class="font-medium text-gray-800">安全依恋</span>
            <i
              class="fas fa-info-circle text-gray-400 cursor-help"
              title="基于焦虑和回避得分计算的安全性指标"
            ></i>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-green-600">{{ scores.secure.toFixed(1) }}</span>
            <span class="text-sm text-gray-500">/7.0</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="relative">
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
              :style="{ width: `${(scores.secure / 7) * 100}%` }"
            ></div>
          </div>
          <!-- 刻度标记 -->
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>低</span>
            <span>中等</span>
            <span>高</span>
          </div>
        </div>

        <!-- 百分位数 -->
        <div class="mt-2 text-sm text-gray-600">
          <span>超过了 {{ percentiles.secure }}% 的人群</span>
        </div>
      </div>
    </div>

    <!-- 得分解释 -->
    <div class="mt-6 p-4 bg-gray-50 rounded-xl">
      <h4 class="font-semibold text-gray-800 mb-2 flex items-center">
        <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>
        得分说明
      </h4>
      <div class="text-sm text-gray-600 space-y-2">
        <p>• <strong>1-3分</strong>：该维度得分较低</p>
        <p>• <strong>3-5分</strong>：该维度得分中等</p>
        <p>• <strong>5-7分</strong>：该维度得分较高</p>
      </div>
    </div>

    <!-- 可靠性指标 -->
    <div v-if="showReliability" class="mt-4 p-4 bg-blue-50 rounded-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <i class="fas fa-shield-alt text-blue-600"></i>
          <span class="font-medium text-gray-800">测评可靠性</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-20 bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              :style="{ width: `${reliability * 100}%` }"
            ></div>
          </div>
          <span class="text-sm font-medium text-blue-700"
            >{{ (reliability * 100).toFixed(0) }}%</span
          >
        </div>
      </div>
      <p class="text-xs text-gray-600 mt-2">
        {{ getReliabilityDescription(reliability) }}
      </p>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showActions" class="mt-6 flex flex-wrap gap-3">
      <button
        @click="$emit('view-chart')"
        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-chart-radar mr-2"></i>
        查看图表
      </button>

      <button
        @click="$emit('compare')"
        class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-balance-scale mr-2"></i>
        对比分析
      </button>

      <button
        @click="$emit('export')"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        <i class="fas fa-download mr-2"></i>
        导出
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { computed } from 'vue'
import type { AttachmentScores, AttachmentPercentiles } from '@/types'

interface Props {
  scores: AttachmentScores
  percentiles: AttachmentPercentiles
  reliability?: number
  showReliability?: boolean
  showActions?: boolean
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  reliability: 0.85,
  showReliability: true,
  showActions: true,
  animated: true
})

defineEmits<{
  (e: 'view-chart'): void
  (e: 'compare'): void
  (e: 'export'): void
}>()

// 得分解释
const scoreExplanations = {
  anxiety: '焦虑维度反映您对被抛弃或拒绝的担心程度，以及对关系安全性的需求强度。',
  avoidance: '回避维度反映您对情感亲密的舒适程度，以及在关系中保持独立性的倾向。'
}

// 方法
const getReliabilityDescription = (reliability: number): string => {
  if (reliability >= 0.9) {
    return '测评结果非常可靠，具有很高的一致性。'
  } else if (reliability >= 0.8) {
    return '测评结果可靠，具有良好的一致性。'
  } else if (reliability >= 0.7) {
    return '测评结果基本可靠，建议结合其他信息综合判断。'
  } else {
    return '测评结果可靠性较低，建议重新进行测评。'
  }
}
</script>

<style scoped>
.score-item {
  @apply transition-all duration-300 hover:bg-gray-50 rounded-lg p-3 -m-3;
}

/* 进度条动画 */
@keyframes progress-fill {
  from {
    width: 0%;
  }
}

.score-item .bg-gradient-to-r {
  animation: progress-fill 1.5s ease-out;
}

/* 悬停效果 */
.score-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
