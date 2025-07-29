<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 md:py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 顶部导航栏 -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="handleExit"
          class="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          <span class="hidden sm:inline">退出测评</span>
        </button>

        <div class="text-center">
          <h1 class="text-lg font-semibold text-gray-800">ECR测评</h1>
          <p class="text-sm text-gray-600">{{ formatTime(elapsedTime) }}</p>
        </div>

        <button
          @click="saveProgress"
          class="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <i class="fas fa-save mr-2"></i>
          <span class="hidden sm:inline">保存</span>
        </button>
      </div>

      <!-- 进度指示器 -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-medium text-gray-700">测评进度</span>
          <span class="text-sm font-medium text-gray-700">
            {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div
            class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-2">
          <span>{{ progressPercentage }}% 完成</span>
          <span>预计剩余 {{ estimatedTimeLeft }} 分钟</span>
        </div>
      </div>

      <!-- 开发者模式工具栏 (仅在开发环境显示) -->
      <div v-if="isDevelopment" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-yellow-800 flex items-center">
            <i class="fas fa-code mr-2"></i>
            开发者模式
          </h3>
          <button
            @click="showDevTools = !showDevTools"
            class="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 transition-colors"
          >
            {{ showDevTools ? '隐藏' : '显示' }}工具
          </button>
        </div>
        
        <div v-if="showDevTools" class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            @click="quickComplete('secure')"
            class="px-3 py-2 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
          >
            安全型
          </button>
          <button
            @click="quickComplete('anxious')"
            class="px-3 py-2 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            焦虑型
          </button>
          <button
            @click="quickComplete('avoidant')"
            class="px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          >
            回避型
          </button>
          <button
            @click="quickComplete('disorganized')"
            class="px-3 py-2 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
          >
            混乱型
          </button>
        </div>
        
        <p class="text-xs text-yellow-700 mt-2">
          快速完成功能仅用于开发测试，会自动生成对应依恋类型的模拟答案。
        </p>
      </div>

      <!-- 题目卡片 -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <!-- 题目头部 -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div
                class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3"
              >
                <span class="font-bold text-lg">{{ currentQuestionIndex + 1 }}</span>
              </div>
              <div>
                <h2 class="text-xl font-semibold">第 {{ currentQuestionIndex + 1 }} 题</h2>
                <p class="text-blue-100 text-sm">
                  {{ currentQuestion?.dimension === 'anxiety' ? '焦虑维度' : '回避维度' }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-blue-100">
                {{ Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) }}%
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

          <!-- 7点量表 -->
          <div class="space-y-6">
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
                    @click="selectAnswer(score)"
                    :class="[
                      'w-14 h-14 rounded-full border-2 transition-all duration-300 font-bold text-lg relative',
                      'focus:outline-none focus:ring-4 focus:ring-blue-200',
                      selectedAnswer === score
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent transform scale-110 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105 shadow-md'
                    ]"
                    :aria-label="`选择 ${score} 分：${getScoreLabel(score)}`"
                  >
                    {{ score }}
                    <div
                      v-if="selectedAnswer === score"
                      class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <i class="fas fa-check text-white text-xs"></i>
                    </div>
                  </button>
                  <div class="text-xs text-gray-500 mt-2 px-1 leading-tight">
                    {{ getScoreLabel(score) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 移动端滑块（可选） -->
            <div class="md:hidden mt-8">
              <div class="text-center text-sm text-gray-600 mb-4">或使用滑块选择</div>
              <input
                type="range"
                min="1"
                max="7"
                :value="selectedAnswer || 4"
                @input="selectAnswer(parseInt($event.target.value))"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <button
          @click="previousQuestion"
          :disabled="currentQuestionIndex === 0"
          class="flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100"
        >
          <i class="fas fa-chevron-left mr-2"></i>
          上一题
        </button>

        <!-- 题目导航点 -->
        <div class="flex items-center space-x-2 overflow-x-auto max-w-xs sm:max-w-md">
          <div
            v-for="(question, index) in questions.slice(
              Math.max(0, currentQuestionIndex - 2),
              currentQuestionIndex + 3
            )"
            :key="question.id"
            @click="goToQuestion(Math.max(0, currentQuestionIndex - 2) + index)"
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200',
              Math.max(0, currentQuestionIndex - 2) + index === currentQuestionIndex
                ? 'bg-blue-600 text-white'
                : responses[Math.max(0, currentQuestionIndex - 2) + index] !== null
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            ]"
          >
            {{ Math.max(0, currentQuestionIndex - 2) + index + 1 }}
          </div>
        </div>

        <button
          @click="nextQuestion"
          :disabled="selectedAnswer === null"
          :class="[
            'flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
            selectedAnswer === null
              ? 'bg-gray-200 text-gray-400'
              : currentQuestionIndex === totalQuestions - 1
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
          ]"
        >
          {{ currentQuestionIndex === totalQuestions - 1 ? '完成测评' : '下一题' }}
          <i
            :class="
              currentQuestionIndex === totalQuestions - 1
                ? 'fas fa-check ml-2'
                : 'fas fa-chevron-right ml-2'
            "
          ></i>
        </button>
      </div>

      <!-- 快捷键提示 -->
      <div class="mt-6 text-center text-sm text-gray-500">
        <p>快捷键：数字键 1-7 选择答案，← → 键切换题目</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import logger from '@/utils/logger'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 开发者模式状态 (仅在开发环境中启用)
