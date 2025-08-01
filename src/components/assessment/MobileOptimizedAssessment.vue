<template>
  <div
    ref="containerRef"
    class="mobile-assessment min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
    :class="{ 'touch-device': isTouchDevice }"
  >
    <!-- 移动端顶部栏 -->
    <div class="mobile-header sticky top-0 z-10 bg-white shadow-sm border-b">
      <div class="flex items-center justify-between p-4">
        <button
          @click="handleExit"
          class="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          :aria-label="'退出测评'"
        >
          <i class="fas fa-times text-xl"></i>
        </button>

        <div class="text-center flex-1 mx-4">
          <div class="text-sm font-medium text-gray-800">
            {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>

        <button
          @click="saveProgress"
          class="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          :aria-label="'保存进度'"
        >
          <i class="fas fa-save text-xl"></i>
        </button>
      </div>
    </div>

    <!-- 题目内容区域 -->
    <div class="question-container p-4 pb-20">
      <div class="max-w-lg mx-auto">
        <!-- 题目卡片 -->
        <div class="question-card bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <!-- 题目头部 -->
          <div class="question-header bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <div class="text-center">
              <div class="text-lg font-semibold mb-1">第 {{ currentQuestionIndex + 1 }} 题</div>
              <div class="text-blue-100 text-sm">{{ dimensionLabel }}</div>
            </div>
          </div>

          <!-- 题目内容 -->
          <div class="question-content p-6">
            <p
              class="question-text text-lg text-gray-800 leading-relaxed font-medium text-center mb-6"
            >
              {{ currentQuestion?.text }}
            </p>

            <!-- 移动端量表 -->
            <div class="mobile-scale space-y-4">
              <!-- 量表说明 -->
              <div
                class="scale-instruction text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3"
              >
                请选择最符合您情况的选项
              </div>

              <!-- 量表选项 -->
              <div class="scale-options space-y-3">
                <div
                  v-for="score in 7"
                  :key="score"
                  @click="selectAnswer(score)"
                  :class="[
                    'scale-option flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    selectedAnswer === score
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  ]"
                  :aria-label="`选择 ${score} 分：${getScoreLabel(score)}`"
                  role="button"
                  tabindex="0"
                  @keydown.enter="selectAnswer(score)"
                  @keydown.space.prevent="selectAnswer(score)"
                >
                  <div class="flex items-center">
                    <div
                      :class="[
                        'score-circle w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm mr-3 transition-all duration-200',
                        selectedAnswer === score
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-600'
                      ]"
                    >
                      {{ score }}
                    </div>
                    <div class="score-label text-gray-700 font-medium">
                      {{ getScoreLabel(score) }}
                    </div>
                  </div>

                  <div v-if="selectedAnswer === score" class="selected-indicator">
                    <i class="fas fa-check text-blue-500"></i>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- 快捷提示 -->
        <div v-if="!isTouchDevice" class="keyboard-hints text-center text-xs text-gray-500 mb-4">
          <p>快捷键：数字键 1-7 选择答案，← → 键切换题目</p>
        </div>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <div class="bottom-navigation fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div class="grid grid-cols-3 items-center p-4 gap-4">
        <!-- 左侧：上一题按钮 -->
        <div class="flex justify-start">
          <button
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="nav-button flex items-center px-4 py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
          >
            <i class="fas fa-chevron-left mr-2"></i>
            <span>上一题</span>
          </button>
        </div>

        <!-- 中间：进度信息 -->
        <div class="text-center">
          <div class="text-sm font-medium text-gray-800 mb-1">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</div>
          <div class="text-xs text-gray-500">{{ answeredCount }} 已完成</div>
        </div>

        <!-- 右侧：下一题/完成按钮 -->
        <div class="flex justify-end">
          <button
            @click="nextQuestion"
            :disabled="selectedAnswer === null"
            :class="[
              'nav-button flex items-center px-4 py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
              selectedAnswer === null
                ? 'bg-gray-200 text-gray-400'
                : isLastQuestion
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            ]"
          >
            <span>{{ isLastQuestion ? '完成' : '下一题' }}</span>
            <i :class="[isLastQuestion ? 'fas fa-check ml-2' : 'fas fa-chevron-right ml-2']"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 滑动提示 -->
    <div
      v-if="showSwipeHint"
      class="swipe-hint fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-sm animate-bounce"
    >
      ← 滑动切换题目 →
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useSwipeGesture,
  useKeyboardNavigation,
  useDeviceDetection,
  useAccessibility
} from '@/composables/useSwipeGesture'
import type { AssessmentQuestion } from '@/types'

