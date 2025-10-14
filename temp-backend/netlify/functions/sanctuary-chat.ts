/**
 * 🛡️ SANCTUARIO - RED SOCIAL RESPETUOSA
 * 
 * Sistema de chat, colaboración y comunidad con Pixel Guardian como custodio
 */

import { Handler } from '@netlify/functions';

interface SanctuaryMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  type: 'text' | 'track_share' | 'collaboration_request' | 'system';
  trackData?: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    genre: string;
    mood: string;
    audioUrl: string;
    coverUrl?: string;
  };
  collaborationData?: {
    type: 'vocalist' | 'producer' | 'lyricist' | 'mixer' | 'general';
    description: string;
    requirements: string[];
    timeline: string;
  };
  timestamp: Date;
  reactions: {
    likes: number;
    shares: number;
    comments: number;
  };
  isModerated: boolean;
}

interface SanctuaryRequest {
  action: 'send_message' | 'get_messages' | 'share_track' | 'request_collaboration' | 'react_to_message' | 'get_top_tracks';
  userId: string;
  username: string;
  message?: string;
  trackData?: any;
  collaborationData?: any;
  messageId?: string;
  reactionType?: 'like' | 'share' | 'comment';
  limit?: number;
  offset?: number;
}

interface SanctuaryResponse {
  success: boolean;
  data?: any;
  message?: string;
  warning?: string;
  moderation?: {
    isModerated: boolean;
    reason?: string;
    suggestion?: string;
  };
}

