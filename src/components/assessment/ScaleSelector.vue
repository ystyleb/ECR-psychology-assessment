<template>
  <div class="scale-selector">
    <!-- 量表标签 -->
    <div class="scale-labels flex justify-between text-sm text-gray-600 px-4 mb-4">
      <span class="font-medium text-red-600">{{ leftLabel }}</span>
      <span class="font-medium text-gray-500">{{ centerLabel }}</span>
      <span class="font-medium text-green-600">{{ rightLabel }}</span>
    </div>

    <!-- 选项按钮 -->
    <div class="scale-options flex justify-center mb-6">
      <div class="grid grid-cols-7 gap-3 max-w-lg">
        <div v-for="score in 7" :key="score" class="text-center">
          <button
            @click="selectScore(score)"
            @keydown.enter="selectScore(score)"
            @keydown.space.prevent="selectScore(score)"
            :class="[
              'scale-button w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all duration-300 font-bold text-lg relative',
              'focus:outline-none focus:ring-4 focus:ring-blue-200',
              'hover:scale-105 transform-gpu',
              selectedScore === score
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent scale-110 shadow-lg ring-4 ring-blue-200'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 shadow-md'
            ]"
            :aria-label="`选择 ${score} 分：${getScoreLabel(score)}`"
            :aria-pressed="selectedScore === score"
            :disabled="disabled"
            :tabindex="disabled ? -1 : 0"
          >
            {{ score }}
            <div
              v-if="selectedScore === score"
              class="selected-indicator absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </button>
          <div class="scale-label text-xs text-gray-500 mt-2 px-1 leading-tight">
            {{ getScoreLabel(score) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端滑块（可选） -->
    <div v-if="showSlider" class="mobile-slider lg:hidden">
      <div class="text-center text-sm text-gray-600 mb-4">{{ sliderLabel }}</div>
      <div class="relative px-4">
        <input
          type="range"
          min="1"
          max="7"
          step="1"
          :value="selectedScore || 4"
          @input="handleSliderInput"
          @change="handleSliderChange"
          :disabled="disabled"
          :aria-label="`使用滑块选择分数，当前值：${selectedScore || 4}`"
          class="slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div class="slider-labels flex justify-between text-xs text-gray-400 mt-2">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
        </div>
      </div>
    </div>

    <!-- 当前选择显示 -->
    <div v-if="showCurrentSelection && selectedScore" class="current-selection text-center mt-4">
      <div class="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
        <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
        <span class="text-sm font-medium text-blue-800">
          已选择：{{ selectedScore }} 分 - {{ getScoreLabel(selectedScore) }}
        </span>
      </div>
    </div>

    <!-- 帮助文本 -->
    <div v-if="helpText" class="help-text text-center text-sm text-gray-500 mt-4">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  selectedScore?: number | null
  disabled?: boolean
  showSlider?: boolean
  showCurrentSelection?: boolean
  leftLabel?: string
  centerLabel?: string
  rightLabel?: string
  sliderLabel?: string
  helpText?: string
  labels?: string[]
}

interface Emits {
  (e: 'update:selectedScore', score: number): void
  (e: 'select', score: number): void
  (e: 'change', score: number): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showSlider: true,
  showCurrentSelection: false,
  leftLabel: '非常不同意',
  centerLabel: '中立',
  rightLabel: '非常同意',
  sliderLabel: '或使用滑块选择',
  helpText: '',
  labels: () => ['', '非常不同意', '不同意', '有点不同意', '中立', '有点同意', '同意', '非常同意']
})

const emit = defineEmits<Emits>()

// 计算属性
const scoreLabels = computed(() => {
  return props.labels.length >= 8
    ? props.labels
    : ['', '非常不同意', '不同意', '有点不同意', '中立', '有点同意', '同意', '非常同意']
})

// 方法
const getScoreLabel = (score: number): string => {
  return scoreLabels.value[score] || ''
}

const selectScore = (score: number) => {
  if (!props.disabled && score >= 1 && score <= 7) {
    emit('update:selectedScore', score)
    emit('select', score)
    emit('change', score)
  }
}

const handleSliderInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const score = parseInt(target.value)
  if (!isNaN(score) && score >= 1 && score <= 7) {
    emit('update:selectedScore', score)
    emit('select', score)
  }
}

const handleSliderChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const score = parseInt(target.value)
  if (!isNaN(score) && score >= 1 && score <= 7) {
    emit('change', score)
  }
}

// 键盘导航支持 - 暂时注释掉，因为模板中未使用
// const handleKeydown = (event: KeyboardEvent) => {
//   if (props.disabled || !props.selectedScore) return

//   let newScore = props.selectedScore

//   switch (event.key) {
//     case 'ArrowLeft':
//     case 'ArrowDown':
//       event.preventDefault()
//       if (newScore > 1) {
//         newScore--
//       }
//       break
//     case 'ArrowRight':
//     case 'ArrowUp':
//       event.preventDefault()
//       if (newScore < 7) {
//         newScore++
//       }
//       break
//     case 'Home':
//       event.preventDefault()
//       newScore = 1
//       break
//     case 'End':
//       event.preventDefault()
//       newScore = 7
//       break
//   }

//   if (newScore !== props.selectedScore) {
//     selectScore(newScore)
//   }
// }

// 暴露方法给父组件
defineExpose({
  selectScore,
  getScoreLabel
})
</script>

<style scoped>
/* 量表按钮动画 */
.scale-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-button:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scale-button:not(:disabled):active {
  transform: scale(0.95);
}

/* 选中状态动画 */
.scale-button[aria-pressed='true'] {
  animation: selectPulse 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes selectPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1.1);
  }
}

/* 选中指示器动画 */
.selected-indicator {
  animation: checkmarkAppear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes checkmarkAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 自定义滑块样式 */
.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 8px;
  background: linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e);
  outline: none;
  transition: opacity 0.2s;
}

.slider:hover {
  opacity: 1;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  border-color: #2563eb;
}

.slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
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
  border: none;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-track {
  height: 8px;
  border-radius: 8px;
  background: linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e);
  border: none;
}

/* 禁用状态 */
.scale-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.scale-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 焦点样式 */
.scale-button:focus {
  ring-width: 4px;
  ring-color: rgb(147 197 253 / 0.5);
}

/* 响应式调整 */
@media (max-width: 768px) {
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

  .selected-indicator {
    width: 0.875rem;
    height: 0.875rem;
  }
}

/* 当前选择动画 */
.current-selection {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色主题适配 */
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

[data-theme='dark'] .scale-labels span {
  color: #d1d5db;
}

[data-theme='dark'] .current-selection {
  background-color: rgba(59, 130, 246, 0.1);
}

[data-theme='dark'] .help-text {
  color: #9ca3af;
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .scale-button {
    border-width: 3px;
  }

  .scale-button[aria-pressed='true'] {
    border-color: #000;
    background: #fff;
    color: #000;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .scale-button,
  .selected-indicator,
  .current-selection {
    animation: none;
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .scale-selector {
    break-inside: avoid;
  }

  .mobile-slider {
    display: none;
  }
}
</style>
