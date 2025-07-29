<template>
  <div class="assessment-container max-w-4xl mx-auto p-4">
    <!-- 进度条 -->
    <div class="progress-section mb-8">
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-medium text-gray-700">测评进度</span>
        <span class="text-sm font-medium text-gray-700">{{ currentIndex + 1 }}/{{ totalQuestions }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3 shadow-inner">
        <div 
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <div class="text-center text-sm text-gray-500 mt-2">{{ progress }}% 完成</div>
    </div>

    <!-- 题目卡片 -->
    <div class="question-card bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      <!-- 题目头部 -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <span class="font-bold text-lg">{{ currentIndex + 1 }}</span>
            </div>
            <div>
              <h2 class="text-xl font-semibold">第 {{ currentIndex + 1 }} 题</h2>
              <p class="text-blue-100 text-sm">{{ currentQuestion?.dimension === 'anxiety' ? '焦虑维度' : '回避维度' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 题目内容 -->
      <div class="p-8">
        <div class="text-center mb-8">
          <p class="text-xl text-gray-800 leading-relaxed font-medium mb-4">
            {{ currentQuestion?.text }}
          </p>
          <div class="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 inline-block">
            请根据您在亲密关系中的真实感受选择最符合的选项
          </div>
        </div>

        <!-- 量表选择器 -->
        <div class="scale-section space-y-6">
          <!-- 量表标签 -->
          <div class="flex justify-between text-sm text-gray-600 px-4">
            <span class="font-medium text-red-600">非常不同意</span>
            <span class="font-medium text-gray-500">中立</span>
            <span class="font-medium text-green-600">非常同意</span>
          </div>

          <!-- 选项按钮 -->
          <div class="flex justify-center">
            <div class="grid grid-cols-7 gap-3 max-w-lg">
              <div v-for="score in 7" :key="score" class="text-center">
                <button
                  @click="selectScore(score)"
                  :class="[
                    'w-14 h-14 rounded-full border-2 transition-all duration-300 font-bold text-lg relative',
                    'focus:outline-none focus:ring-4 focus:ring-blue-200',
                    selectedScore === score
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent transform scale-110 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105 shadow-md'
                  ]"
                  :disabled="loading"
                >
                  {{ score }}
                  <div
                    v-if="selectedScore === score"
                    class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </button>
                <div class="text-xs text-gray-500 mt-2 px-1 leading-tight">
                  {{ getScoreLabel(score) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 当前选择显示 -->
          <div v-if="selectedScore" class="text-center mt-4">
            <div class="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span class="text-sm font-medium text-blue-800">
                已选择：{{ selectedScore }} 分 - {{ getScoreLabel(selectedScore) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="navigation-buttons flex justify-between items-center">
      <button
        @click="previousQuestion"
        :disabled="currentIndex === 0 || loading"
        class="flex items-center px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        上一题
      </button>

      <div class="text-sm text-gray-500">
        {{ currentIndex + 1 }} / {{ totalQuestions }}
      </div>

      <button
        @click="nextQuestion"
        :disabled="!selectedScore || loading"
        class="flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLastQuestion ? '完成测评' : '下一题' }}
        <svg v-if="!isLastQuestion" class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        <svg v-else class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
        <span>正在保存...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AssessmentQuestion } from '@/types'
import { useECR } from '@/store'
import logger from '@/utils/logger'

interface Props {
  questions: AssessmentQuestion[]
  assessmentId: string
}

const props = defineProps<Props>()
const store = useECR()

// 响应式状态
const currentIndex = ref(0)
const selectedScore = ref<number | null>(null)
const loading = ref(false)

// 计算属性
const totalQuestions = computed(() => props.questions.length)
const progress = computed(() => Math.round(((currentIndex.value + 1) / totalQuestions.value) * 100))
const currentQuestion = computed(() => props.questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === totalQuestions.value - 1)

// 监听当前题目变化，更新选中答案
watch(currentIndex, (newIndex) => {
  if (store.currentAssessment?.responses) {
    selectedScore.value = store.currentAssessment.responses[newIndex] || null
  }
}, { immediate: true })

// 方法
const getScoreLabel = (score: number): string => {
  const labels = ['', '非常不同意', '不同意', '有点不同意', '中立', '有点同意', '同意', '非常同意']
  return labels[score] || ''
}

const selectScore = async (score: number) => {
  if (loading.value) return
  
  selectedScore.value = score
  
  try {
    loading.value = true
    await store.saveCurrentResponse(currentIndex.value, score)
  } catch (error) {
    logger.error('保存答案失败:', error)
    store.showError('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextQuestion = async () => {
  if (!selectedScore.value) return
  
  if (isLastQuestion.value) {
    // 完成测评
    try {
      loading.value = true
      if (store.isAssessmentComplete) {
        store.showSuccess('测评已完成！')
        // 可以触发导航到结果页面
        await navigateToResults()
      }
    } catch (error) {
      logger.error('完成测评失败:', error)
      store.showError('完成测评失败，请重试')
    } finally {
      loading.value = false
    }
  } else {
    // 下一题
    currentIndex.value++
  }
}

const navigateToResults = async () => {
  // 这里应该触发路由导航到结果页面
  // 由父组件或路由处理
  logger.log('导航到结果页面')
}

// 暴露方法给父组件
defineExpose({
  currentIndex,
  selectedScore,
  nextQuestion,
  previousQuestion
})
</script>

<style scoped>
/* 卡片动画 */
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

/* 按钮悬停效果 */
.scale-section button:not(:disabled):hover {
  transform: scale(1.05);
}

.scale-section button:not(:disabled):active {
  transform: scale(0.95);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .assessment-container {
    padding: 1rem;
  }
  
  .question-card .p-8 {
    padding: 1.5rem;
  }
  
  .scale-section button {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }
  
  .grid-cols-7 {
    gap: 0.5rem;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navigation-buttons button {
    width: 100%;
    justify-content: center;
  }
}

/* 暗色主题 */
[data-theme='dark'] .question-card {
  background-color: #1f2937;
}

[data-theme='dark'] .question-card p {
  color: #f3f4f6;
}

[data-theme='dark'] .scale-section button {
  background-color: #374151;
  color: #f3f4f6;
  border-color: #4b5563;
}

[data-theme='dark'] .scale-section button:hover {
  background-color: #4b5563;
}
</style>