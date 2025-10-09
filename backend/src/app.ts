import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import routes from '@/api/routes';
import { errorMiddleware } from '@/api/middlewares/error.middleware';
import { requestLoggerMiddleware } from '@/api/middlewares/request-logger.middleware';
import { notFoundMiddleware } from '@/api/middlewares/not-found.middleware';
import { prisma } from '@/config/database.config';
import { redis } from '@/config/redis.config';

const app: Application = express();

// ============================================================================
// SECURITY MIDDLEWARES
// ============================================================================

app.use(helmet({
  contentSecurityPolicy: config.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================================
// PARSING MIDDLEWARES
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ============================================================================
// LOGGING
// ============================================================================

app.use(requestLoggerMiddleware);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: config.apiVersion,
  });
});

app.get('/health/ready', async (req: Request, res: Response) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    await redis.ping();
    
    res.json({
      status: 'ready',
      services: {
        database: 'connected',
        redis: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use(`/api/${config.apiVersion}`, routes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
