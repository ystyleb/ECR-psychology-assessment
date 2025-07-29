function handler(req, res) {
  return res.status(200).json({ message: 'Hello World', timestamp: new Date() })
}

module.exports = handler