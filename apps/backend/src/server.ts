/**
 * 🚀 SERVER - Servidor Principal del Backend
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './utils';
import { authMiddleware } from './api/middlewares/auth.middleware';
import { clientTrackingMiddleware } from './api/middlewares/client-tracking.middleware';
import { authController } from './api/controllers/auth.controller';
import { analyticsController } from './api/controllers/analytics.controller';
import { queueService } from './services/music/queue.service';

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
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

// CORS middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
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
app.get('/api/analytics/client/:fingerprint', analyticsController.getClientByFingerprint.bind(analyticsController));
app.get('/api/analytics/country/:country', analyticsController.getCountryAnalytics.bind(analyticsController));
app.get('/api/analytics/export', analyticsController.exportAnalytics.bind(analyticsController));

// Protected routes
app.use('/api/generations', authMiddleware.authenticate);
app.use('/api/users', authMiddleware.authenticate);
app.use('/api/admin', authMiddleware.requireAdmin);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their personal room`);
  });

  // Join chat room
  socket.on('join-chat-room', (roomId) => {
    socket.join(`chat-${roomId}`);
    logger.info(`User ${socket.id} joined chat room ${roomId}`);
  });

  // Leave chat room
  socket.on('leave-chat-room', (roomId) => {
    socket.leave(`chat-${roomId}`);
    logger.info(`User ${socket.id} left chat room ${roomId}`);
  });

  // Handle chat messages
  socket.on('chat-message', (data) => {
    const { roomId, message, userId } = data;
    
    // Broadcast message to room
    socket.to(`chat-${roomId}`).emit('chat-message', {
      id: generateId(),
      userId,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle generation status updates
  socket.on('subscribe-generation', (generationId) => {
    socket.join(`generation-${generationId}`);
    logger.info(`User ${socket.id} subscribed to generation ${generationId}`);
  });

  // Handle disconnection
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
const PORT = config.server.port;
const HOST = config.server.host;

server.listen(PORT, HOST, () => {
  logger.info(`🚀 Son1kVers3 Backend running on ${HOST}:${PORT}`);
  logger.info(`🌍 Environment: ${config.server.env}`);
  logger.info(`📊 Rate limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000 / 60} minutes`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close queue service
  await queueService.close();
  
  // Close server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  // Close queue service
  await queueService.close();
  
  // Close server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Export for testing
export { app, server, io };
