<template>
  <div class="navigation-buttons flex flex-col sm:flex-row gap-4 justify-between items-center">
    <!-- 上一题按钮 -->
    <button
      @click="$emit('previous')"
      :disabled="!canGoPrevious"
      class="nav-button nav-button-previous flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
    >
      <i class="fas fa-chevron-left mr-2"></i>
      上一题
    </button>

    <!-- 题目导航点 -->
    <div class="question-dots flex items-center space-x-2 overflow-x-auto max-w-xs sm:max-w-md">
      <div
        v-for="dot in visibleDots"
        :key="dot.questionIndex"
        @click="$emit('goto', dot.questionIndex)"
        :class="[
          'question-dot w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200',
          dot.questionIndex === currentIndex
            ? 'bg-blue-600 text-white'
            : dot.answered
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        ]"
        :title="`第 ${dot.questionIndex + 1} 题${dot.answered ? ' (已回答)' : ''}`"
      >
        {{ dot.questionIndex + 1 }}
      </div>
    </div>

    <!-- 下一题/完成按钮 -->
    <button
      @click="$emit('next')"
      :disabled="!canGoNext"
      :class="[
        'nav-button nav-button-next flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        !canGoNext
          ? 'bg-gray-200 text-gray-400'
          : isLastQuestion
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
      ]"
    >
      {{ isLastQuestion ? '完成测评' : '下一题' }}
      <i :class="isLastQuestion ? 'fas fa-check ml-2' : 'fas fa-chevron-right ml-2'"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentIndex: number
  totalQuestions: number
  answeredQuestions: boolean[]
  canGoPrevious: boolean
  canGoNext: boolean
}

interface Emits {
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'goto', index: number): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// 计算属性
const isLastQuestion = computed(() => props.currentIndex === props.totalQuestions - 1)

const visibleDots = computed(() => {
  const dots = []
  const start = Math.max(0, props.currentIndex - 2)
  const end = Math.min(props.totalQuestions, props.currentIndex + 3)

  for (let i = start; i < end; i++) {
    dots.push({
      questionIndex: i,
      answered: props.answeredQuestions[i] || false
    })
  }

  return dots
})
</script>

<style scoped>
.nav-button {
  min-width: 120px;
}

.nav-button:disabled {
  transform: none !important;
}

.nav-button:not(:disabled):hover {
  transform: translateY(-1px);
}

.nav-button:not(:disabled):active {
  transform: translateY(0);
}

.question-dot:hover {
  transform: scale(1.1);
}

.question-dot:active {
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .nav-button {
    min-width: 100px;
    padding: 0.75rem 1rem;
  }

  .question-dots {
    order: -1;
    margin-bottom: 1rem;
  }
}
</style>
