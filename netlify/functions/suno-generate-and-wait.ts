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
    const body = JSON.parse(event.body || '{}');
    
    // Simular respuesta de generación de música
    const mockResponse = {
      success: true,
      data: {
        audio_url: 'https://example.com/mock-audio.mp3',
        title: body.title || 'Música Generada',
        duration: 30,
        style: body.style || 'pop',
        prompt: body.prompt || 'Música generada con IA',
        generated_at: new Date().toISOString(),
      },
      message: 'Música generada exitosamente',
    };

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockResponse),
    };
  } catch (error) {
    console.error('Error en suno-generate-and-wait:', error);
    
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
