// 统一状态管理 - 合并所有stores为单一文件
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { 
  AssessmentData, 
  AssessmentQuestion, 
  AttachmentStyle,
  PaymentSession,
  PaymentStatus,
  LoadingState,
  NotificationType 
} from '@/types'
import { ecrService } from '@/services'

/**
 * 通知接口
 */
interface Toast {
  id: string
  type: NotificationType
  message: string
  duration?: number
  createdAt: Date
}

/**
 * 统一应用状态管理
 */
export const useAppStore = defineStore('app', () => {
  // ===== 测评相关状态 =====
  const currentAssessment = ref<AssessmentData | null>(null)
  const questions = ref<AssessmentQuestion[]>([])
  const currentQuestionIndex = ref(0)
  const startTime = ref<Date | null>(null)
  
  // ===== UI相关状态 =====
  const loading = ref<LoadingState>('idle')
  const toasts = ref<Toast[]>([])
  const theme = ref<'light' | 'dark'>('light')
  const isMobile = ref(false)
  
  // ===== 支付相关状态 =====
  const paymentStatus = ref<PaymentStatus>('idle')
  const currentPaymentSession = ref<PaymentSession | null>(null)
  const paymentError = ref<string | null>(null)
  
  // ===== 用户相关状态 =====
  const sessionId = ref('')
  const consentGiven = ref(false)

  // ===== 计算属性 =====
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
  
  const isLoading = computed(() => loading.value === 'loading')
  const isDarkMode = computed(() => theme.value === 'dark')

  // ===== 测评相关方法 =====
  const initializeQuestions = async () => {
    try {
      questions.value = await ecrService.getQuestions()
    } catch (error) {
      console.error('题目初始化失败:', error)
      showError('题目加载失败')
    }
  }

  const createNewAssessment = async (): Promise<string> => {
    try {
      setLoading('loading')
      const assessment = await ecrService.createAssessment()
      currentAssessment.value = assessment
      currentQuestionIndex.value = 0
      startTime.value = new Date()
      setLoading('idle')
      showSuccess('测评已创建')
      return assessment.id
    } catch (error) {
      setLoading('error')
      showError('创建测评失败')
      throw error
    }
  }

  const loadAssessment = async (id: string): Promise<boolean> => {
    try {
      setLoading('loading')
      const assessment = await ecrService.getAssessment(id)
      if (assessment) {
        currentAssessment.value = assessment
        setLoading('idle')
        return true
      } else {
        setLoading('error')
        showError('测评不存在')
        return false
      }
    } catch (error) {
      setLoading('error')
      showError('加载测评失败')
      return false
    }
  }

  const saveCurrentResponse = async (questionIndex: number, response: number) => {
    if (!currentAssessment.value) return

    try {
      // 验证回答
      if (!ecrService.validateResponse(questionIndex + 1, response)) {
        showError('回答无效')
        return
      }

      // 更新回答
      currentAssessment.value.responses[questionIndex] = response
      
      // 保存到存储
      await ecrService.updateAssessment(currentAssessment.value)
      
      // 如果是最后一题且完成，显示成功消息
      if (isAssessmentComplete.value) {
        showSuccess('测评已完成！')
      }
    } catch (error) {
      console.error('保存回答失败:', error)
      showError('保存失败')
    }
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

  const hasAssessment = (id: string): boolean => {
    return ecrService.hasAssessment(id)
  }

  // ===== 支付相关方法 =====
  const initiatePayment = async (assessmentId: string): Promise<PaymentSession | null> => {
    try {
      paymentStatus.value = 'loading'
      paymentError.value = null
      showInfo('正在创建支付会话...')

      const session = await ecrService.createPaymentSession(assessmentId)
      currentPaymentSession.value = session
      paymentStatus.value = 'pending'
      
      return session
    } catch (error) {
      paymentStatus.value = 'error'
      paymentError.value = error instanceof Error ? error.message : '支付创建失败'
      showError(paymentError.value)
      return null
    }
  }

  const verifyPayment = async (sessionId: string) => {
    try {
      paymentStatus.value = 'loading'
      const result = await ecrService.verifyPayment(sessionId)
      
      if (result.success) {
        paymentStatus.value = 'success'
        showSuccess('支付成功！')
      } else {
        paymentStatus.value = 'error'
        paymentError.value = result.error || '支付验证失败'
        showError(paymentError.value)
      }
      
      return result
    } catch (error) {
      paymentStatus.value = 'error'
      paymentError.value = '支付验证失败'
      showError(paymentError.value)
      return { success: false, error: paymentError.value }
    }
  }

  const checkPaymentStatus = (assessmentId: string) => {
    return ecrService.checkPaymentStatus(assessmentId)
  }

  // ===== UI相关方法 =====
  const setLoading = (state: LoadingState) => {
    loading.value = state
  }

  const generateToastId = () => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const showToast = (message: string, type: NotificationType = 'info', duration = 3000) => {
    const toast: Toast = {
      id: generateToastId(),
      type,
      message,
      duration,
      createdAt: new Date()
    }

    toasts.value.unshift(toast)

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, duration)
    }

    return toast.id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const showSuccess = (message: string) => showToast(message, 'success')
  const showError = (message: string) => showToast(message, 'error', 5000)
  const showWarning = (message: string) => showToast(message, 'warning')
  const showInfo = (message: string) => showToast(message, 'info')

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('ecr_theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const detectMobile = () => {
    isMobile.value = window.innerWidth < 768
  }

  // ===== 用户相关方法 =====
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const startSession = () => {
    sessionId.value = generateSessionId()
    localStorage.setItem('ecr_session_id', sessionId.value)
  }

  const giveConsent = () => {
    consentGiven.value = true
    localStorage.setItem('ecr_consent_given', 'true')
  }

  const revokeConsent = () => {
    consentGiven.value = false
    localStorage.removeItem('ecr_consent_given')
    // 清除所有数据
    localStorage.clear()
  }

  // ===== 初始化方法 =====
  const init = async () => {
    // 初始化主题
    const savedTheme = localStorage.getItem('ecr_theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }

    // 初始化移动端检测
    detectMobile()
    window.addEventListener('resize', detectMobile)

    // 初始化会话
    const savedSessionId = localStorage.getItem('ecr_session_id')
    if (savedSessionId) {
      sessionId.value = savedSessionId
    } else {
      startSession()
    }

    // 初始化同意状态
    consentGiven.value = localStorage.getItem('ecr_consent_given') === 'true'

    // 初始化题目
    await initializeQuestions()

    // 清理过期数据
    ecrService.cleanupExpiredData()
  }

  return {
    // 状态
    currentAssessment,
    questions,
    currentQuestionIndex,
    loading,
    toasts,
    theme,
    isMobile,
    paymentStatus,
    currentPaymentSession,
    paymentError,
    sessionId,
    consentGiven,

    // 计算属性
    hasCurrentAssessment,
    currentProgress,
    isAssessmentComplete,
    currentQuestion,
    canGoNext,
    canGoPrevious,
    isLoading,
    isDarkMode,

    // 测评方法
    createNewAssessment,
    loadAssessment,
    saveCurrentResponse,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    hasAssessment,

    // 支付方法
    initiatePayment,
    verifyPayment,
    checkPaymentStatus,

    // UI方法
    setLoading,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    setTheme,
    toggleTheme,

    // 用户方法
    startSession,
    giveConsent,
    revokeConsent,

    // 初始化
    init
  }
})

// 导出便捷hook
export const useECR = useAppStore