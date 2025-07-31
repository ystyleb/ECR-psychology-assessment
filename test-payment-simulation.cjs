const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  
  if (pathname === '/api/test' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Local payment simulation API is working!',
      timestamp: new Date().toISOString(),
      method: req.method
    }));
    
  } else if (pathname === '/api/create-payment' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      console.log('模拟 create-payment 调用:', data);
      
      const { assessmentId } = data;
      
      // 模拟Stripe会话
      const mockSession = {
        id: `cs_test_mock_session_${  Date.now()}`,
        url: `https://checkout.stripe.com/pay/cs_test_mock_session_${Date.now()}`,
        amount_total: 1990,
        currency: 'cny'
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        session: {
          id: mockSession.id,
          assessmentId,
          amount: 1990,
          currency: 'cny',
          status: 'pending',
          stripeSessionId: mockSession.id,
          url: mockSession.url,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        },
        redirectUrl: mockSession.url
      }));
    });
    
  } else if (pathname === '/api/verify-payment' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      console.log('模拟 verify-payment 调用:', data);
      
      const { sessionId } = data;
      
      // 模拟JWT token
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token_${  Date.now()}`;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        sessionId,
        assessmentId: 'test_assessment_id',
        accessToken: mockToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentInfo: {
          amount: 1990,
          currency: 'cny', 
          paymentMethod: 'card',
          customerEmail: 'test@example.com'
        }
      }));
    });
    
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 支付模拟服务器运行在 http://localhost:${PORT}`);
  console.log('📋 可用端点:');
  console.log('  GET  /api/test');
  console.log('  POST /api/create-payment');
  console.log('  POST /api/verify-payment');
  console.log('\n💡 使用方法:');
  console.log('1. 在前端应用中将API_BASE_URL设置为 http://localhost:3001');
  console.log('2. 测试支付流程，API调用将被模拟处理');
});