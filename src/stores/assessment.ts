import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AssessmentData, AttachmentStyle, AssessmentQuestion, LoadingState } from '@/types'
import { useUIStore } from './ui'

export const useAssessmentStore = defineStore('assessment', () => {
  // 状态
  const currentAssessment = ref<AssessmentData | null>(null)
  const assessments = ref<Map<string, AssessmentData>>(new Map())
  const questions = ref<AssessmentQuestion[]>([])
  const loadingState = ref<LoadingState>('idle')
  const currentQuestionIndex = ref(0)
  const startTime = ref<Date | null>(null)
  const completionTime = ref<number | null>(null)

  // 计算属性
  const hasCurrentAssessment = computed(() => currentAssessment.value !== null)

  const currentProgress = computed(() => {
    if (!currentAssessment.value) return 0
    const answered = currentAssessment.value.responses.filter(r => r !== null).length
    return Math.round((answered / 36) * 100)
  })

  const isAssessmentComplete = computed(() => {
    if (!currentAssessment.value) return false
    return currentAssessment.value.responses.every(r => r !== null)
  })

  const currentQuestion = computed(() => {
    if (questions.value.length === 0 || currentQuestionIndex.value >= questions.value.length) {
      return null
    }
    return questions.value[currentQuestionIndex.value]
  })

  const canGoNext = computed(() => {
    if (!currentAssessment.value || !currentQuestion.value) return false
    const currentResponse = currentAssessment.value.responses[currentQuestionIndex.value]
    return currentResponse !== null
  })

  const canGoPrevious = computed(() => currentQuestionIndex.value > 0)

  const assessmentStats = computed(() => {
    const total = assessments.value.size
    const completed = Array.from(assessments.value.values()).filter(a =>
      a.responses.every(r => r !== null)
    ).length

    return {
      total,
      completed,
      inProgress: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  // 方法
  const initializeQuestions = () => {
    // ECR-R量表36题（这里是简化版，实际应该从配置文件或API获取）
    questions.value = [
      { id: 1, text: '我担心被抛弃', dimension: 'anxiety', reverse: false, order: 1 },
      { id: 2, text: '我发现很难依赖恋人', dimension: 'avoidance', reverse: false, order: 2 },
      { id: 3, text: '我经常担心恋人不再爱我', dimension: 'anxiety', reverse: false, order: 3 }
      // ... 这里应该包含所有36题
      // 为了演示，我们只添加几题
    ]
  }

  const startAssessment = () => {
    startTime.value = new Date()
    currentQuestionIndex.value = 0
    const uiStore = useUIStore()
    uiStore.showInfo('测评已开始，请认真回答每个问题')
  }

  const nextQuestion = () => {
    if (canGoNext.value && currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++
    }
  }

  const previousQuestion = () => {
    if (canGoPrevious.value) {
      currentQuestionIndex.value--
    }
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.value.length) {
      currentQuestionIndex.value = index
    }
  }

  const createNewAssessment = (): string => {
    const id = generateAssessmentId()
    const assessment: AssessmentData = {
      id,
      createdAt: new Date(),
      responses: new Array(36).fill(null),
      basicResult: null,
      paymentStatus: {
        paid: false
      }
    }

    assessments.value.set(id, assessment)
    currentAssessment.value = assessment

    // 保存到localStorage
    saveToLocalStorage()

    return id
  }

  const loadAssessment = (id: string): boolean => {
    const assessment = assessments.value.get(id)
    if (assessment) {
      currentAssessment.value = assessment
      return true
    }
    return false
  }

  const hasAssessment = (id: string): boolean => {
    return assessments.value.has(id)
  }

  const saveAnswer = (questionIndex: number, answer: number) => {
    if (!currentAssessment.value) return

    currentAssessment.value.responses[questionIndex] = answer

    // 如果所有题目都回答完了，计算结果
    if (currentAssessment.value.responses.every(r => r !== null)) {
      calculateResult()
    }

    saveToLocalStorage()
  }

  const calculateResult = () => {
    if (!currentAssessment.value) return

    const responses = currentAssessment.value.responses

    // ECR-R计分算法
    // 焦虑依恋题目索引 (1-18题，部分需要反向计分)
    const anxiousItems = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
    // 回避依恋题目索引 (19-36题，部分需要反向计分)
    const avoidantItems = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]

    // 需要反向计分的题目 (8减去原分数)
    const reverseItems = [2, 5, 7, 9, 11, 14, 16, 20, 22, 25, 27, 29, 32, 34]

    // 计算焦虑依恋得分
    let anxiousSum = 0
    anxiousItems.forEach(index => {
      let score = responses[index] as number
      if (reverseItems.includes(index)) {
        score = 8 - score
      }
      anxiousSum += score
    })
    const anxiousScore = Number((anxiousSum / 18).toFixed(1))

    // 计算回避依恋得分
    let avoidantSum = 0
    avoidantItems.forEach(index => {
      let score = responses[index] as number
      if (reverseItems.includes(index)) {
        score = 8 - score
      }
      avoidantSum += score
    })
    const avoidantScore = Number((avoidantSum / 18).toFixed(1))

    // 判断依恋类型
    let attachmentStyle: AttachmentStyle
    if (anxiousScore < 4 && avoidantScore < 4) {
      attachmentStyle = 'secure'
    } else if (anxiousScore >= 4 && avoidantScore < 4) {
      attachmentStyle = 'anxious'
    } else if (anxiousScore < 4 && avoidantScore >= 4) {
      attachmentStyle = 'avoidant'
    } else {
      attachmentStyle = 'disorganized'
    }

    currentAssessment.value.basicResult = {
      anxious: anxiousScore,
      avoidant: avoidantScore,
      attachmentStyle
    }

    saveToLocalStorage()
  }

  const generateAssessmentId = (): string => {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const saveToLocalStorage = () => {
    const data = Array.from(assessments.value.entries())
    localStorage.setItem('ecr_assessments', JSON.stringify(data))
  }

  const loadFromLocalStorage = () => {
    const data = localStorage.getItem('ecr_assessments')
    if (data) {
      try {
        const entries = JSON.parse(data)
        assessments.value = new Map(entries)
      } catch (error) {
        console.error('Failed to load assessments from localStorage:', error)
      }
    }
  }

  // 完成测评
  const completeAssessment = () => {
    if (!currentAssessment.value || !startTime.value) return

    completionTime.value = Date.now() - startTime.value.getTime()
    calculateResult()

    const uiStore = useUIStore()
    uiStore.showSuccess('测评完成！正在生成您的报告...')
  }

  // 重置当前测评
  const resetCurrentAssessment = () => {
    if (currentAssessment.value) {
      currentAssessment.value.responses = new Array(36).fill(null)
      currentAssessment.value.basicResult = null
      currentQuestionIndex.value = 0
      startTime.value = null
      completionTime.value = null
      saveToLocalStorage()
    }
  }

  // 获取测评历史
  const getAssessmentHistory = () => {
    return Array.from(assessments.value.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  // 删除测评
  const deleteAssessment = (id: string) => {
    assessments.value.delete(id)
    if (currentAssessment.value?.id === id) {
      currentAssessment.value = null
    }
    saveToLocalStorage()
  }

  // 导出测评数据
  const exportAssessmentData = (id: string) => {
    const assessment = assessments.value.get(id)
    if (!assessment) return null

    return {
      id: assessment.id,
      createdAt: assessment.createdAt,
      completedAt: assessment.basicResult ? new Date() : null,
      responses: assessment.responses,
      result: assessment.basicResult,
      completionTime: completionTime.value
    }
  }

  // 获取统计信息
  const getStatistics = () => {
    const allAssessments = Array.from(assessments.value.values())
    const completed = allAssessments.filter(a => a.basicResult)

    const styleCount = completed.reduce(
      (acc, assessment) => {
        const style = assessment.basicResult?.attachmentStyle
        if (style) {
          acc[style] = (acc[style] || 0) + 1
        }
        return acc
      },
      {} as Record<AttachmentStyle, number>
    )

    return {
      totalAssessments: allAssessments.length,
      completedAssessments: completed.length,
      averageAnxiousScore:
        completed.length > 0
          ? completed.reduce((sum, a) => sum + (a.basicResult?.anxious || 0), 0) / completed.length
          : 0,
      averageAvoidantScore:
        completed.length > 0
          ? completed.reduce((sum, a) => sum + (a.basicResult?.avoidant || 0), 0) / completed.length
          : 0,
      attachmentStyleDistribution: styleCount,
      averageCompletionTime: completionTime.value || 0
    }
  }

  // 初始化
  const init = () => {
    initializeQuestions()
    loadFromLocalStorage()
  }

  // 初始化时从localStorage加载数据
  init()

  return {
    // 状态
    currentAssessment,
    assessments,
    questions,
    loadingState,
    currentQuestionIndex,
    startTime,
    completionTime,

    // 计算属性
    hasCurrentAssessment,
    currentProgress,
    isAssessmentComplete,
    currentQuestion,
    canGoNext,
    canGoPrevious,
    assessmentStats,

    // 基础方法
    createNewAssessment,
    loadAssessment,
    hasAssessment,
    saveAnswer,
    calculateResult,

    // 导航方法
    startAssessment,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    completeAssessment,

    // 管理方法
    resetCurrentAssessment,
    deleteAssessment,
    getAssessmentHistory,
    exportAssessmentData,
    getStatistics,

    // 初始化
    init
  }
})