const isDevelopment = ref(import.meta.env.DEV)
const showDevTools = ref(false)

// 响应式数据 (现在从统一store获取)
const selectedAnswer = ref<number | null>(null)
const elapsedTime = ref(0)
const timer = ref<NodeJS.Timeout | null>(null)

// 计算属性 (从统一store获取)
const totalQuestions = computed(() => appStore.questions.length)
const currentQuestion = computed(() => appStore.currentQuestion)
const currentQuestionIndex = computed(() => appStore.currentQuestionIndex)
const questions = computed(() => appStore.questions)
const responses = computed(() => appStore.currentAssessment?.responses || [])
const progressPercentage = computed(() => appStore.currentProgress)

const estimatedTimeLeft = computed(() => {
  if (currentQuestionIndex.value === 0) return 12
  const avgTimePerQuestion = elapsedTime.value / (currentQuestionIndex.value + 1)
  const remainingQuestions = totalQuestions.value - currentQuestionIndex.value - 1
  return Math.max(1, Math.round((avgTimePerQuestion * remainingQuestions) / 60))
})

// 方法
const getScoreLabel = (score: number) => {
  const labels = ['', '非常不同意', '不同意', '有点不同意', '中立', '有点同意', '同意', '非常同意']
  return labels[score]
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const selectAnswer = async (score: number) => {
  selectedAnswer.value = score
  
  // 通过store保存回答
  await appStore.saveCurrentResponse(currentQuestionIndex.value, score)

  // 短暂延迟后自动进入下一题（可选）
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    setTimeout(() => {
      if (selectedAnswer.value === score) {
        // 确保用户没有改变选择
        nextQuestion()
      }
    }, 800)
  }
}

const previousQuestion = () => {
  if (appStore.canGoPrevious) {
    appStore.previousQuestion()
    selectedAnswer.value = responses.value[currentQuestionIndex.value] || null
  }
}

const nextQuestion = async () => {
  if (selectedAnswer.value !== null) {
    // 先保存当前答案
    await appStore.saveCurrentResponse(currentQuestionIndex.value, selectedAnswer.value)

    if (currentQuestionIndex.value === totalQuestions.value - 1) {
      // 完成测评
      await completeAssessment()
    } else {
      // 下一题
      appStore.nextQuestion()
      selectedAnswer.value = responses.value[currentQuestionIndex.value] || null
    }
  }
}

const goToQuestion = (index: number) => {
  appStore.goToQuestion(index)
  selectedAnswer.value = responses.value[index] || null
}

const saveProgress = async () => {
  try {
    // 统一store会自动保存，这里可以是空的或者显示保存状态
    appStore.showInfo('进度已保存')
  } catch (error) {
    appStore.showError('保存失败')
    logger.error('Failed to save progress:', error)
  }
}

const completeAssessment = async () => {
  try {
    appStore.showInfo('正在计算您的测评结果...')

    const assessmentId = route.params.id as string

    // 如果还有当前答案，先保存
    if (selectedAnswer.value !== null) {
      await appStore.saveCurrentResponse(currentQuestionIndex.value, selectedAnswer.value)
    }

    // 检查是否完成
    if (appStore.isAssessmentComplete) {
      // 确保结果已计算并保存
      if (!appStore.currentAssessment?.basicResult) {
        await appStore.calculateAndSaveResult()
      }
      
      // 跳转到报告页面
      router.push(`/report/${assessmentId}`)
      appStore.showSuccess('测评完成！正在生成您的专属报告...')
    } else {
      appStore.showError('请完成所有题目后再提交')
    }
  } catch (error) {
    logger.error('Failed to complete assessment:', error)
    appStore.showError('完成测评时出现错误，请重试')
  }
}

