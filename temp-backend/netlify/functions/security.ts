// 🛡️ SON1KVERSE SECURITY & RATE LIMITING
// Sistema de seguridad avanzado

import { Handler } from '@netlify/functions';

// 🚦 Rate Limiting por IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// ⚙️ Configuración de Rate Limiting
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100, // 100 requests por ventana
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

// 🔒 Headers de Seguridad
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dashscope.aliyuncs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://dashscope.aliyuncs.com https://son1kverse.supabase.co https://ai.imgkits.com https://usa.imgkits.com;"
};

// 🚦 Función de Rate Limiting
export const checkRateLimit = (ip: string): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.windowMs;
  
  // Limpiar entradas expiradas
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }

  const current = rateLimitMap.get(ip);
  
  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now });
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    };
  }

  if (current.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - current.count,
    resetTime: current.resetTime
  };
};

// 🔍 Función de validación de entrada
export const validateInput = (data: any, schema: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} es requerido`);
    }
    
    if (value !== undefined && rules.type) {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} debe ser un string`);
      }
      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${key} debe ser un número`);
      }
      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${key} debe ser un boolean`);
      }
    }
    
    if (value !== undefined && rules.minLength && value.length < rules.minLength) {
      errors.push(`${key} debe tener al menos ${rules.minLength} caracteres`);
    }
    
    if (value !== undefined && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${key} debe tener máximo ${rules.maxLength} caracteres`);
    }
    
    if (value !== undefined && rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${key} no cumple con el formato requerido`);
    }
  }
  
  return { valid: errors.length === 0, errors };
};

// 🛡️ Middleware de seguridad
export const securityMiddleware = (handler: Handler): Handler => {
  return async (event, context) => {
    // 🚦 Rate Limiting
    const clientIP = event.headers['x-forwarded-for'] || 
                    event.headers['x-real-ip'] || 
                    context.clientContext?.identity?.url || 
                    'unknown';
    
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return {
        statusCode: 429,
        headers: {
          ...SECURITY_HEADERS,
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        },
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        })
      };
    }

    // 🔒 Headers de seguridad
    const secureHeaders = {
      ...SECURITY_HEADERS,
      'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString()
    };

    try {
      const result = await handler(event, context);
      
      return {
        ...result,
        headers: {
          ...secureHeaders,
          ...result.headers
        }
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        headers: secureHeaders,
        body: JSON.stringify({
          error: 'Error interno del servidor',
          message: 'Algo salió mal. Intenta de nuevo más tarde.'
        })
      };
    }
  };
};

// 📊 Esquemas de validación
export const VALIDATION_SCHEMAS = {
  sunoGenerate: {
    prompt: { required: true, type: 'string', minLength: 1, maxLength: 500 },
    style: { required: false, type: 'string', maxLength: 50 },
    title: { required: false, type: 'string', maxLength: 100 },
    customMode: { required: false, type: 'boolean' },
    instrumental: { required: false, type: 'boolean' },
    lyrics: { required: false, type: 'string', maxLength: 2000 },
    gender: { required: false, type: 'string', maxLength: 20 }
  },
  qwenLyrics: {
    prompt: { required: true, type: 'string', minLength: 1, maxLength: 500 },
    style: { required: true, type: 'string', maxLength: 50 },
    genre: { required: true, type: 'string', maxLength: 50 },
    mood: { required: true, type: 'string', maxLength: 50 }
  },
  pixelAssistant: {
    message: { required: true, type: 'string', minLength: 1, maxLength: 1000 },
    context: { required: true, type: 'string', maxLength: 200 },
    userId: { required: false, type: 'string', maxLength: 100 }
  }
};

// 🎯 Handler principal de seguridad
export const handler: Handler = async (event, context) => {
  return securityMiddleware(async (event, context) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Sistema de seguridad activo',
          data: {
            rateLimit: RATE_LIMIT_CONFIG,
            securityHeaders: Object.keys(SECURITY_HEADERS),
            timestamp: new Date().toISOString()
          }
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  })(event, context);
};
