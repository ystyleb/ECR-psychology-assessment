// Stripe支付服务
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import type { PaymentSession, PaymentResult, StripeConfig } from '@/types'

// Stripe配置
const STRIPE_CONFIG: StripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  priceId: import.meta.env.VITE_STRIPE_PRICE_ID || '',
  successUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/payment/cancel`
}

// Stripe实例（延迟加载）
let stripeInstance: Stripe | null = null

class StripeService {
  private stripe: Stripe | null = null

  /**
   * 初始化Stripe实例
   */
  async initialize(): Promise<Stripe | null> {
    if (this.stripe) {
      return this.stripe
    }

    if (!STRIPE_CONFIG.publishableKey) {
      console.error('Stripe publishable key is not configured')
      return null
    }

    try {
      this.stripe = await loadStripe(STRIPE_CONFIG.publishableKey)
      stripeInstance = this.stripe
      return this.stripe
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
      return null
    }
  }

  /**
   * 获取Stripe实例
   */
  async getStripe(): Promise<Stripe | null> {
    if (stripeInstance) {
      return stripeInstance
    }
    return await this.initialize()
  }

  /**
   * 创建支付会话
   */
  async createPaymentSession(assessmentId: string): Promise<PaymentSession> {
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assessmentId,
          priceId: STRIPE_CONFIG.priceId,
          successUrl: STRIPE_CONFIG.successUrl,
          cancelUrl: STRIPE_CONFIG.cancelUrl
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create payment session')
      }

      const data = await response.json()
      return data.session
    } catch (error) {
      console.error('Failed to create payment session:', error)
      throw error
    }
  }

  /**
   * 重定向到Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.getStripe()
    if (!stripe) {
      throw new Error('Stripe is not initialized')
    }

    const { error } = await stripe.redirectToCheckout({ sessionId })
    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * 验证支付结果
   */
  async verifyPayment(sessionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to verify payment')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to verify payment:', error)
      throw error
    }
  }

  /**
   * 检查支付状态
   */
  async checkPaymentStatus(sessionId: string): Promise<string> {
    try {
      const response = await fetch(`/api/payment-status?session_id=${sessionId}`)

      if (!response.ok) {
        throw new Error('Failed to check payment status')
      }

      const data = await response.json()
      return data.status
    } catch (error) {
      console.error('Failed to check payment status:', error)
      return 'unknown'
    }
  }

  /**
   * 获取支付历史
   */
  async getPaymentHistory(assessmentId: string): Promise<PaymentSession[]> {
    try {
      const response = await fetch(`/api/payment-history?assessment_id=${assessmentId}`)

      if (!response.ok) {
        throw new Error('Failed to get payment history')
      }

      const data = await response.json()
      return data.sessions || []
    } catch (error) {
      console.error('Failed to get payment history:', error)
      return []
    }
  }

  /**
   * 验证配置
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!STRIPE_CONFIG.publishableKey) {
      errors.push('VITE_STRIPE_PUBLISHABLE_KEY is not configured')
    }

    if (!STRIPE_CONFIG.priceId) {
      errors.push('VITE_STRIPE_PRICE_ID is not configured')
    }

    if (!STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
      errors.push('Invalid Stripe publishable key format')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 格式化金额
   */
  formatAmount(amount: number, currency: string = 'CNY'): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount / 100)
  }

  /**
   * 获取产品信息
   */
  getProductInfo() {
    return {
      name: 'ECR详细报告',
      description: '获取完整的依恋风格分析报告，包括个性特征、成长建议和关系兼容性分析',
      price: 1990, // 19.9元，以分为单位
      currency: 'CNY',
      features: [
        '详细的依恋风格分析',
        '个性特征深度解读',
        '专业成长建议',
        '关系兼容性分析',
        '永久访问权限'
      ]
    }
  }

  /**
   * 生成支付元数据
   */
  generateMetadata(assessmentId: string, userId?: string) {
    return {
      assessment_id: assessmentId,
      user_id: userId || 'anonymous',
      product_type: 'detailed_report',
      created_at: new Date().toISOString(),
      version: '1.0'
    }
  }
}

// 创建单例实例
export const stripeService = new StripeService()

// 导出类型和实例
export type { StripeService }
export default stripeService
