const Stripe = require('stripe')

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil'
})

// CORS头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
  'Access-Control-Max-Age': '86400'
}

// 处理支付成功事件
async function handlePaymentSucceeded(session) {
  const assessmentId = session.metadata?.assessment_id

  if (!assessmentId) {
    console.error('Assessment ID not found in session metadata:', session.id)
    return
  }

  // 在这里可以更新数据库，记录支付成功
  console.log('Payment succeeded:', {
    sessionId: session.id,
    assessmentId,
    amount: session.amount_total,
    currency: session.currency,
    customerEmail: session.customer_details?.email,
    timestamp: new Date().toISOString()
  })

  // 在实际项目中，你可能想要：
  // 1. 更新数据库中的支付状态
  // 2. 发送确认邮件
  // 3. 解锁详细报告访问权限
  // 4. 记录到分析系统
}

// 处理支付失败事件
async function handlePaymentFailed(session) {
  const assessmentId = session.metadata?.assessment_id

  console.log('Payment failed:', {
    sessionId: session.id,
    assessmentId,
    timestamp: new Date().toISOString()
  })

  // 在实际项目中，你可能想要：
  // 1. 记录失败原因
  // 2. 发送失败通知
  // 3. 提供重试机制
}

// 处理会话过期事件
async function handleSessionExpired(session) {
  const assessmentId = session.metadata?.assessment_id

  console.log('Session expired:', {
    sessionId: session.id,
    assessmentId,
    timestamp: new Date().toISOString()
  })

  // 在实际项目中，你可能想要：
  // 1. 清理过期的会话数据
  // 2. 通知用户会话已过期
}

// 处理退款事件
async function handleChargeRefunded(charge) {
  console.log('Charge refunded:', {
    chargeId: charge.id,
    amount: charge.amount_refunded,
    currency: charge.currency,
    timestamp: new Date().toISOString()
  })

  // 在实际项目中，你可能想要：
  // 1. 撤销报告访问权限
  // 2. 更新支付状态
  // 3. 发送退款确认
}

async function handler(req, res) {
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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Webhook secret is not configured'
      })
    }

    // 获取原始请求体
    let buf
    if (req.body && Buffer.isBuffer(req.body)) {
      buf = req.body
    } else if (typeof req.body === 'string') {
      buf = Buffer.from(req.body)
    } else {
      // 对于Vercel，通常原始请求体会在req.body中
      buf = Buffer.from(JSON.stringify(req.body || ''))
    }
    const sig = req.headers['stripe-signature']

    if (!sig) {
      console.error('Missing stripe-signature header')
      return res.status(400).json({
        error: 'Missing signature',
        message: 'stripe-signature header is required'
      })
    }

    // 验证webhook签名
    let event
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return res.status(400).json({
        error: 'Invalid signature',
        message: 'Webhook signature verification failed'
      })
    }

    // 记录收到的事件
    console.log('Received webhook event:', {
      type: event.type,
      id: event.id,
      created: event.created,
      livemode: event.livemode
    })

    // 处理不同类型的事件
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        // 检查是否是支付模式的会话
        if (session.mode === 'payment' && session.payment_status === 'paid') {
          await handlePaymentSucceeded(session)
        }
        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object
        await handlePaymentSucceeded(session)
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object
        await handlePaymentFailed(session)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object
        await handleSessionExpired(session)
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object
        console.log('Dispute created:', {
          chargeId: dispute.charge,
          amount: dispute.amount,
          reason: dispute.reason,
          status: dispute.status
        })
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        await handleChargeRefunded(charge)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('Payment intent succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        console.log('Payment intent failed:', {
          id: paymentIntent.id,
          last_payment_error: paymentIntent.last_payment_error?.message
        })
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      eventType: event.type,
      eventId: event.id
    })
  } catch (error) {
    console.error('Webhook processing failed:', error)

    // 返回错误响应
    return res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
      message: 'An error occurred while processing the webhook'
    })
  }
}

module.exports = handler
