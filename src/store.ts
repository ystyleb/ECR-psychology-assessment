// 统一状态管理 - 合并所有stores为单一文件
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  AssessmentData, 
  AssessmentQuestion, 
  PaymentSession,
  PaymentStatus,
  LoadingState,
  NotificationType 
} from '@/types'
import { ecrService } from '@/services'
import { debugLog } from '@/utils/debugLog'

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
    debugLog.log('🏪 Store: createNewAssessment called')
    
    try {
      setLoading('loading')
      debugLog.log('🏪 Store: Set loading state')
      
      const assessment = await ecrService.createAssessment()
      debugLog.log('🏪 Store: Assessment created by service:', assessment)
      
      currentAssessment.value = assessment
      currentQuestionIndex.value = 0
      startTime.value = new Date()
      
      debugLog.log('🏪 Store: Updated store state, current assessment:', currentAssessment.value)
      
      setLoading('idle')
      showSuccess('测评已创建')
      
      debugLog.log('🏪 Store: Returning assessment ID:', assessment.id)
      return assessment.id
    } catch (error) {
      console.error('🏪 Store: Error in createNewAssessment:', error)
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
      
      // 如果是最后一题且完成，自动计算结果
      if (isAssessmentComplete.value && !currentAssessment.value.basicResult) {
        await calculateAndSaveResult()
      }
    } catch (error) {
      console.error('保存回答失败:', error)
      showError('保存失败')
    }
  }

  // 计算并保存测评结果
  const calculateAndSaveResult = async () => {
    debugLog.log('📊 Store: calculateAndSaveResult called')
    debugLog.log('📊 Store: currentAssessment exists:', !!currentAssessment.value)
    debugLog.log('📊 Store: isAssessmentComplete:', isAssessmentComplete.value)
    
    if (!currentAssessment.value || !isAssessmentComplete.value) {
      debugLog.log('📊 Store: Conditions not met, aborting calculation')
      return
    }

    try {
      debugLog.log('📊 Store: Calculating result...')
      const result = ecrService.calculateResult(currentAssessment.value.responses)
      debugLog.log('📊 Store: Calculated result:', result)
      
      currentAssessment.value.basicResult = result
      debugLog.log('📊 Store: Set basicResult on assessment')
      
      // 保存更新的评估数据
      debugLog.log('📊 Store: Saving assessment to storage...')
      await ecrService.updateAssessment(currentAssessment.value)
      debugLog.log('📊 Store: Assessment saved successfully')
      
      showSuccess('测评结果已生成！')
      return result
    } catch (error) {
      console.error('📊 Store: 计算结果失败:', error)
      showError('计算结果失败')
      throw error
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
    debugLog.log('🔍 Store: hasAssessment called with ID:', id)
    debugLog.log('🔍 Store: Current assessment:', currentAssessment.value)
    
    const result = ecrService.hasAssessment(id)
    debugLog.log('🔍 Store: ecrService.hasAssessment result:', result)
    
    // 如果当前正有一个评估并且ID匹配，也应该返回true
    const hasCurrentAssessment = currentAssessment.value?.id === id
    debugLog.log('🔍 Store: Current assessment ID matches:', hasCurrentAssessment)
    
    const finalResult = result || hasCurrentAssessment
    debugLog.log('🔍 Store: Final hasAssessment result:', finalResult)
    
    return finalResult
  }

  // ===== 开发者模式方法 =====
  const quickCompleteAssessment = async (style: 'secure' | 'anxious' | 'avoidant' | 'disorganized' = 'secure') => {
    debugLog.log('🚀 Store: quickCompleteAssessment called with style:', style)
    if (!currentAssessment.value) {
      debugLog.log('❌ Store: No current assessment, aborting quickComplete')
      return
    }
    
    try {
      setLoading('loading')
      debugLog.log('⚡ Store: Starting quick complete with style:', style)
      
      // 根据指定的依恋类型生成模拟答案
      const mockResponses = generateMockResponses(style)
      debugLog.log('📊 Store: Generated mock responses:', mockResponses)
      currentAssessment.value.responses = mockResponses
      
      // 保存更新的评估
      await ecrService.updateAssessment(currentAssessment.value)
      debugLog.log('💾 Store: Saved assessment with mock responses')
      
      // 计算并保存结果
      await calculateAndSaveResult()
      debugLog.log('✅ Store: Quick complete finished successfully')
      
      setLoading('idle')
      showSuccess(`快速完成测评 - ${style} 类型`)
    } catch (error) {
      console.error('❌ Store: Quick complete failed:', error)
      setLoading('error')
      showError('快速完成失败')
      throw error
    }
  }

  // 生成模拟回答数据
  const generateMockResponses = (style: 'secure' | 'anxious' | 'avoidant' | 'disorganized'): number[] => {
    const responses = new Array(36).fill(0)
    
    // 焦虑依恋题目: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
    // 回避依恋题目: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]  
    // 反向计分题目: [6, 9, 15, 19, 22, 25, 27, 30, 31, 33, 36]
    
    const anxiousItems = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34] // 转为0-based index
    const avoidantItems = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
    const reverseItems = [5, 8, 14, 18, 21, 24, 26, 29, 30, 32, 35] // 转为0-based index
    
    switch (style) {
      case 'secure':
        // 安全型: 低焦虑 + 低回避
        anxiousItems.forEach(i => {
          responses[i] = reverseItems.includes(i) ? 
            Math.floor(Math.random() * 2) + 5 : // 反向题给高分(5-6)变成低分(2-3)
            Math.floor(Math.random() * 2) + 2   // 正向题给低分(2-3)
        })
        avoidantItems.forEach(i => {
          responses[i] = reverseItems.includes(i) ? 
            Math.floor(Math.random() * 2) + 5 : // 反向题给高分(5-6)变成低分(2-3)
            Math.floor(Math.random() * 2) + 2   // 正向题给低分(2-3)
        })
        break
        
      case 'anxious':
        // 焦虑型: 高焦虑 + 低回避
        anxiousItems.forEach(i => {
          responses[i] = reverseItems.includes(i) ? 
            Math.floor(Math.random() * 2) + 2 : // 反向题给低分(2-3)变成高分(5-6)
            Math.floor(Math.random() * 2) + 5   // 正向题给高分(5-6)
        })
        avoidantItems.forEach(i => {
          responses[i] = reverseItems.includes(i) ? 
            Math.floor(Math.random() * 2) + 5 : // 反向题给高分(5-6)变成低分(2-3)
            Math.floor(Math.random() * 2) + 2   // 正向题给低分(2-3)
        })
        break
        
      case 'avoidant':
        // 回避型: 低焦虑 + 高回避
        anxiousItems.forEach(i => {
          responses[i] = reverseItems.includes(i) ? 
            Math.floor(Math.random() * 2) + 5 : // 反向题给高分(5-6)变成低分(2-3)
            Math.floor(Math.random() * 2) + 2   // 正向题给低分(2-3)
        })
        avoidantItems.forEach(i => {
          responses[i] = reverseItems.includes(i) ? 
            Math.floor(Math.random() * 2) + 2 : // 反向题给低分(2-3)变成高分(5-6)
            Math.floor(Math.random() * 2) + 5   // 正向题给高分(5-6)
        })
        break
        
      case 'disorganized':
        // 混乱型: 高焦虑 + 高回避
        anxiousItems.forEach(i => {
          responses[i] = reverseItems.includes(i) ? 
            Math.floor(Math.random() * 2) + 2 : // 反向题给低分(2-3)变成高分(5-6)
            Math.floor(Math.random() * 2) + 5   // 正向题给高分(5-6)
        })
        avoidantItems.forEach(i => {
          responses[i] = reverseItems.includes(i) ? 
            Math.floor(Math.random() * 2) + 2 : // 反向题给低分(2-3)变成高分(5-6)
            Math.floor(Math.random() * 2) + 5   // 正向题给高分(5-6)
        })
        break
    }
    
    return responses
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
    calculateAndSaveResult,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    hasAssessment,
    quickCompleteAssessment,

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