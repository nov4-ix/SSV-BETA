import Redis from 'ioredis';
import { config } from '@/config';
import { logger } from '@/utils/logger';

class RedisClient {
  private static instance: Redis;
  
  static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
      
      this.instance.on('connect', () => {
        logger.info('✅ Redis connected successfully');
      });
      
      this.instance.on('error', (error) => {
        logger.error({ error }, 'Redis connection error');
      });
      
      this.instance.on('ready', () => {
        logger.info('Redis is ready to accept commands');
      });
    }
    
    return this.instance;
  }
  
  static async disconnect() {
    if (this.instance) {
      await this.instance.quit();
      logger.info('Redis disconnected');
    }
  }
}

export const redis = RedisClient.getInstance();
export const connectRedis = async () => RedisClient.getInstance();
export const disconnectRedis = async () => RedisClient.disconnect();
