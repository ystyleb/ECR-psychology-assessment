import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PaymentSession, PaymentStatus, PaymentResult } from '@/types/payment'
import { paymentService } from '@/services/paymentService'
import { useUIStore } from './ui'

export const usePaymentStore = defineStore('payment', () => {
  // 状态
  const paymentStatus = ref<PaymentStatus>('idle')
  const currentSession = ref<PaymentSession | null>(null)
  const lastPaymentResult = ref<PaymentResult | null>(null)
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  // UI store引用
  const uiStore = useUIStore()

  // 计算属性
  const hasActiveSession = computed(() => {
    return (
      currentSession.value !== null &&
      currentSession.value.status === 'pending' &&
      currentSession.value.expiresAt > new Date()
    )
  })

  const isSessionExpired = computed(() => {
    return currentSession.value !== null && currentSession.value.expiresAt <= new Date()
  })

  // 方法
  /**
   * 发起支付流程
   */
  const initiatePayment = async (assessmentId: string): Promise<PaymentSession | null> => {
    try {
      // 重置状态
      error.value = null
      paymentStatus.value = 'loading'
      isProcessing.value = true

      uiStore.showInfo('正在创建支付会话...')

      // 检查是否已有访问权限
      const existingAccess = await paymentService.checkExistingAccess(assessmentId)
      if (existingAccess.hasAccess) {
        uiStore.showSuccess('您已经购买了详细报告')
        paymentStatus.value = 'success'
        return null
      }

      // 创建支付会话
      const session = await paymentService.createPaymentSession(assessmentId)
      currentSession.value = session

      console.log('Payment session created:', session)

      // 更新状态
      paymentStatus.value = 'loading'
      uiStore.showSuccess('支付会话已创建，正在跳转...')

      // 跳转到Stripe Checkout
      await paymentService.redirectToCheckout(session.stripeSessionId!)

      return session
    } catch (error) {
      console.error('Payment initiation failed:', error)
      handlePaymentError(error as Error)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 验证支付结果
   */
  const verifyPayment = async (sessionId: string): Promise<boolean> => {
    try {
      error.value = null
      paymentStatus.value = 'verifying'
      isProcessing.value = true

      uiStore.showInfo('正在验证支付结果...')

      // 调用支付服务验证
      const result = await paymentService.verifyPayment(sessionId)
      lastPaymentResult.value = result

      if (result.success) {
        paymentStatus.value = 'success'
        uiStore.showSuccess('支付验证成功！')

        // 清理当前会话
        if (currentSession.value?.stripeSessionId === sessionId) {
          currentSession.value.status = 'completed'
        }

        console.log('Payment verified successfully:', result)
        return true
      } else {
        paymentStatus.value = 'failed'
        error.value = result.error || '支付验证失败'
        uiStore.showError(result.error || '支付验证失败')
        return false
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      handlePaymentError(error as Error)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 检查支付状态
   */
  const checkPaymentStatus = async (sessionId: string) => {
    try {
      const status = await paymentService.checkPaymentStatus(sessionId)

      if (status.isPaid) {
        paymentStatus.value = 'success'
        return 'paid'
      } else if (status.isExpired) {
        paymentStatus.value = 'failed'
        error.value = '支付会话已过期'
        return 'expired'
      } else {
        return status.status
      }
    } catch (error) {
      console.error('Failed to check payment status:', error)
      return 'unknown'
    }
  }

  /**
   * 检查报告是否已解锁
   */
  const isReportUnlocked = (assessmentId: string): boolean => {
    return paymentService.isReportUnlocked(assessmentId)
  }

  /**
   * 获取访问权限信息
   */
  const getAccessInfo = async (assessmentId: string) => {
    try {
      return await paymentService.checkExistingAccess(assessmentId)
    } catch (error) {
      console.error('Failed to get access info:', error)
      return { hasAccess: false }
    }
  }

  /**
   * 获取订单历史
   */
  const getOrderHistory = async () => {
    try {
      return await paymentService.getOrderHistory()
    } catch (error) {
      console.error('Failed to get order history:', error)
      return []
    }
  }

  /**
   * 获取产品信息
   */
  const getProductInfo = () => {
    return paymentService.getProductInfo()
  }

  /**
   * 格式化金额
   */
  const formatAmount = (amount: number, currency = 'CNY'): string => {
    return paymentService.formatAmount(amount, currency)
  }

  /**
   * 重置支付状态
   */
  const resetPaymentState = () => {
    paymentStatus.value = 'idle'
    currentSession.value = null
    lastPaymentResult.value = null
    error.value = null
    isProcessing.value = false
  }

  /**
   * 取消当前支付
   */
  const cancelPayment = () => {
    if (currentSession.value) {
      currentSession.value.status = 'expired'
    }
    paymentStatus.value = 'idle'
    error.value = null
    uiStore.showInfo('支付已取消')
  }

  /**
   * 重试支付
   */
  const retryPayment = async (assessmentId: string) => {
    resetPaymentState()
    return await initiatePayment(assessmentId)
  }

  /**
   * 处理支付错误
   */
  const handlePaymentError = (err: Error) => {
    paymentStatus.value = 'error'
    error.value = err.message

    let userMessage = '支付过程中出现错误'

    if (err.message.includes('Report already purchased')) {
      userMessage = '您已经购买了详细报告'
      paymentStatus.value = 'success'
    } else if (err.message.includes('Configuration error')) {
      userMessage = '支付配置错误，请联系客服'
    } else if (err.message.includes('Invalid assessment')) {
      userMessage = '测评信息无效，请重新进行测评'
    } else if (err.message.includes('Network')) {
      userMessage = '网络连接错误，请检查网络后重试'
    } else if (err.message.includes('session')) {
      userMessage = '支付会话创建失败，请重试'
    }

    uiStore.showError(userMessage)
    console.error('Payment error:', err)
  }

  /**
   * 清理过期数据
   */
  const cleanupExpiredData = async () => {
    try {
      await paymentService.cleanupExpiredData()
    } catch (error) {
      console.error('Failed to cleanup expired data:', error)
    }
  }

  /**
   * 检查会话有效性
   */
  const validateSession = () => {
    if (currentSession.value && isSessionExpired.value) {
      currentSession.value.status = 'expired'
      if (paymentStatus.value === 'loading') {
        paymentStatus.value = 'failed'
        error.value = '支付会话已过期'
      }
    }
  }

  // 初始化时清理过期数据
  cleanupExpiredData()

  return {
    // 状态
    paymentStatus,
    currentSession,
    lastPaymentResult,
    isProcessing,
    error,

    // 计算属性
    hasActiveSession,
    isSessionExpired,

    // 方法
    initiatePayment,
    verifyPayment,
    checkPaymentStatus,
    isReportUnlocked,
    getAccessInfo,
    getOrderHistory,
    getProductInfo,
    formatAmount,
    resetPaymentState,
    cancelPayment,
    retryPayment,
    handlePaymentError,
    cleanupExpiredData,
    validateSession
  }
})
