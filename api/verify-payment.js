const Stripe = require('stripe')

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
})

// CORS头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

// JWT工具函数（简化版）
function generateAccessToken(assessmentId, sessionId) {
  const payload = {
    assessmentId,
    sessionId,
    type: 'detailed_report',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30天有效期
  }

  // 简化版JWT（实际项目中应该使用专业的JWT库）
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = Buffer.from(
    `${header}.${payloadStr}.${process.env.JWT_SECRET || 'default-secret'}`
  ).toString('base64url')

  return `${header}.${payloadStr}.${signature}`
}

module.exports = async (req, res) => {
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
    return res.status(200).json({ message: 'OK' })
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    })
  }

  // 设置CORS头部
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  try {
    // 验证环境变量
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Payment service is not properly configured'
      })
    }

    // 解析请求体
    const { sessionId } = req.body

    // 验证必需参数
    if (!sessionId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Session ID is required'
      })
    }

    // 验证sessionId格式
    if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Invalid session ID format'
      })
    }

    // 从Stripe获取支付会话信息
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer']
    })

    // 检查会话状态
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Payment session not found'
      })
    }

    // 获取评估ID
    const assessmentId = session.metadata?.assessment_id
    if (!assessmentId) {
      return res.status(400).json({
        error: 'Invalid session',
        message: 'Assessment ID not found in session metadata'
      })
    }

    // 检查支付状态
    const paymentStatus = session.payment_status
    const paymentIntent = session.payment_intent

    // 根据支付状态返回结果
    if (paymentStatus === 'paid' && paymentIntent?.status === 'succeeded') {
      // 支付成功
      const accessToken = generateAccessToken(assessmentId, sessionId)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30天后过期

      // 在实际项目中，这里应该将支付信息存储到数据库

      return res.status(200).json({
        success: true,
        sessionId,
        assessmentId,
        accessToken,
        expiresAt,
        paymentInfo: {
          amount: session.amount_total,
          currency: session.currency,
          paymentMethod: paymentIntent.payment_method_types?.[0],
          customerEmail: session.customer_details?.email,
          receiptUrl: paymentIntent.charges?.data?.[0]?.receipt_url
        }
      })
    } else if (paymentStatus === 'unpaid') {
      // 支付未完成
      return res.status(400).json({
        success: false,
        sessionId,
        assessmentId,
        error: 'Payment not completed',
        message: 'Payment has not been completed yet'
      })
    } else if (paymentStatus === 'no_payment_required') {
      // 无需支付（免费或已支付）
      return res.status(400).json({
        success: false,
        sessionId,
        assessmentId,
        error: 'No payment required',
        message: 'This session does not require payment'
      })
    } else {
      // 其他状态（失败、取消等）
      return res.status(400).json({
        success: false,
        sessionId,
        assessmentId,
        error: 'Payment failed',
        message: `Payment status: ${paymentStatus}, Intent status: ${paymentIntent?.status}`
      })
    }
  } catch (error) {
    // 处理Stripe特定错误
    if (error.name === 'StripeError') {
      if (error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid session',
          message: 'Invalid session ID or session not found'
        })
      }

      return res.status(400).json({
        success: false,
        error: 'Payment verification error',
        message: error.message,
        type: error.type,
        code: error.code
      })
    }

    // 处理其他错误
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify payment. Please try again later.'
    })
  }
}