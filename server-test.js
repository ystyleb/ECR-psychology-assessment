import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入API处理函数
import createPaymentHandler from './api/create-payment.js';
import verifyPaymentHandler from './api/verify-payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API路由
app.post('/api/create-payment', (req, res) => {
  createPaymentHandler(req, res);
});

app.post('/api/verify-payment', (req, res) => {
  verifyPaymentHandler(req, res);
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// SPA路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 测试页面: http://localhost:${PORT}/test-payment.html`);
  console.log(`🌐 主应用: http://localhost:${PORT}`);
  console.log(`💊 健康检查: http://localhost:${PORT}/api/health`);
});