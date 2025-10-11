import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  S3_BUCKET_NAME: z.string().optional(),
  
  // CORS
  CORS_ORIGIN: z.string().transform(s => s.split(',')),
  
  // AI
  AI_MODEL_ENDPOINT: z.string().url().optional(),
  AI_API_KEY: z.string().optional(),
  MAX_GENERATION_DURATION: z.string().transform(Number).default('300'),
  
  // Suno AI
  SUNO_ENDPOINT: z.string().url().optional(),
  SUNO_API_KEY: z.string().optional(),
  
  // Bark TTS
  BARK_ENDPOINT: z.string().url().optional(),
  BARK_API_KEY: z.string().optional(),
  
  // So-VITS Clone
  SOVITS_ENDPOINT: z.string().url().optional(),
  SOVITS_API_KEY: z.string().optional(),
  
  // Flux Artwork
  FLUX_ENDPOINT: z.string().url().optional(),
  FLUX_API_KEY: z.string().optional(),
  
  // Marketing
  NOVA_ENDPOINT: z.string().url().optional(),
  NOVA_API_KEY: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  database: {
    url: env.DATABASE_URL,
  },
  
  redis: {
    url: env.REDIS_URL,
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    s3BucketName: env.S3_BUCKET_NAME,
  },
  
  cors: {
    origin: env.CORS_ORIGIN,
  },
  
  ai: {
    endpoint: env.AI_MODEL_ENDPOINT,
    apiKey: env.AI_API_KEY,
    maxGenerationDuration: env.MAX_GENERATION_DURATION,
    
    // Suno AI
    sunoEndpoint: env.SUNO_ENDPOINT,
    sunoApiKey: env.SUNO_API_KEY,
    
    // Bark TTS
    barkEndpoint: env.BARK_ENDPOINT,
    barkApiKey: env.BARK_API_KEY,
    
    // So-VITS Clone
    soVITSEndpoint: env.SOVITS_ENDPOINT,
    soVITSApiKey: env.SOVITS_API_KEY,
    
    // Flux Artwork
    fluxEndpoint: env.FLUX_ENDPOINT,
    fluxApiKey: env.FLUX_API_KEY,
  },
  
  marketing: {
    novaEndpoint: env.NOVA_ENDPOINT,
    novaApiKey: env.NOVA_API_KEY,
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;
