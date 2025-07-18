import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PaymentSession, PaymentStatus } from '@/types/payment'

export const usePaymentStore = defineStore('payment', () => {
  // 状态
  const paymentStatus = ref<PaymentStatus>('idle')
  const currentSession = ref<PaymentSession | null>(null)
  const unlockedReports = ref<Set<string>>(new Set())

  // 方法
  const initiatePayment = async (assessmentId: string) => {
    try {
      paymentStatus.value = 'loading'

      // 这里应该调用后端API创建支付会话
      // 暂时使用模拟的Stripe Payment Link
      const paymentUrl = generatePaymentUrl(assessmentId)

      // 跳转到支付页面
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Payment initiation failed:', error)
      paymentStatus.value = 'error'
    }
  }

  const verifyPayment = async (_sessionId: string): Promise<boolean> => {
    try {
      paymentStatus.value = 'verifying'

      // 这里应该调用后端API验证支付状态
      // 暂时返回true模拟成功
      const isSuccess = true

      if (isSuccess) {
        paymentStatus.value = 'success'
        return true
      } else {
        paymentStatus.value = 'failed'
        return false
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      paymentStatus.value = 'error'
      return false
    }
  }

  const unlockReport = (assessmentId: string) => {
    unlockedReports.value.add(assessmentId)
    saveUnlockedReports()
  }

  const isReportUnlocked = (assessmentId: string): boolean => {
    return unlockedReports.value.has(assessmentId)
  }

  const generatePaymentUrl = (assessmentId: string): string => {
    // 这里应该使用真实的Stripe Payment Link
    // 暂时返回一个模拟URL
    const baseUrl = 'https://buy.stripe.com/test_payment_link'
    const successUrl = `${window.location.origin}/payment/success?assessment_id=${assessmentId}`
    const cancelUrl = `${window.location.origin}/payment/cancel?assessment_id=${assessmentId}`

    return `${baseUrl}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`
  }

  const saveUnlockedReports = () => {
    const data = Array.from(unlockedReports.value)
    localStorage.setItem('ecr_unlocked_reports', JSON.stringify(data))
  }

  const loadUnlockedReports = () => {
    const data = localStorage.getItem('ecr_unlocked_reports')
    if (data) {
      try {
        const reports = JSON.parse(data)
        unlockedReports.value = new Set(reports)
      } catch (error) {
        console.error('Failed to load unlocked reports:', error)
      }
    }
  }

  // 初始化时加载已解锁的报告
  loadUnlockedReports()

  return {
    // 状态
    paymentStatus,
    currentSession,
    unlockedReports,

    // 方法
    initiatePayment,
    verifyPayment,
    unlockReport,
    isReportUnlocked
  }
})
