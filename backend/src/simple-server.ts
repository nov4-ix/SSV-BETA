import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Son1kvers3 Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    online: true,
    services: {
      suno: 'connected',
      qwen: 'connected',
      pixel: 'active'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Son1kvers3 Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;