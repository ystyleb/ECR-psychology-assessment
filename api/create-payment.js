const Stripe = require('stripe')

// 初始化Stripe（延迟初始化，确保使用清理后的key）
let stripe = null

const getStripeInstance = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    
    // 清理环境变量
    const cleanedSecretKey = secretKey.trim().replace(/[\r\n\t]/g, '')
    console.log('Initializing Stripe with cleaned key, length:', cleanedSecretKey.length)
    
    stripe = new Stripe(cleanedSecretKey, {
      apiVersion: '2023-10-16'
    })
  }
  return stripe
}

// CORS头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
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
      console.error('STRIPE_SECRET_KEY is not configured')
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Payment service is not properly configured'
      })
    }

    // 调试环境变量
    const secretKey = process.env.STRIPE_SECRET_KEY
    console.log('Debug - Secret key length:', secretKey.length)
    console.log('Debug - Secret key starts with:', secretKey.substring(0, 10))
    console.log('Debug - Secret key ends with:', secretKey.substring(secretKey.length - 10))
    console.log('Debug - Secret key char codes (first 20):', secretKey.substring(0, 20).split('').map(c => c.charCodeAt(0)))
    
    // 清理环境变量（移除可能的空白字符）
    const cleanedSecretKey = secretKey.trim().replace(/[\r\n\t]/g, '')
    console.log('Debug - Cleaned key length:', cleanedSecretKey.length)
    console.log('Debug - Keys are equal:', secretKey === cleanedSecretKey)

    // 解析请求体
    const { assessmentId, successUrl, cancelUrl, metadata } = req.body

    // 验证必需参数
    if (!assessmentId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Assessment ID is required'
      })
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Success and cancel URLs are required'
      })
    }

    // 验证assessmentId格式（简单验证）
    if (typeof assessmentId !== 'string' || assessmentId.length < 10) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Invalid assessment ID format'
      })
    }

    // 验证URL格式
    try {
      new URL(successUrl)
      new URL(cancelUrl)
    } catch {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Invalid URL format'  
      })
    }

    // 生成支付会话元数据
    const sessionMetadata = {
      assessment_id: assessmentId,
      product_type: 'detailed_report',
      created_at: new Date().toISOString(),
      version: '1.0',
      ...metadata
    }

    // 创建Stripe Checkout会话
    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cny',
            product_data: {
              name: 'ECR详细报告',
              description: '获取完整的依恋风格分析报告，包括个性特征、成长建议和关系兼容性分析',
            },
            unit_amount: 1990 // ¥19.90，以分为单位
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&assessment_id=${assessmentId}`,
      cancel_url: `${cancelUrl}?assessment_id=${assessmentId}`,
      metadata: sessionMetadata,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30分钟后过期
      allow_promotion_codes: true, // 允许优惠券
      billing_address_collection: 'auto',
      customer_creation: 'if_required',
      payment_intent_data: {
        metadata: sessionMetadata,
        description: `ECR详细报告 - 测评ID: ${assessmentId}`
      }
    })

    // 记录支付会话
    console.log('Payment session created successfully:', {
      sessionId: session.id,
      assessmentId,
      amount: 1990,
      currency: 'cny',
      status: 'pending',
      createdAt: new Date().toISOString()
    })

    // 返回成功响应
    return res.status(200).json({
      success: true,
      session: {
        id: session.id,
        assessmentId,
        amount: 1990,
        currency: 'cny',
        status: 'pending',
        stripeSessionId: session.id,
        url: session.url,
        createdAt: new Date(),
        expiresAt: new Date(session.expires_at * 1000)
      },
      redirectUrl: session.url
    })
  } catch (error) {
    console.error('Payment session creation failed:', error)

    // 处理Stripe特定错误
    if (error.name === 'StripeError') {
      return res.status(400).json({
        error: 'Payment error',
        message: error.message,
        type: error.type,
        code: error.code
      })
    }

    // 处理其他错误
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create payment session. Please try again later.'
    })
  }
}