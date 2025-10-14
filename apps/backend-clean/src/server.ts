/**
 * 🌌 SON1KVERS3 BACKEND - Main Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './utils/errors';
import { authController } from './api/controllers/auth.controller';
import { analyticsController } from './api/controllers/analytics.controller';
import { clientTrackingMiddleware } from './api/middlewares/client-tracking.middleware';

// Create Express app
const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Client tracking middleware (track every request)
app.use(clientTrackingMiddleware.trackClient.bind(clientTrackingMiddleware));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip} - Client: ${req.clientInfo?.browserFingerprint || 'Unknown'}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Son1kVers3 Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    clientInfo: req.clientInfo ? {
      fingerprint: req.clientInfo.browserFingerprint,
      country: req.clientInfo.country,
      isNewClient: req.clientInfo.isNewClient,
      tokensContributed: req.clientInfo.tokensContributed,
    } : null,
  });
});

// API routes
app.use('/api/auth', authController);

// Analytics routes (public for client tracking)
app.get('/api/analytics/clients', analyticsController.getClientAnalytics.bind(analyticsController));
app.get('/api/analytics/tokens', analyticsController.getTokenAnalytics.bind(analyticsController));
app.get('/api/analytics/tiers', analyticsController.getTierComparison.bind(analyticsController));
app.get('/api/analytics/overview', analyticsController.getSystemOverview.bind(analyticsController));
app.get('/api/analytics/daily', analyticsController.getDailyStats.bind(analyticsController));

// Suno API endpoints
app.post('/api/suno-generate', async (req, res) => {
  try {
    const { prompt, style, title, customMode, instrumental, lyrics, gender } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
      });
    }

    // Simulate Suno API call
    const sunoResponse = {
      success: true,
      data: {
        songs: [
          {
            id: `song_${Date.now()}`,
            title: title || 'Generated Song',
            tags: style || 'pop',
            duration: 30,
            audio_url: 'https://example.com/audio.mp3',
            stream_audio_url: 'https://example.com/audio.mp3',
            image_url: 'https://example.com/image.jpg',
            lyrics: lyrics || 'Generated lyrics...',
            created_at: new Date().toISOString(),
          },
        ],
      },
      message: 'Music generated successfully',
    };

    res.json(sunoResponse);
  } catch (error) {
    logger.error('Suno Generate Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

app.get('/api/suno-health', (req, res) => {
  res.json({
    success: true,
    message: 'Suno AI service is healthy',
    timestamp: new Date().toISOString(),
    status: 'online',
    version: '1.0.0',
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.info(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    logger.info(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
const PORT = config.PORT || 3001;
const HOST = config.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  logger.info(`🌌 Son1kVers3 Backend running on ${HOST}:${PORT}`);
  logger.info(`📊 Environment: ${config.NODE_ENV}`);
  logger.info(`🔗 CORS Origin: ${config.CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export { app, io };
