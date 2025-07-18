<template>
  <div class="question-card bg-white rounded-2xl shadow-xl overflow-hidden">
    <!-- 题目头部 -->
    <div class="question-header bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <div
            class="question-number w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"
          >
            <span class="font-bold text-lg">{{ questionNumber }}</span>
          </div>
          <div>
            <h2 class="text-xl font-semibold">第 {{ questionNumber }} 题</h2>
            <p class="text-blue-100 text-sm">{{ dimensionLabel }}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-blue-100">
            {{ Math.round((questionNumber / totalQuestions) * 100) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 题目内容 -->
    <div class="question-content p-8">
      <div class="text-center mb-8">
        <p class="question-text text-xl text-gray-800 leading-relaxed font-medium mb-4">
          {{ question.text }}
        </p>
        <div class="question-hint text-sm text-gray-500 bg-gray-50 rounded-lg p-3 inline-block">
          {{ hint }}
        </div>
      </div>

      <!-- 7点量表 -->
      <div class="scale-container space-y-6">
        <!-- 量表标签 -->
        <div class="scale-labels flex justify-between text-sm text-gray-600 px-4">
          <span class="font-medium text-red-600">非常不同意</span>
          <span class="font-medium text-gray-500">中立</span>
          <span class="font-medium text-green-600">非常同意</span>
        </div>

        <!-- 选项按钮 -->
        <div class="scale-options flex justify-center">
          <div class="grid grid-cols-7 gap-3 max-w-lg">
            <div v-for="score in 7" :key="score" class="text-center">
              <button
                @click="selectScore(score)"
                :class="[
                  'scale-button w-14 h-14 rounded-full border-2 transition-all duration-300 font-bold text-lg relative',
                  'focus:outline-none focus:ring-4 focus:ring-blue-200',
                  selectedScore === score
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent transform scale-110 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105 shadow-md'
                ]"
                :aria-label="`选择 ${score} 分：${getScoreLabel(score)}`"
                :disabled="disabled"
              >
                {{ score }}
                <div
                  v-if="selectedScore === score"
                  class="selected-indicator absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <i class="fas fa-check text-white text-xs"></i>
                </div>
              </button>
              <div class="scale-label text-xs text-gray-500 mt-2 px-1 leading-tight">
                {{ getScoreLabel(score) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 移动端滑块（可选） -->
        <div v-if="showSlider" class="mobile-slider md:hidden mt-8">
          <div class="text-center text-sm text-gray-600 mb-4">或使用滑块选择</div>
          <input
            type="range"
            min="1"
            max="7"
            :value="selectedScore || 4"
            @input="selectScore(parseInt($event.target.value))"
            :disabled="disabled"
            class="slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AssessmentQuestion } from '@/types'

interface Props {
  question: AssessmentQuestion
  questionNumber: number
  totalQuestions: number
  selectedScore?: number | null
  disabled?: boolean
  showSlider?: boolean
  hint?: string
}

interface Emits {
  (e: 'select', score: number): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showSlider: true,
  hint: '请根据您在亲密关系中的真实感受选择最符合的选项'
})

const emit = defineEmits<Emits>()

// 计算属性
const dimensionLabel = computed(() => {
  return props.question.dimension === 'anxiety' ? '焦虑维度' : '回避维度'
})

// 方法
const getScoreLabel = (score: number): string => {
  const labels = ['', '非常不同意', '不同意', '有点不同意', '中立', '有点同意', '同意', '非常同意']
  return labels[score] || ''
}

const selectScore = (score: number) => {
  if (!props.disabled) {
    emit('select', score)
  }
}
</script>

<style scoped>
/* 题目卡片动画 */
.question-card {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 题目编号动画 */
.question-number {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 量表按钮悬停效果 */
.scale-button:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scale-button:not(:disabled):active {
  transform: scale(0.95);
}

/* 选中状态动画 */
.scale-button.selected {
  animation: selectPulse 0.3s ease-out;
}

@keyframes selectPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.1);
  }
}

/* 自定义滑块样式 */
.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 8px;
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 2px solid #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 2px solid #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

/* 禁用状态 */
.scale-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .question-content {
    padding: 1.5rem;
  }

  .question-text {
    font-size: 1.125rem;
  }

  .scale-button {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }

  .scale-label {
    font-size: 0.65rem;
  }

  .grid-cols-7 {
    gap: 0.5rem;
  }
}

/* 暗色主题适配 */
[data-theme='dark'] .question-card {
  background-color: #1f2937;
}

[data-theme='dark'] .question-text {
  color: #f3f4f6;
}

[data-theme='dark'] .question-hint {
  background-color: #374151;
  color: #d1d5db;
}

[data-theme='dark'] .scale-button {
  background-color: #374151;
  color: #f3f4f6;
  border-color: #4b5563;
}

[data-theme='dark'] .scale-button:hover {
  background-color: #4b5563;
  border-color: #6b7280;
}

[data-theme='dark'] .scale-label {
  color: #9ca3af;
}
</style>
