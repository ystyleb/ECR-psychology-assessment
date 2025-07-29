// 支付服务 - 集成Stripe API
import type { PaymentSession, PaymentResult, OrderInfo } from '@/types'
import { storageService } from './storageService'
import { stripeService } from './stripeService'
import logger from '@/utils/logger'

interface RefundResult {
  success: boolean
  refundId: string
  amount: number
  reason?: string
}

// 支付会话数据接口
interface PaymentSessionData {
  status: string
  isPaid: boolean
  isExpired: boolean
  session?: PaymentSession
}

// 访问令牌数据接口
interface AccessTokenData {
  token: string
  sessionId: string
  expiresAt: Date
  createdAt: Date
}

class StripePaymentService {
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  private readonly sessionsKey = 'ecr_payment_sessions'
  private readonly ordersKey = 'ecr_payment_orders'
  private readonly accessTokensKey = 'ecr_access_tokens'

  /**
   * 创建支付会话
   */
  async createPaymentSession(assessmentId: string): Promise<PaymentSession> {
    try {
      // 验证评估ID
      if (!assessmentId || typeof assessmentId !== 'string') {
        throw new Error('Invalid assessment ID')
      }

      // 检查是否已经有有效的支付
      const existingAccess = await this.checkExistingAccess(assessmentId)
      if (existingAccess.hasAccess) {
        throw new Error('Report already purchased and accessible')
      }

      // 调用API创建支付会话
      const response = await fetch(`${this.baseUrl}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assessmentId,
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          metadata: {
            assessment_id: assessmentId,
            product_type: 'detailed_report',
            created_at: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create payment session')
      }

      const data = await response.json()
      const session = data.session

      // 保存会话到本地存储
      await this.savePaymentSession(session)

      // 记录支付尝试
      logger.log('Payment session created:', {
        sessionId: session.id,
        assessmentId,
        amount: session.amount,
        currency: session.currency
      })

      return session
    } catch (error) {
      logger.error('Failed to create payment session:', error)
      throw error
    }
  }

  /**
   * 重定向到Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      const stripe = await stripeService.getStripe()
      if (!stripe) {
        throw new Error('Stripe is not initialized')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      logger.error('Failed to redirect to checkout:', error)
      throw error
    }
  }

  /**
   * 验证支付结果
   */
  async verifyPayment(sessionId: string): Promise<PaymentResult> {
    try {
      // 调用API验证支付
      const response = await fetch(`${this.baseUrl}/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          sessionId,
          assessmentId: error.assessmentId || '',
          error: error.message || 'Payment verification failed'
        }
      }

      const result = await response.json()

      if (result.success) {
        // 保存访问令牌
        await this.saveAccessToken(result.assessmentId, {
          token: result.accessToken,
          sessionId,
          expiresAt: new Date(result.expiresAt),
          createdAt: new Date()
        })

        // 更新本地会话状态
        const session = await this.getPaymentSession(sessionId)
        if (session) {
          session.status = 'completed'
          await this.savePaymentSession(session)
        }

        // 创建订单记录
        const order: OrderInfo = {
          id: this.generateOrderId(),
          assessmentId: result.assessmentId,
          amount: result.paymentInfo?.amount || 1990,
          currency: result.paymentInfo?.currency || 'cny',
          status: 'paid',
          provider: 'stripe',
          providerId: sessionId,
          createdAt: new Date(),
          paidAt: new Date()
        }
        await this.saveOrder(order)

        logger.log('Payment verified successfully:', {
          sessionId,
          assessmentId: result.assessmentId,
          amount: order.amount
        })
      }

      return result
    } catch (error) {
      logger.error('Failed to verify payment:', error)
      return {
        success: false,
        sessionId,
        assessmentId: '',
        error: 'Payment verification error'
      }
    }
  }

  /**
   * 检查支付状态
   */
  async checkPaymentStatus(sessionId: string): Promise<PaymentSessionData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payment-status?session_id=${sessionId}`)

      if (!response.ok) {
        throw new Error('Failed to check payment status')
      }

      return await response.json()
    } catch (error) {
      logger.error('Failed to check payment status:', error)
      return {
        status: 'unknown',
        isPaid: false,
        isExpired: false
      }
    }
  }

  /**
   * 检查现有访问权限
   */
  async checkExistingAccess(assessmentId: string): Promise<{
    hasAccess: boolean
    accessToken?: string
    expiresAt?: Date
  }> {
    try {
      const accessTokens = this.getAllAccessTokens()
      const tokenInfo = accessTokens.get(assessmentId)

      if (!tokenInfo) {
        return { hasAccess: false }
      }

      // 检查是否过期
      if (tokenInfo.expiresAt < new Date()) {
        // 删除过期的令牌
        accessTokens.delete(assessmentId)
        await this.saveAllAccessTokens(accessTokens)
        return { hasAccess: false }
      }

      return {
        hasAccess: true,
        accessToken: tokenInfo.token,
        expiresAt: tokenInfo.expiresAt
      }
    } catch (error) {
      logger.error('Failed to check existing access:', error)
      return { hasAccess: false }
    }
  }

  /**
   * 检查报告是否已解锁
   */
  isReportUnlocked(assessmentId: string): boolean {
    try {
      const accessTokens = this.getAllAccessTokens()
      const tokenInfo = accessTokens.get(assessmentId)

      if (!tokenInfo) {
        return false
      }

      // 检查是否过期
      return tokenInfo.expiresAt > new Date()
    } catch (error) {
      logger.error('Failed to check report unlock status:', error)
      return false
    }
  }

  /**
   * 获取支付会话
   */
  async getPaymentSession(sessionId: string): Promise<PaymentSession | null> {
    try {
      const sessions = this.getAllPaymentSessions()
      const session = sessions.get(sessionId)

      if (!session) {
        return null
      }

      // 检查会话是否过期
      if (session.expiresAt < new Date()) {
        session.status = 'expired'
        await this.savePaymentSession(session)
      }

      return session
    } catch (error) {
      logger.error('Failed to get payment session:', error)
      return null
    }
  }

  /**
   * 获取订单历史
   */
  async getOrderHistory(): Promise<OrderInfo[]> {
    try {
      const orders = this.getAllOrders()
      return Array.from(orders.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )
    } catch (error) {
      logger.error('Failed to get order history:', error)
      return []
    }
  }

  /**
   * 根据ID获取订单
   */
  async getOrderById(orderId: string): Promise<OrderInfo | null> {
    try {
      const orders = this.getAllOrders()
      return orders.get(orderId) || null
    } catch (error) {
      logger.error('Failed to get order by id:', error)
      return null
    }
  }

  /**
   * 请求退款
   */
  async requestRefund(orderId: string, reason?: string): Promise<RefundResult> {
    try {
      const order = await this.getOrderById(orderId)

      if (!order) {
        throw new Error('Order not found')
      }

      if (order.status !== 'paid') {
        throw new Error('Order is not eligible for refund')
      }

      // 调用API处理退款
      const response = await fetch(`${this.baseUrl}/api/request-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, reason })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to request refund')
      }

      const result = await response.json()

      // 更新订单状态
      order.status = 'refunded'
      await this.saveOrder(order)

      // 删除访问令牌
      const accessTokens = this.getAllAccessTokens()
      accessTokens.delete(order.assessmentId)
      await this.saveAllAccessTokens(accessTokens)

      return {
        success: true,
        refundId: result.refundId,
        amount: order.amount,
        reason
      }
    } catch (error) {
      logger.error('Failed to request refund:', error)
      throw error
    }
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData(): Promise<void> {
    try {
      const now = new Date()
      let hasChanges = false

      // 清理过期会话
      const sessions = this.getAllPaymentSessions()
      for (const [, session] of sessions) {
        if (session.expiresAt < now && session.status === 'pending') {
          session.status = 'expired'
          hasChanges = true
        }
      }

      if (hasChanges) {
        const sessionArray = Array.from(sessions.entries())
        storageService.setEncryptedItem(this.sessionsKey, sessionArray)
      }

      // 清理过期访问令牌
      const accessTokens = this.getAllAccessTokens()
      const originalSize = accessTokens.size

      for (const [assessmentId, tokenInfo] of accessTokens) {
        if (tokenInfo.expiresAt < now) {
          accessTokens.delete(assessmentId)
        }
      }

      if (accessTokens.size !== originalSize) {
        await this.saveAllAccessTokens(accessTokens)
      }
    } catch (error) {
      logger.error('Failed to cleanup expired data:', error)
    }
  }

  // 私有方法：保存支付会话
  private async savePaymentSession(session: PaymentSession): Promise<void> {
    const sessions = this.getAllPaymentSessions()
    sessions.set(session.id, session)

    const sessionArray = Array.from(sessions.entries())
    storageService.setEncryptedItem(this.sessionsKey, sessionArray)
  }

  // 私有方法：获取所有支付会话
  private getAllPaymentSessions(): Map<string, PaymentSession> {
    try {
      const sessionArray = storageService.getEncryptedItem<[string, PaymentSession][]>(
        this.sessionsKey
      )
      return sessionArray ? new Map(sessionArray) : new Map()
    } catch (error) {
      logger.error('Failed to get payment sessions:', error)
      return new Map()
    }
  }

  // 私有方法：保存订单
  private async saveOrder(order: OrderInfo): Promise<void> {
    const orders = this.getAllOrders()
    orders.set(order.id, order)

    const orderArray = Array.from(orders.entries())
    storageService.setEncryptedItem(this.ordersKey, orderArray)
  }

  // 私有方法：获取所有订单
  private getAllOrders(): Map<string, OrderInfo> {
    try {
      const orderArray = storageService.getEncryptedItem<[string, OrderInfo][]>(this.ordersKey)
      return orderArray ? new Map(orderArray) : new Map()
    } catch (error) {
      logger.error('Failed to get orders:', error)
      return new Map()
    }
  }

  // 私有方法：保存访问令牌
  private async saveAccessToken(
    assessmentId: string,
    tokenInfo: {
      token: string
      sessionId: string
      expiresAt: Date
      createdAt: Date
    }
  ): Promise<void> {
    const accessTokens = this.getAllAccessTokens()
    accessTokens.set(assessmentId, tokenInfo)
    await this.saveAllAccessTokens(accessTokens)
  }

  // 私有方法：获取所有访问令牌
  private getAllAccessTokens(): Map<string, AccessTokenData> {
    try {
      const tokenArray = storageService.getEncryptedItem<[string, AccessTokenData][]>(
        this.accessTokensKey
      )
      if (!tokenArray) return new Map()

      // 转换日期字符串为Date对象
      const tokenMap = new Map<string, AccessTokenData>()
      for (const [key, value] of tokenArray) {
        tokenMap.set(key, {
          ...value,
          expiresAt: new Date(value.expiresAt),
          createdAt: new Date(value.createdAt)
        })
      }
      return tokenMap
    } catch (error) {
      logger.error('Failed to get access tokens:', error)
      return new Map()
    }
  }

  // 私有方法：保存所有访问令牌
  private async saveAllAccessTokens(accessTokens: Map<string, AccessTokenData>): Promise<void> {
    const tokenArray = Array.from(accessTokens.entries())
    storageService.setEncryptedItem(this.accessTokensKey, tokenArray)
  }

  // 私有方法：生成订单ID
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
   * 格式化金额
   */
  formatAmount(amount: number, currency: string = 'CNY'): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount / 100)
  }
}

// 创建单例实例
export const paymentService = new StripePaymentService()

// 导出类型和实例
export type { RefundResult }
export default paymentService
