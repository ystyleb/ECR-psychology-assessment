// 支付服务
import type { PaymentService, PaymentSession, PaymentResult, OrderInfo } from '@/types'
import { storageService } from './storageService'

interface RefundResult {
  success: boolean
  refundId: string
  amount: number
  reason?: string
}

class StripePaymentService implements PaymentService {
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  private readonly sessionsKey = 'ecr_payment_sessions'
  private readonly ordersKey = 'ecr_payment_orders'

  // 创建支付会话
  async createPaymentSession(assessmentId: string): Promise<PaymentSession> {
    try {
      const sessionId = this.generateSessionId()
      const session: PaymentSession = {
        id: sessionId,
        assessmentId,
        amount: 1999, // 19.99元，以分为单位
        currency: 'CNY',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
      }

      // 保存会话到本地存储
      await this.savePaymentSession(session)

      // 在实际项目中，这里应该调用后端API创建Stripe支付会话
      // const response = await fetch(`${this.baseUrl}/api/create-payment`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ assessmentId, amount: session.amount })
      // })

      return session
    } catch (error) {
      console.error('Failed to create payment session:', error)
      throw new Error('Failed to create payment session')
    }
  }

  // 获取支付会话
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
      console.error('Failed to get payment session:', error)
      return null
    }
  }

  // 验证支付
  async verifyPayment(sessionId: string): Promise<PaymentResult> {
    try {
      const session = await this.getPaymentSession(sessionId)

      if (!session) {
        return {
          success: false,
          sessionId,
          assessmentId: '',
          error: 'Payment session not found'
        }
      }

      if (session.status === 'expired') {
        return {
          success: false,
          sessionId,
          assessmentId: session.assessmentId,
          error: 'Payment session has expired'
        }
      }

      // 在实际项目中，这里应该调用后端API验证支付状态
      // const response = await fetch(`${this.baseUrl}/api/verify-payment`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ sessionId })
      // })

      // 模拟支付成功
      const isSuccess = Math.random() > 0.1 // 90%成功率用于演示

      if (isSuccess) {
        // 更新会话状态
        session.status = 'completed'
        await this.savePaymentSession(session)

        // 创建订单记录
        const order: OrderInfo = {
          id: this.generateOrderId(),
          assessmentId: session.assessmentId,
          amount: session.amount,
          currency: session.currency,
          status: 'paid',
          provider: 'stripe',
          providerId: sessionId,
          createdAt: session.createdAt,
          paidAt: new Date()
        }
        await this.saveOrder(order)

        return {
          success: true,
          sessionId,
          assessmentId: session.assessmentId,
          accessToken: this.generateAccessToken(session.assessmentId),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年有效期
        }
      } else {
        session.status = 'failed'
        await this.savePaymentSession(session)

        return {
          success: false,
          sessionId,
          assessmentId: session.assessmentId,
          error: 'Payment verification failed'
        }
      }
    } catch (error) {
      console.error('Failed to verify payment:', error)
      return {
        success: false,
        sessionId,
        assessmentId: '',
        error: 'Payment verification error'
      }
    }
  }

  // 获取订单历史
  async getOrderHistory(): Promise<OrderInfo[]> {
    try {
      const orders = this.getAllOrders()
      return Array.from(orders.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )
    } catch (error) {
      console.error('Failed to get order history:', error)
      return []
    }
  }

  // 根据ID获取订单
  async getOrderById(orderId: string): Promise<OrderInfo | null> {
    try {
      const orders = this.getAllOrders()
      return orders.get(orderId) || null
    } catch (error) {
      console.error('Failed to get order by id:', error)
      return null
    }
  }

  // 请求退款
  async requestRefund(orderId: string, reason?: string): Promise<RefundResult> {
    try {
      const order = await this.getOrderById(orderId)

      if (!order) {
        throw new Error('Order not found')
      }

      if (order.status !== 'paid') {
        throw new Error('Order is not eligible for refund')
      }

      // 在实际项目中，这里应该调用后端API处理退款
      // const response = await fetch(`${this.baseUrl}/api/request-refund`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ orderId, reason })
      // })

      // 模拟退款处理
      const refundId = this.generateRefundId()

      // 更新订单状态
      order.status = 'refunded'
      await this.saveOrder(order)

      return {
        success: true,
        refundId,
        amount: order.amount,
        reason
      }
    } catch (error) {
      console.error('Failed to request refund:', error)
      throw new Error('Failed to request refund')
    }
  }

  // 生成支付URL（用于重定向到Stripe）
  generatePaymentUrl(sessionId: string): string {
    const successUrl = `${window.location.origin}/payment/success?session_id=${sessionId}`
    const cancelUrl = `${window.location.origin}/payment/cancel?session_id=${sessionId}`

    // 在实际项目中，这应该是真实的Stripe Payment Link
    return `https://checkout.stripe.com/pay/${sessionId}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`
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
      console.error('Failed to get payment sessions:', error)
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
      console.error('Failed to get orders:', error)
      return new Map()
    }
  }

  // 私有方法：生成会话ID
  private generateSessionId(): string {
    return `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 私有方法：生成订单ID
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 私有方法：生成退款ID
  private generateRefundId(): string {
    return `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 私有方法：生成访问令牌
  private generateAccessToken(assessmentId: string): string {
    const payload = {
      assessmentId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
    }

    // 在实际项目中应该使用JWT或其他安全的令牌格式
    return btoa(JSON.stringify(payload))
  }

  // 清理过期会话
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const sessions = this.getAllPaymentSessions()
      const now = new Date()
      let hasChanges = false

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
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error)
    }
  }
}

// 创建单例实例
export const paymentService = new StripePaymentService()

// 导出类型和实例
export type { PaymentService, RefundResult }
export default paymentService