// 开发者模式快速完成方法
const quickComplete = async (style: 'secure' | 'anxious' | 'avoidant' | 'disorganized') => {
  try {
    await appStore.quickCompleteAssessment(style)
    // 完成后直接跳转到报告页面
    const assessmentId = route.params.id as string
    router.push(`/report/${assessmentId}`)
  } catch (error) {
    logger.error('Quick complete failed:', error)
    appStore.showError('快速完成失败')
  }
}

const handleExit = async () => {
  if (responses.value.some(r => r !== null)) {
    if (confirm('您的测评进度将被保存，确定要退出吗？')) {
      await saveProgress()
      router.push('/assessment')
    }
  } else {
    router.push('/assessment')
  }
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  // 数字键选择答案
  if (event.key >= '1' && event.key <= '7') {
    event.preventDefault()
    selectAnswer(parseInt(event.key))
  }
  // 方向键导航
  else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previousQuestion()
  } else if (event.key === 'ArrowRight' && selectedAnswer.value !== null) {
    event.preventDefault()
    nextQuestion()
  }
  // ESC键退出
  else if (event.key === 'Escape') {
    event.preventDefault()
    handleExit()
  }
}

// 生命周期钩子
onMounted(async () => {
  logger.log('📊 AssessmentDetailView: onMounted called')
  
  try {
    // 初始化题目数据 (统一store会自动初始化)
    await appStore.init()

    // 初始化或恢复测评状态
    const assessmentId = route.params.id as string
    logger.log('📊 AssessmentDetailView: Checking assessment ID:', assessmentId)

    const hasAssessment = appStore.hasAssessment(assessmentId)
    logger.log('📊 AssessmentDetailView: hasAssessment result:', hasAssessment)
    logger.log('📊 AssessmentDetailView: Current assessment in store:', appStore.currentAssessment)

    if (!hasAssessment) {
      logger.log('📊 AssessmentDetailView: Assessment not found, redirecting')
      appStore.showError('测评不存在，请重新开始')
      router.push('/assessment')
      return
    }

    // 加载当前测评数据 (如果不是当前测评，尝试加载)
    if (appStore.currentAssessment?.id !== assessmentId) {
      logger.log('📊 AssessmentDetailView: Loading assessment from storage')
      const success = await appStore.loadAssessment(assessmentId)
      if (!success) {
        logger.log('📊 AssessmentDetailView: Failed to load assessment')
        appStore.showError('无法加载测评数据')
        router.push('/assessment')
        return
      }
    } else {
      logger.log('📊 AssessmentDetailView: Using current assessment from store')
    }

    // 设置当前选中的答案
    selectedAnswer.value = responses.value[currentQuestionIndex.value] || null
    logger.log('📊 AssessmentDetailView: Set selected answer:', selectedAnswer.value)

    // 启动计时器
    timer.value = setInterval(() => {
      elapsedTime.value++
    }, 1000)

    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeydown)

    appStore.showInfo('测评已恢复，请继续作答')
  } catch (error) {
    logger.error('Failed to initialize assessment:', error)
    appStore.showError('初始化测评失败')
    router.push('/assessment')
  }
})

onUnmounted(async () => {
  // 清理计时器
  if (timer.value) {
    clearInterval(timer.value)
  }

  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)

  // 保存进度
  await saveProgress()
})

// 监听路由变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      // 路由变化时重新初始化
      location.reload()
    }
  }
)
</script>

<style scoped>
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

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.pulse-animation {
  animation: pulse 1.5s infinite;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .grid-cols-7 {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.5rem;
  }

  button {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }

  .text-xs {
    font-size: 0.65rem;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  [data-theme='dark'] .bg-white {
    background-color: #1f2937;
  }

  [data-theme='dark'] .text-gray-800 {
    color: #f3f4f6;
  }

  [data-theme='dark'] .text-gray-700 {
    color: #d1d5db;
  }

  [data-theme='dark'] .text-gray-600 {
    color: #9ca3af;
  }

  [data-theme='dark'] .bg-gray-50 {
    background-color: #374151;
  }

  [data-theme='dark'] .bg-gray-100 {
    background-color: #374151;
  }

  [data-theme='dark'] .bg-gray-200 {
    background-color: #4b5563;
  }

  [data-theme='dark'] .border-gray-300 {
    border-color: #4b5563;
  }
}
</style>
