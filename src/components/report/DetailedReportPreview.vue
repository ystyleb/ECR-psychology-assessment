<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden"
    @click.self="close"
  >
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
      <!-- 预览头部 -->
      <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <h2 class="text-2xl font-bold text-gray-800 truncate">详细报告预览</h2>
            <p class="text-gray-600 mt-1 text-sm">以下内容仅供预览，部分内容已模糊处理</p>
          </div>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ml-4"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>

      <!-- 可滚动内容区域 -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden">

        <!-- 预览内容 -->
        <div class="p-6 space-y-8 min-w-0">
          <!-- 1. 依恋风格详细分析 -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 min-w-0">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-user-circle text-blue-600 mr-3 flex-shrink-0"></i>
              <span class="truncate">您的依恋风格深度分析</span>
            </h3>
            <div class="space-y-4">
              <div class="bg-white rounded-lg p-4 min-w-0">
                <h4 class="font-medium text-gray-800 mb-2">核心特征</h4>
                <div class="blurred-content">
                  <p class="text-gray-600 break-words">{{ blurredText.coreTraits }}</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-4 min-w-0">
                <h4 class="font-medium text-gray-800 mb-2">行为模式</h4>
                <div class="blurred-content">
                  <p class="text-gray-600 break-words">{{ blurredText.behaviorPatterns }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. 关系模式分析 -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 min-w-0">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-heart text-purple-600 mr-3 flex-shrink-0"></i>
              <span class="truncate">关系模式深度解析</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              <div class="bg-white rounded-lg p-4 min-w-0">
                <h4 class="font-medium text-gray-800 mb-2">亲密关系中的表现</h4>
                <div class="blurred-content">
                  <p class="text-gray-600 break-words">{{ blurredText.intimacyBehavior }}</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-4 min-w-0">
                <h4 class="font-medium text-gray-800 mb-2">冲突处理方式</h4>
                <div class="blurred-content">
                  <p class="text-gray-600 break-words">{{ blurredText.conflictStyle }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. 可视化图表预览 -->
          <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 min-w-0">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-chart-pie text-green-600 mr-3 flex-shrink-0"></i>
              <span class="truncate">专业可视化分析</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              <!-- 雷达图预览 -->
              <div class="bg-white rounded-lg p-4 relative min-w-0">
                <h4 class="font-medium text-gray-800 mb-4 text-center">依恋维度雷达图</h4>
                <div class="chart-preview-container">
                  <div class="chart-placeholder">
                    <i class="fas fa-chart-line text-4xl text-gray-300"></i>
                    <p class="text-sm text-gray-500 mt-2">专业图表分析</p>
                  </div>
                  <div class="blur-overlay"></div>
                </div>
              </div>
              
              <!-- 柱状图预览 -->
              <div class="bg-white rounded-lg p-4 relative min-w-0">
                <h4 class="font-medium text-gray-800 mb-4 text-center">分数对比图</h4>
                <div class="chart-preview-container">
                  <div class="chart-placeholder">
                    <i class="fas fa-chart-bar text-4xl text-gray-300"></i>
                    <p class="text-sm text-gray-500 mt-2">多维度对比</p>
                  </div>
                  <div class="blur-overlay"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. 个性化建议预览 -->
          <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 min-w-0">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-lightbulb text-yellow-600 mr-3 flex-shrink-0"></i>
              <span class="truncate">个性化成长建议</span>
            </h3>
            <div class="space-y-4">
              <div class="bg-white rounded-lg p-4 min-w-0">
                <h4 class="font-medium text-gray-800 mb-2">自我成长方案</h4>
                <div class="blurred-content">
                  <ul class="space-y-2 text-gray-600">
                    <li class="break-words">• {{ blurredText.growthTip1 }}</li>
                    <li class="break-words">• {{ blurredText.growthTip2 }}</li>
                    <li class="break-words">• {{ blurredText.growthTip3 }}</li>
                  </ul>
                </div>
              </div>
              <div class="bg-white rounded-lg p-4 min-w-0">
                <h4 class="font-medium text-gray-800 mb-2">关系改善策略</h4>
                <div class="blurred-content">
                  <ul class="space-y-2 text-gray-600">
                    <li class="break-words">• {{ blurredText.relationshipTip1 }}</li>
                    <li class="break-words">• {{ blurredText.relationshipTip2 }}</li>
                    <li class="break-words">• {{ blurredText.relationshipTip3 }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. 兼容性分析预览 -->
          <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 min-w-0">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-users text-red-600 mr-3 flex-shrink-0"></i>
              <span class="truncate">伴侣兼容性分析</span>
            </h3>
            <div class="bg-white rounded-lg p-4 min-w-0">
              <h4 class="font-medium text-gray-800 mb-2">与不同依恋类型的匹配度</h4>
              <div class="blurred-content">
                <div class="space-y-3">
                  <div class="flex items-center justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0 mr-3">安全型伴侣</span>
                    <div class="w-32 bg-gray-200 rounded-full h-2 flex-shrink-0">
                      <div class="bg-green-500 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0 mr-3">焦虑型伴侣</span>
                    <div class="w-32 bg-gray-200 rounded-full h-2 flex-shrink-0">
                      <div class="bg-yellow-500 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between min-w-0">
                    <span class="text-gray-600 flex-shrink-0 mr-3">回避型伴侣</span>
                    <div class="w-32 bg-gray-200 rounded-full h-2 flex-shrink-0">
                      <div class="bg-orange-500 h-2 rounded-full w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部行动区域 -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl z-10">
        <div class="text-center">
          <p class="text-gray-600 mb-4">想要查看完整的详细报告和专业建议？</p>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
            <button
              @click="$emit('unlock')"
              class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <i class="fas fa-unlock mr-2"></i>
              立即解锁详细报告
            </button>
            <button
              @click="close"
              class="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Emits {
  (e: 'close'): void
  (e: 'unlock'): void
}

defineProps<{
  show: boolean
  attachmentStyle?: string
}>()

const emit = defineEmits<Emits>()

// 根据依恋类型生成模糊化的示例内容
const blurredText = computed(() => {
  const baseTexts = {
    coreTraits: '您的依恋风格表现出强烈的███████特征，在亲密关系中倾向于███████和███████，这影响了您的███████模式...',
    behaviorPatterns: '在日常互动中，您经常会█████████，特别是当面临█████████情况时，您的反应往往是█████████...',
    intimacyBehavior: '在亲密关系中，您展现出█████████的特点，对伴侣的█████████需求较高，同时在█████████方面...',
    conflictStyle: '面对关系冲突时，您倾向于█████████，这种处理方式源于您的█████████经历，建议您在█████████...',
    growthTip1: '通过█████████练习来提升您的█████████能力',
    growthTip2: '学会识别和调节█████████情绪反应模式',
    growthTip3: '培养更加█████████的沟通方式和表达技巧',
    relationshipTip1: '在关系中保持█████████的边界感和█████████',
    relationshipTip2: '主动学习█████████技巧来改善伴侣互动',
    relationshipTip3: '定期进行█████████反思和█████████调整'
  }
  
  return baseTexts
})

// 方法
const close = () => {
  emit('close')
}
</script>

<style scoped>
/* 模糊内容样式 */
.blurred-content {
  position: relative;
  filter: blur(1px);
  opacity: 0.7;
  pointer-events: none;
  user-select: none;
}

.blurred-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

/* 图表预览样式 */
.chart-preview-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 8px;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(3px);
  border-radius: 8px;
}

/* 闪烁动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 模态窗口动画 */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 防止水平溢出 */
* {
  box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
  
  .sm\\:flex-row {
    flex-direction: column;
  }
  
  .sm\\:space-y-0 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(0px * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(0px * var(--tw-space-y-reverse));
  }
  
  .sm\\:space-x-4 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-x-reverse: 0;
    margin-right: calc(1rem * var(--tw-space-x-reverse));
    margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));
  }
  
  .space-y-2 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
  }
}
</style>