import rateLimit from 'express-rate-limit';
import { redis } from '@/config/redis.config';
import { config } from '@/config';
import { Request } from 'express';

// Redis store for distributed rate limiting
class RedisStore {
  private prefix = 'rate-limit:';
  
  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    const prefixedKey = this.prefix + key;
    const ttl = config.rateLimit.windowMs / 1000;
    
    const hits = await redis.incr(prefixedKey);
    
    if (hits === 1) {
      await redis.expire(prefixedKey, ttl);
    }
    
    const ttlRemaining = await redis.ttl(prefixedKey);
    const resetTime = new Date(Date.now() + ttlRemaining * 1000);
    
    return { totalHits: hits, resetTime };
  }
  
  async decrement(key: string): Promise<void> {
    await redis.decr(this.prefix + key);
  }
  
  async resetKey(key: string): Promise<void> {
    await redis.del(this.prefix + key);
  }
}

const redisStore = new RedisStore();

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.userId || req.ip || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Rate limit exceeded',
        code: 429,
        retryAfter: res.getHeader('Retry-After'),
      },
    });
  },
});

// Strict limiter for music generation (expensive operations)
export const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request) => {
    return req.userId || req.ip || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Generation limit exceeded. Please wait before creating more tracks.',
        code: 429,
        retryAfter: res.getHeader('Retry-After'),
      },
    });
  },
});

// Auth rate limiter (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    return req.ip || 'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts. Please try again later.',
        code: 429,
      },
    });
  },
});
