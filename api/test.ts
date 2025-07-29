import type { VercelRequest, VercelResponse } from '@vercel/node'

export = async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env_check: {
      has_stripe_key: !!process.env.STRIPE_SECRET_KEY,
      stripe_key_prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7)
    }
  })
}