// 🛡️ FUNCIÓN PRINCIPAL DEL SANCTUARIO
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const request: SanctuaryRequest = JSON.parse(event.body || '{}');

    if (!request.userId || !request.action) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'User ID and action are required' })
      };
    }

    // 🛡️ VERIFICAR REGLAS DEL SANCTUARIO
    const sanctuaryRules = await checkSanctuaryRules(request);

    if (sanctuaryRules.isModerated) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          moderation: sanctuaryRules,
          warning: "Pixel Guardian ha detectado contenido que necesita revisión. Recuerda: en Son1kverse respetamos todos los sentimientos y creaciones."
        })
      };
    }

    // 🎯 PROCESAR ACCIÓN
    let response: SanctuaryResponse;

    switch (request.action) {
      case 'send_message':
        response = await sendMessage(request);
        break;
      case 'get_messages':
        response = await getMessages(request);
        break;
      case 'share_track':
        response = await shareTrack(request);
        break;
      case 'request_collaboration':
        response = await requestCollaboration(request);
        break;
      case 'react_to_message':
        response = await reactToMessage(request);
        break;
      case 'get_top_tracks':
        response = await getTopTracks(request);
        break;
      default:
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error in Sanctuary:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// 🛡️ VERIFICAR REGLAS DEL SANCTUARIO CON QWEN 2
async function checkSanctuaryRules(request: SanctuaryRequest) {
  const qwenApiKey = process.env.QWEN_API_KEY;
  
  if (!qwenApiKey) {
    return { isModerated: false };
  }

  const message = request.message || '';
  const trackData = request.trackData;
  const collaborationData = request.collaborationData;

  // 🛡️ PROMPT PARA PIXEL GUARDIAN
  const guardianPrompt = `Eres Pixel Guardian, custodio del Santuario de Son1kverse. Tu misión es proteger la comunidad creativa y mantener un ambiente respetuoso.

REGLAS FUNDAMENTALES DEL SANCTUARIO:
1. **RESPETO ABSOLUTO**: Todos los tracks y creaciones son sagrados
2. **NO CRÍTICAS DESTRUCTIVAS**: Las opiniones son subjetivas, nadie puede juzgar los sentimientos de otro
3. **TOLERANCIA CERO**: Cualquier toxicidad puede resultar en ban permanente
4. **COLABORACIÓN**: Fomentar el apoyo mutuo y la creatividad
5. **DIVERSIDAD**: Celebrar todos los estilos y expresiones musicales

Analiza este contenido del Santuario:
${message ? `Mensaje: "${message}"` : ''}
${trackData ? `Track compartido: "${trackData.title}" por ${trackData.artist}` : ''}
${collaborationData ? `Solicitud de colaboración: "${collaborationData.description}"` : ''}

Determina si el contenido:
- Contiene críticas destructivas o negativas
- Es tóxico o irrespetuoso
- Viola las reglas del Santuario
- Necesita moderación

Responde en formato JSON:
{
  "isModerated": boolean,
  "reason": "razón específica si está moderado",
  "suggestion": "sugerencia constructiva si está moderado"
}`;

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${qwenApiKey}`,
        'X-DashScope-SSE': 'enable'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: guardianPrompt
            },
            {
              role: 'user',
              content: `Analiza este contenido del Santuario con las reglas de Pixel Guardian.`
            }
          ]
        },
        parameters: {
          temperature: 0.2,
          max_tokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.output?.text || '';

    // 🔍 PARSEAR RESPUESTA
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing guardian response:', error);
    }

    return { isModerated: false };

  } catch (error) {
    console.error('Error calling Qwen API for moderation:', error);
    return { isModerated: false };
  }
}

// 💬 ENVIAR MENSAJE
async function sendMessage(request: SanctuaryRequest): Promise<SanctuaryResponse> {
  const { userId, username, message } = request;

  if (!message || message.trim().length === 0) {
    return {
      success: false,
      message: 'El mensaje no puede estar vacío'
    };
  }

  const sanctuaryMessage: SanctuaryMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    message: message.trim(),
    type: 'text',
    timestamp: new Date(),
    reactions: {
      likes: 0,
      shares: 0,
      comments: 0
    },
    isModerated: false
  };

  // 💾 GUARDAR EN SUPABASE
  await saveMessageToSupabase(sanctuaryMessage);

  return {
    success: true,
    data: sanctuaryMessage,
    message: 'Mensaje enviado al Santuario'
  };
}

// 🎵 COMPARTIR TRACK
async function shareTrack(request: SanctuaryRequest): Promise<SanctuaryResponse> {
  const { userId, username, trackData } = request;

  if (!trackData) {
    return {
      success: false,
      message: 'Datos del track son requeridos'
    };
  }

  const sanctuaryMessage: SanctuaryMessage = {
    id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    message: `🎵 Compartió "${trackData.title}" - ${trackData.genre} (${trackData.mood})`,
    type: 'track_share',
    trackData,
    timestamp: new Date(),
    reactions: {
      likes: 0,
      shares: 0,
      comments: 0
    },
    isModerated: false
  };

  // 💾 GUARDAR EN SUPABASE
  await saveMessageToSupabase(sanctuaryMessage);

  return {
    success: true,
    data: sanctuaryMessage,
    message: 'Track compartido en el Santuario'
  };
}

// 🤝 SOLICITAR COLABORACIÓN
async function requestCollaboration(request: SanctuaryRequest): Promise<SanctuaryResponse> {
  const { userId, username, collaborationData } = request;

  if (!collaborationData) {
    return {
      success: false,
      message: 'Datos de colaboración son requeridos'
    };
  }

  const sanctuaryMessage: SanctuaryMessage = {
    id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    message: `🤝 Solicita colaboración: ${collaborationData.type} - ${collaborationData.description}`,
    type: 'collaboration_request',
    collaborationData,
    timestamp: new Date(),
    reactions: {
      likes: 0,
      shares: 0,
      comments: 0
    },
    isModerated: false
  };

  // 💾 GUARDAR EN SUPABASE
  await saveMessageToSupabase(sanctuaryMessage);

  return {
    success: true,
    data: sanctuaryMessage,
    message: 'Solicitud de colaboración enviada'
  };
}

// 📨 OBTENER MENSAJES
async function getMessages(request: SanctuaryRequest): Promise<SanctuaryResponse> {
  const { limit = 50, offset = 0 } = request;

  try {
    const messages = await getMessagesFromSupabase(limit, offset);
    
    return {
      success: true,
      data: messages
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    return {
      success: false,
      message: 'Error al obtener mensajes'
    };
  }
}

// ⭐ REACCIONAR A MENSAJE
async function reactToMessage(request: SanctuaryRequest): Promise<SanctuaryResponse> {
  const { messageId, reactionType } = request;

  if (!messageId || !reactionType) {
    return {
      success: false,
      message: 'ID del mensaje y tipo de reacción son requeridos'
    };
  }

  try {
    await updateReactionInSupabase(messageId, reactionType);
    
    return {
      success: true,
      message: 'Reacción registrada'
    };
  } catch (error) {
    console.error('Error updating reaction:', error);
    return {
      success: false,
      message: 'Error al registrar reacción'
    };
  }
}

// 🏆 OBTENER TOP TRACKS
async function getTopTracks(request: SanctuaryRequest): Promise<SanctuaryResponse> {
  try {
    const topTracks = await getTopTracksFromSupabase();
    
    return {
      success: true,
      data: topTracks
    };
  } catch (error) {
    console.error('Error getting top tracks:', error);
    return {
      success: false,
      message: 'Error al obtener top tracks'
    };
  }
}

// 💾 GUARDAR MENSAJE EN SUPABASE
async function saveMessageToSupabase(message: SanctuaryMessage) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, skipping save');
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/sanctuary_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        id: message.id,
        user_id: message.userId,
        username: message.username,
        message: message.message,
        message_type: message.type,
        track_data: message.trackData,
        collaboration_data: message.collaborationData,
        reactions: message.reactions,
        is_moderated: message.isModerated,
        created_at: message.timestamp.toISOString()
      })
    });

    if (!response.ok) {
      console.error('Error saving message to Supabase:', response.status);
    }
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

// 📨 OBTENER MENSAJES DE SUPABASE
async function getMessagesFromSupabase(limit: number, offset: number) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/sanctuary_messages?order=created_at.desc&limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting messages from Supabase:', error);
    return [];
  }
}

// ⭐ ACTUALIZAR REACCIÓN EN SUPABASE
async function updateReactionInSupabase(messageId: string, reactionType: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/sanctuary_messages?id=eq.${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        reactions: {
          [reactionType]: `reactions->${reactionType} + 1`
        }
      })
    });

    if (!response.ok) {
      console.error('Error updating reaction in Supabase:', response.status);
    }
  } catch (error) {
    console.error('Error updating reaction:', error);
  }
}

// 🏆 OBTENER TOP TRACKS DE SUPABASE
async function getTopTracksFromSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/sanctuary_messages?message_type=eq.track_share&order=reactions->likes.desc&limit=10`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting top tracks from Supabase:', error);
    return [];
  }
}
