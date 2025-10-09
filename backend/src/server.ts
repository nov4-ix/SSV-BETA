import app from './app';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { connectDatabase, disconnectDatabase } from '@/config/database.config';
import { connectRedis, disconnectRedis } from '@/config/redis.config';

async function bootstrap() {
  try {
    // Connect to services
    await connectDatabase();
    await connectRedis();
    
    // Start server
    const server = app.listen(config.port, () => {
      logger.info({
        port: config.port,
        environment: config.nodeEnv,
        version: config.apiVersion,
      }, '🚀 Son1kvers3 Backend Server Started');
    });
    
    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutdown signal received, closing server gracefully...');
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await disconnectDatabase();
          await disconnectRedis();
          logger.info('All services disconnected');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.fatal({ error }, 'Uncaught exception');
      shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason) => {
      logger.fatal({ reason }, 'Unhandled rejection');
      shutdown('unhandledRejection');
    });
    
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
