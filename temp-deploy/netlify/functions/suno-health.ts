/**
 * 🎵 SUNO HEALTH FUNCTION - VERIFICACIÓN DE SALUD DE SUNO
 * 
 * Función de Netlify para verificar el estado de Suno API
 */

import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const sunoApiKey = process.env.SUNO_API_KEY;
    const sunoBaseUrl = process.env.SUNO_BASE_URL || 'https://ai.imgkits.com/suno';
    
    if (!sunoApiKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Suno API key no configurada',
          connected: false,
        }),
      };
    }

    // Verificar conectividad con Suno
    const healthResponse = await fetch(`${sunoBaseUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': sunoApiKey,
        'channel': 'node-api',
        'origin': 'https://son1kvers3.com',
        'referer': 'https://son1kvers3.com/',
      },
    });

    const isHealthy = healthResponse.ok;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'Suno API conectado' : 'Suno API no disponible',
        connected: isHealthy,
        timestamp: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('Error in suno-health:', error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Error verificando estado de Suno',
        connected: false,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

