const Stripe = require('stripe')

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil'
})

async function handler(req, res) {
  // 设置CORS头部
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 验证环境变量
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' })
    }

    const { assessmentId, successUrl, cancelUrl } = req.body

    // 基本验证
    if (!assessmentId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    // 创建简化的Stripe Checkout会话
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cny',
            product_data: {
              name: 'ECR Report'
            },
            unit_amount: 1990
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        assessment_id: assessmentId
      }
    })

    return res.status(200).json({
      success: true,
      session: {
        id: session.id,
        url: session.url,
        payment_status: session.payment_status
      }
    })

  } catch (error) {
    console.error('Payment error:', error)
    return res.status(500).json({
      error: 'Payment creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

module.exports = handler