import { Handler } from '@netlify/functions';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Simular respuesta de refresh de token
    const mockToken = {
      token: 'refreshed-token-' + Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hora
      tier: 'free',
      canGenerate: true,
      generationLimit: 3,
      hourlyLimit: 1,
    };

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        data: mockToken,
        message: 'Token refrescado exitosamente',
      }),
    };
  } catch (error) {
    console.error('Error en token-refresh-tiered:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
    };
  }
};