interface Props {
  questions: AssessmentQuestion[]
  currentQuestionIndex: number
  selectedAnswer: number | null
  responses: (number | null)[]
}

interface Emits {
  (e: 'select', score: number): void
  (e: 'next'): void
  (e: 'previous'): void
  (e: 'exit'): void
  (e: 'save'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// 响应式数据
const containerRef = ref<HTMLElement>()
const showSwipeHint = ref(true)

// 设备检测
const { isTouchDevice } = useDeviceDetection()

// 可访问性
const { announceToScreenReader } = useAccessibility()

// 计算属性
const totalQuestions = computed(() => props.questions.length)
const currentQuestion = computed(() => props.questions[props.currentQuestionIndex])
const isLastQuestion = computed(() => props.currentQuestionIndex === totalQuestions.value - 1)
const progressPercentage = computed(() =>
  Math.round(((props.currentQuestionIndex + 1) / totalQuestions.value) * 100)
)
const answeredCount = computed(() => props.responses.filter(r => r !== null).length)

const dimensionLabel = computed(() => {
  return currentQuestion.value?.dimension === 'anxiety' ? '焦虑维度' : '回避维度'
})

// 方法
const getScoreLabel = (score: number): string => {
  const labels = ['', '非常不同意', '不同意', '有点不同意', '中立', '有点同意', '同意', '非常同意']
  return labels[score] || ''
}

const selectAnswer = (score: number) => {
  emit('select', score)
  announceToScreenReader(`已选择 ${score} 分：${getScoreLabel(score)}`)

  // 隐藏滑动提示
  if (showSwipeHint.value) {
    showSwipeHint.value = false
  }
}

const nextQuestion = () => {
  if (props.selectedAnswer !== null) {
    emit('next')
    announceToScreenReader(
      isLastQuestion.value ? '测评即将完成' : `进入第 ${props.currentQuestionIndex + 2} 题`
    )
  }
}

const previousQuestion = () => {
  if (props.currentQuestionIndex > 0) {
    emit('previous')
    announceToScreenReader(`返回第 ${props.currentQuestionIndex} 题`)
  }
}

const handleExit = () => {
  emit('exit')
}

const saveProgress = () => {
  emit('save')
  announceToScreenReader('进度已保存')
}

// 设置手势和键盘导航
onMounted(() => {
  // 滑动手势
  if (containerRef.value) {
    useSwipeGesture(containerRef.value, {
      onSwipeLeft: nextQuestion,
      onSwipeRight: previousQuestion
    })
  }

  // 键盘导航
  useKeyboardNavigation({
    onNext: nextQuestion,
    onPrevious: previousQuestion,
    onSelect: selectAnswer,
    onEscape: handleExit
  })

  // 5秒后隐藏滑动提示
  setTimeout(() => {
    showSwipeHint.value = false
  }, 5000)
})
</script>

<style scoped>
/* 移动端优化样式 */
.mobile-assessment {
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.touch-device .scale-option:hover {
  background-color: inherit;
  border-color: inherit;
}

.touch-device .scale-option:active {
  transform: scale(0.98);
}


/* 动画效果 */
.question-card {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .question-content {
    padding: 1rem;
  }

  .scale-option {
    padding: 0.75rem;
  }

  .bottom-navigation {
    padding: 1rem;
  }
  
  .bottom-navigation .grid {
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
  }
  
  .bottom-navigation .nav-button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .bottom-navigation .nav-button span {
    font-weight: 500;
  }
}

/* 可访问性 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .scale-option {
    border-width: 3px;
  }

  .selected-indicator {
    font-weight: bold;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .question-card,
  .scale-option,
  .nav-button {
    animation: none;
    transition: none;
  }
}
</style>
