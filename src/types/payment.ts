// 支付状态类型
export type PaymentStatus = 'idle' | 'loading' | 'verifying' | 'success' | 'failed' | 'error'

// 支付会话接口
export interface PaymentSession {
  id: string
  assessmentId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'expired'
  stripeSessionId?: string
  url?: string
  createdAt: Date
  expiresAt: Date
}

// 支付结果接口
export interface PaymentResult {
  success: boolean
  sessionId: string
  assessmentId: string
  accessToken?: string
  expiresAt?: Date
  error?: string
}

// Stripe配置接口
export interface StripeConfig {
  publishableKey: string
  priceId: string
  successUrl: string
  cancelUrl: string
}

// 订单信息接口
export interface OrderInfo {
  id: string
  assessmentId: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  provider: 'stripe'
  providerId: string
  createdAt: Date
  paidAt?: Date
}
