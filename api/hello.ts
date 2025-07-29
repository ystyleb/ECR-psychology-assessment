import type { VercelRequest, VercelResponse } from '@vercel/node'

function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ message: 'Hello World', timestamp: new Date() })
}

module.exports = handler