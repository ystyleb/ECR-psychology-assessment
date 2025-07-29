import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

// CORS头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
    return res.status(200).json({ message: 'OK' })
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).setHeader('Allow', 'GET').json({
      error: 'Method not allowed',
      message: 'Only GET requests are allowed'
    })
  }

  // 设置CORS头部
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  try {
    // 验证环境变量
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured')
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Payment service is not properly configured'
      })
    }

    // 获取查询参数
    const { session_id: sessionId, assessment_id: assessmentId } = req.query

    // 验证必需参数
    if (!sessionId && !assessmentId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Either session_id or assessment_id is required'
      })
    }

    let sessions: Stripe.Checkout.Session[] = []

    if (sessionId) {
      // 通过session_id查询单个会话
      if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Invalid session ID format'
        })
      }

      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['payment_intent']
        })
        sessions = [session]
      } catch (error) {
        if (error instanceof Stripe.errors.StripeInvalidRequestError) {
          return res.status(404).json({
            error: 'Session not found',
            message: 'Payment session not found'
          })
        }
        throw error
      }
    } else if (assessmentId) {
      // 通过assessment_id查询相关会话
      if (typeof assessmentId !== 'string' || assessmentId.length < 10) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Invalid assessment ID format'
        })
      }

      // 查询最近24小时内的会话（Stripe API限制）
      const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000)

      const sessionsResponse = await stripe.checkout.sessions.list({
        created: { gte: twentyFourHoursAgo },
        limit: 100,
        expand: ['data.payment_intent']
      })

      // 过滤出匹配的会话
      sessions = sessionsResponse.data.filter(
        session => session.metadata?.assessment_id === assessmentId
      )
    }

    // 如果没有找到会话
    if (sessions.length === 0) {
      return res.status(404).json({
        error: 'No sessions found',
        message: 'No payment sessions found for the given criteria',
        sessions: []
      })
    }

    // 处理会话数据
    const processedSessions = sessions.map(session => {
      const paymentIntent = session.payment_intent as Stripe.PaymentIntent

      return {
        id: session.id,
        assessmentId: session.metadata?.assessment_id,
        status: session.status,
        paymentStatus: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
        created: session.created,
        expiresAt: session.expires_at,
        url: session.url,
        customerEmail: session.customer_details?.email,
        paymentIntent: paymentIntent
          ? {
              id: paymentIntent.id,
              status: paymentIntent.status,
              clientSecret: paymentIntent.client_secret
            }
          : null,
        metadata: session.metadata
      }
    })

    // 对于单个会话查询，返回详细信息
    if (sessionId) {
      const session = processedSessions[0]

      // 记录查询
      console.log('Payment status query:', {
        sessionId,
        status: session.paymentStatus,
        assessmentId: session.assessmentId,
        timestamp: new Date().toISOString()
      })

      return res.status(200).json({
        success: true,
        session,
        status: session.paymentStatus,
        isPaid: session.paymentStatus === 'paid',
        isExpired: session.expiresAt ? Date.now() / 1000 > session.expiresAt : false
      })
    } else {
      // 对于assessment_id查询，返回会话列表
      const paidSessions = processedSessions.filter(s => s.paymentStatus === 'paid')
      const pendingSessions = processedSessions.filter(s => s.paymentStatus === 'unpaid')

      console.log('Payment sessions query:', {
        assessmentId,
        totalSessions: processedSessions.length,
        paidSessions: paidSessions.length,
        pendingSessions: pendingSessions.length,
        timestamp: new Date().toISOString()
      })

      return res.status(200).json({
        success: true,
        assessmentId,
        sessions: processedSessions,
        summary: {
          total: processedSessions.length,
          paid: paidSessions.length,
          pending: pendingSessions.length,
          hasPaidSession: paidSessions.length > 0
        }
      })
    }
  } catch (error) {
    console.error('Payment status query failed:', error)

    // 处理Stripe特定错误
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: 'Payment service error',
        message: error.message,
        type: error.type,
        code: error.code
      })
    }

    // 处理其他错误
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to query payment status. Please try again later.'
    })
  }
}

module.exports = handler
