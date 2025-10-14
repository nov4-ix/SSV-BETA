/**
 * 🎵 SUNO GENERATE FUNCTION - GENERACIÓN DE MÚSICA CON SUNO
 * 
 * Función de Netlify para generar música usando Suno API
 */

import { Handler } from '@netlify/functions';

interface SunoGenerateRequest {
  prompt: string;
  style?: string;
  title?: string;
  instrumental?: boolean;
  lyrics?: string;
  gender?: 'male' | 'female' | 'mixed';
}

interface SunoGenerateResponse {
  success: boolean;
  taskId?: string;
  audioUrl?: string;
  error?: string;
}

export const handler: Handler = async (event) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body: SunoGenerateRequest = JSON.parse(event.body || '{}');
    
    // Validar datos de entrada
    if (!body.prompt || body.prompt.length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'El prompt debe tener al menos 10 caracteres',
        }),
      };
    }

    // 🚀 CONFIGURACIÓN DE SUNO
    const sunoApiKey = process.env.SUNO_API_KEY;
    const sunoBaseUrl = process.env.SUNO_BASE_URL || 'https://ai.imgkits.com/suno';
    
    if (!sunoApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Suno API key no configurada',
        }),
      };
    }

    // 🎵 PREPARAR PROMPT OPTIMIZADO
    let optimizedPrompt = body.prompt;
    
    // Agregar estilo si se especifica
    if (body.style) {
      optimizedPrompt += `, ${body.style} style`;
    }
    
    // Agregar género si se especifica
    if (body.gender && body.gender !== 'mixed') {
      optimizedPrompt += `, ${body.gender} vocals`;
    }
    
    // Agregar instrumental si se especifica
    if (body.instrumental) {
      optimizedPrompt += ', instrumental only';
    }

    // 🎼 GENERAR MÚSICA CON SUNO
    const sunoResponse = await fetch(`${sunoBaseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': sunoApiKey,
        'channel': 'node-api',
        'origin': 'https://son1kvers3.com',
        'referer': 'https://son1kvers3.com/',
      },
      body: JSON.stringify({
        prompt: optimizedPrompt,
        style: body.style || 'pop',
        title: body.title || 'Generated Track',
        customMode: false,
        instrumental: body.instrumental || false,
        lyrics: body.lyrics,
        gender: body.gender || 'mixed',
      }),
    });

    if (!sunoResponse.ok) {
      const errorText = await sunoResponse.text();
      console.error('Suno API error:', sunoResponse.status, errorText);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Error de Suno API: ${sunoResponse.status}`,
        }),
      };
    }

    const sunoData = await sunoResponse.json();
    
    if (!sunoData.taskId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No se recibió taskId de Suno',
        }),
      };
    }

    // 🎯 POLLING PARA OBTENER RESULTADO
    const pollingUrl = process.env.SUNO_POLLING_URL || 'https://usa.imgkits.com/node-api/suno';
    const maxAttempts = 24; // 2 minutos máximo
    const interval = 5000; // 5 segundos

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, interval));

      try {
        const pollResponse = await fetch(`${pollingUrl}/get_mj_status/${encodeURIComponent(sunoData.taskId)}`, {
          method: 'GET',
          headers: {
            'Authorization': sunoApiKey,
            'channel': 'node-api',
            'origin': 'https://son1kvers3.com',
            'referer': 'https://son1kvers3.com/',
          },
        });

        if (pollResponse.ok) {
          const pollData = await pollResponse.json();
          
          if (pollData.running === false && pollData.audio_url) {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                taskId: sunoData.taskId,
                audioUrl: pollData.audio_url,
              }),
            };
          }
        }
      } catch (pollError) {
        console.error('Polling error:', pollError);
      }
    }

    // Timeout
    return {
      statusCode: 408,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Timeout esperando resultado de Suno',
        taskId: sunoData.taskId,
      }),
    };

  } catch (error) {
    console.error('Error in suno-generate:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
      }),
    };
  }
};

