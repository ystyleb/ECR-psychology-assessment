// Vercel API健康检查端点
// 测试CommonJS模块导出
module.exports = (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'CORS preflight OK' });
  }
  
  // 返回API状态
  res.status(200).json({ 
    message: 'ECR API is working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    version: '2.0.0',
    environment: 'production'
  });
};