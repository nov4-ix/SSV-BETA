import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Son1kVers3 Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoints for frontend
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is healthy' });
});

// Generate endpoint (mock)
app.post('/api/v1/generate', (req, res) => {
  const { prompt, preset, title, tags, knobs } = req.body;
  
  console.log('Generation request:', { prompt, preset, title, tags, knobs });
  
  res.json({
    success: true,
    message: 'Generación enviada. Revisa tu Archivo.',
    taskId: `task_${Date.now()}`,
    status: 'processing'
  });
});

// Upload endpoint (mock)
app.post('/api/v1/upload', (req, res) => {
  console.log('Upload request received');
  
  res.json({
    success: true,
    message: 'Demo subida correctamente',
    fileId: `file_${Date.now()}`
  });
});

// Check APIs endpoint
app.get('/api/v1/integrations/check', (req, res) => {
  res.json({
    suno: { status: 'connected', version: '1.0.0' },
    bark: { status: 'connected', version: '1.0.0' },
    flux: { status: 'connected', version: '1.0.0' },
    nova: { status: 'connected', version: '1.0.0' }
  });
});

// Voices endpoint
app.get('/api/v1/voices', (req, res) => {
  res.json([
    { id: 'voice1', name: 'Luz', type: 'female' },
    { id: 'voice2', name: 'Sombra', type: 'male' },
    { id: 'voice3', name: 'Echo', type: 'female' },
    { id: 'voice4', name: 'Raíz', type: 'male' },
    { id: 'voice5', name: 'Nova', type: 'female' },
    { id: 'voice6', name: 'Banda', type: 'male' },
    { id: 'voice7', name: 'Perla', type: 'female' }
  ]);
});

// Archive endpoint
app.get('/api/v1/archive', (req, res) => {
  res.json({
    projects: [
      { id: '1', title: 'Mi Canción 1', createdAt: '2024-01-01', status: 'completed' },
      { id: '2', title: 'Mi Canción 2', createdAt: '2024-01-02', status: 'processing' },
      { id: '3', title: 'Mi Canción 3', createdAt: '2024-01-03', status: 'completed' }
    ]
  });
});

// Preview endpoint
app.post('/api/v1/preview', (req, res) => {
  res.json({
    success: true,
    previewUrl: 'https://example.com/preview.mp3',
    duration: 30
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Son1kVers3 Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api/v1`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
