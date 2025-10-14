/**
 * 🌌 SON1KVERS3 BACKEND - Configuration
 */

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  HOST: process.env.HOST || '0.0.0.0',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://son1kvers3:son1kvers3_password@localhost:5432/son1kvers3',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-at-least-32-characters-long',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-at-least-32-characters-long',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET || '',
  TIKTOK_CLIENT_ID: process.env.TIKTOK_CLIENT_ID || '',
  TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET || '',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Suno AI
  SUNO_API_KEY: process.env.SUNO_API_KEY || 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJQUFJpaEQ5S2xBZHhCNkxWWkxweEpuRjc3ZHJjRm1hUyIsImV4cCI6MTc2MDI3Mzk5Mn0.VawUyvM6Zqik2fdRSHchm60_gXs4VUcFpc5Mw00K9Ew',
  SUNO_BASE_URL: process.env.SUNO_BASE_URL || 'https://ai.imgkits.com/suno',
  SUNO_POLLING_URL: process.env.SUNO_POLLING_URL || 'https://usa.imgkits.com/node-api/suno',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['audio/mpeg', 'audio/wav', 'audio/mp3'],

  // Email
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@son1kvers3.com',

  // Storage
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',

  // Feature Flags
  ENABLE_REGISTRATION: process.env.ENABLE_REGISTRATION === 'true' || true,
  ENABLE_OAUTH: process.env.ENABLE_OAUTH === 'true' || true,
  ENABLE_STRIPE: process.env.ENABLE_STRIPE === 'true' || false,
  ENABLE_SUNO: process.env.ENABLE_SUNO === 'true' || true,
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true' || true,
  ENABLE_CLIENT_TRACKING: process.env.ENABLE_CLIENT_TRACKING === 'true' || true,
} as const;

export type Config = typeof config;
