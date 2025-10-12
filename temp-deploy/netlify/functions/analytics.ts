// 📊 SON1KVERSE ANALYTICS SYSTEM
// Sistema completo de métricas y analytics

import { Handler } from '@netlify/functions';

// 🎯 Analytics Global State
const analytics = {
  totalGenerations: 0,
  avgGenerationTime: 0,
  activeUsers: 0,
  tokensRotation: {
    valid: 5,
    invalid: 0,
    totalUses: 0
  },
  functions: {
    suno: { calls: 0, errors: 0, avgTime: 0 },
    qwen: { calls: 0, errors: 0, avgTime: 0 },
    pixel: { calls: 0, errors: 0, avgTime: 0 },
    sanctuary: { calls: 0, errors: 0, avgTime: 0 },
    nova: { calls: 0, errors: 0, avgTime: 0 }
  },
  performance: {
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0,
    responseTime: 0
  },
  users: {
    total: 0,
    active: 0,
    newToday: 0,
    retention: 0
  },
  revenue: {
    totalTokens: 0,
    usedTokens: 0,
    remainingTokens: 0,
    conversionRate: 0
  }
};

// 🎵 Función para registrar generación musical
export const recordMusicGeneration = (duration: number, success: boolean) => {
  analytics.totalGenerations++;
  analytics.avgGenerationTime = 
    (analytics.avgGenerationTime * (analytics.totalGenerations - 1) + duration) / analytics.totalGenerations;
  
  if (success) {
    analytics.functions.suno.calls++;
  } else {
    analytics.functions.suno.errors++;
  }
};

// 🤖 Función para registrar uso de IA
export const recordAIUsage = (functionName: string, duration: number, success: boolean) => {
  const func = analytics.functions[functionName as keyof typeof analytics.functions];
  if (func) {
    if (success) {
      func.calls++;
      func.avgTime = (func.avgTime * (func.calls - 1) + duration) / func.calls;
    } else {
      func.errors++;
    }
  }
};

// 🔄 Función para registrar rotación de tokens
export const recordTokenRotation = (valid: boolean) => {
  analytics.tokensRotation.totalUses++;
  if (valid) {
    analytics.tokensRotation.valid++;
  } else {
    analytics.tokensRotation.invalid++;
  }
};

// 👤 Función para registrar usuarios
export const recordUserActivity = (isNew: boolean = false) => {
  analytics.users.active++;
  if (isNew) {
    analytics.users.total++;
    analytics.users.newToday++;
  }
};

// 💰 Función para registrar métricas de revenue
export const recordRevenueMetrics = (tokensUsed: number, tokensRemaining: number) => {
  analytics.revenue.usedTokens += tokensUsed;
  analytics.revenue.remainingTokens = tokensRemaining;
  analytics.revenue.totalTokens = analytics.revenue.usedTokens + analytics.revenue.remainingTokens;
  analytics.revenue.conversionRate = 
    (analytics.revenue.usedTokens / analytics.revenue.totalTokens) * 100;
};

// 📈 Handler principal de analytics
export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      // 📊 Retornar métricas completas
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            ...analytics,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: '1.0.0'
          }
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { action, data } = body;

      // 🎵 Registrar generación musical
      if (action === 'music_generation') {
        recordMusicGeneration(data.duration, data.success);
      }

      // 🤖 Registrar uso de IA
      if (action === 'ai_usage') {
        recordAIUsage(data.function, data.duration, data.success);
      }

      // 🔄 Registrar rotación de tokens
      if (action === 'token_rotation') {
        recordTokenRotation(data.valid);
      }

      // 👤 Registrar actividad de usuario
      if (action === 'user_activity') {
        recordUserActivity(data.isNew);
      }

      // 💰 Registrar métricas de revenue
      if (action === 'revenue_metrics') {
        recordRevenueMetrics(data.tokensUsed, data.tokensRemaining);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Métricas actualizadas correctamente',
          data: analytics
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message
      })
    };
  }
};
