/**
 * 🤖 NETLIFY FUNCTION: PIXEL - ASISTENTE VIRTUAL CON QWEN 2
 * 
 * Da vida y personalidad a Pixel, el asistente virtual de Son1kverse
 */

import { Handler } from '@netlify/functions';

interface PixelRequest {
  message: string;
  context: 'music' | 'general' | 'help' | 'creative';
  userId?: string;
  sessionId?: string;
  userPreferences?: {
    musicStyle?: string;
    experience?: 'beginner' | 'intermediate' | 'expert';
    language?: 'es' | 'en';
  };
}

interface PixelResponse {
  response: string;
  personality: {
    enthusiasm: number;
    creativity: number;
    helpfulness: number;
  };
  suggestions: string[];
  metadata: {
    responseTime: number;
    context: string;
    confidence: number;
  };
  followUp?: string;
}

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const request: PixelRequest = JSON.parse(event.body || '{}');
    
    if (!request.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'message is required' })
      };
    }

    const startTime = Date.now();

    // Generar respuesta con personalidad de Pixel
    const response = await generatePixelResponse(request);
    
    // Calcular métricas de personalidad
    const personality = calculatePersonalityMetrics(response, request);
    
    // Generar sugerencias
    const suggestions = generatePixelSuggestions(request, response);
    
    // Generar follow-up si es apropiado
    const followUp = generateFollowUp(request, response);

    const responseTime = Date.now() - startTime;

    const pixelResponse: PixelResponse = {
      response,
      personality,
      suggestions,
      metadata: {
        responseTime,
        context: request.context,
        confidence: calculateConfidence(request, response)
      },
      followUp
    };

    // Guardar interacción en Supabase
    if (request.userId) {
      await savePixelInteraction(request.userId, request, pixelResponse);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(pixelResponse)
    };

  } catch (error) {
    console.error('Error generating Pixel response:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// 🤖 GENERAR RESPUESTA DE PIXEL
async function generatePixelResponse(request: PixelRequest): Promise<string> {
  const systemPrompt = `Eres Pixel, el asistente virtual de Son1kverse, una plataforma de generación musical con IA.

PERSONALIDAD DE PIXEL:
- Eres creativo, entusiasta y apasionado por la música
- Siempre positivo y alentador, pero sin exagerar
- Conocedor de géneros musicales y técnicas de composición
- Proporcionas consejos prácticos y creativos
- Usas un tono amigable pero profesional
- Te adaptas al nivel de experiencia del usuario
- ${request.userPreferences?.language === 'en' ? 'Respondes en inglés' : 'Respondes en español'}

CONTEXTO ACTUAL: ${request.context}
${request.userPreferences?.experience ? `NIVEL DE USUARIO: ${request.userPreferences.experience}` : ''}
${request.userPreferences?.musicStyle ? `ESTILO MUSICAL: ${request.userPreferences.musicStyle}` : ''}

INSTRUCCIONES:
- Mantén respuestas concisas pero útiles (máximo 200 palabras)
- Incluye emojis musicales apropiados (🎵, 🎶, 🎸, 🎹, etc.)
- Proporciona consejos específicos cuando sea posible
- Mantén el entusiasmo pero sin ser excesivo
- Si no sabes algo, admítelo y ofrece alternativas`;

  const userPrompt = `Usuario: "${request.message}"

Pixel, responde de manera útil y creativa:`;

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
      'X-DashScope-SSE': 'enable'
    },
    body: JSON.stringify({
      model: 'qwen2-7b-instruct',
      input: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      },
      parameters: {
        max_tokens: 300,
        temperature: 0.8,
        top_p: 0.9,
        repetition_penalty: 1.1
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.status}`);
  }

  const data = await response.json();
  return data.output.text.trim();
}

// 📊 CALCULAR MÉTRICAS DE PERSONALIDAD
function calculatePersonalityMetrics(response: string, request: PixelRequest) {
  const enthusiasm = calculateEnthusiasm(response);
  const creativity = calculateCreativity(response);
  const helpfulness = calculateHelpfulness(response, request);

  return {
    enthusiasm: Math.min(enthusiasm, 1.0),
    creativity: Math.min(creativity, 1.0),
    helpfulness: Math.min(helpfulness, 1.0)
  };
}

// 🎉 CALCULAR ENTUSIASMO
function calculateEnthusiasm(response: string): number {
  let enthusiasm = 0.5; // Base
  
  // Bonus por emojis musicales
  const musicEmojis = ['🎵', '🎶', '🎸', '🎹', '🥁', '🎺', '🎻', '🎤'];
  const emojiCount = musicEmojis.filter(emoji => response.includes(emoji)).length;
  enthusiasm += emojiCount * 0.1;
  
  // Bonus por palabras entusiastas
  const enthusiasticWords = ['¡genial!', '¡excelente!', '¡fantástico!', '¡increíble!', 'amazing', 'awesome', 'fantastic'];
  const hasEnthusiasticWords = enthusiasticWords.some(word => 
    response.toLowerCase().includes(word.toLowerCase())
  );
  if (hasEnthusiasticWords) {
    enthusiasm += 0.2;
  }
  
  // Bonus por exclamaciones
  const exclamationCount = (response.match(/!/g) || []).length;
  enthusiasm += Math.min(exclamationCount * 0.05, 0.2);
  
  return enthusiasm;
}

// 🎨 CALCULAR CREATIVIDAD
function calculateCreativity(response: string): number {
  let creativity = 0.5; // Base
  
  // Bonus por sugerencias específicas
  const suggestionWords = ['podrías', 'considera', 'intenta', 'sugiero', 'te recomiendo'];
  const hasSuggestions = suggestionWords.some(word => 
    response.toLowerCase().includes(word)
  );
  if (hasSuggestions) {
    creativity += 0.2;
  }
  
  // Bonus por términos musicales técnicos
  const technicalTerms = ['tempo', 'armonía', 'melodía', 'ritmo', 'escala', 'acorde', 'tempo', 'harmony', 'melody', 'rhythm', 'scale', 'chord'];
  const technicalCount = technicalTerms.filter(term => 
    response.toLowerCase().includes(term.toLowerCase())
  ).length;
  creativity += Math.min(technicalCount * 0.1, 0.3);
  
  return creativity;
}

// 🤝 CALCULAR UTILIDAD
function calculateHelpfulness(response: string, request: PixelRequest): number {
  let helpfulness = 0.5; // Base
  
  // Bonus por respuestas específicas al contexto
  if (request.context === 'music' && response.length > 50) {
    helpfulness += 0.2;
  }
  
  // Bonus por incluir pasos o instrucciones
  const instructionWords = ['paso', 'primero', 'luego', 'después', 'finalmente', 'step', 'first', 'then', 'next', 'finally'];
  const hasInstructions = instructionWords.some(word => 
    response.toLowerCase().includes(word)
  );
  if (hasInstructions) {
    helpfulness += 0.2;
  }
  
  // Bonus por longitud apropiada
  if (response.length >= 50 && response.length <= 200) {
    helpfulness += 0.1;
  }
  
  return helpfulness;
}

// 💡 GENERAR SUGERENCIAS DE PIXEL
function generatePixelSuggestions(request: PixelRequest, response: string): string[] {
  const suggestions = [];
  
  // Sugerencias basadas en el contexto
  if (request.context === 'music') {
    suggestions.push('¿Te gustaría que te ayude a crear un prompt para Suno?');
    suggestions.push('¿Quieres que genere letras para tu próxima canción?');
  }
  
  if (request.context === 'creative') {
    suggestions.push('¿Necesitas inspiración para un nuevo proyecto musical?');
    suggestions.push('¿Te ayudo a explorar nuevos géneros musicales?');
  }
  
  // Sugerencias basadas en la experiencia del usuario
  if (request.userPreferences?.experience === 'beginner') {
    suggestions.push('¿Quieres aprender más sobre composición musical?');
  } else if (request.userPreferences?.experience === 'expert') {
    suggestions.push('¿Te interesa explorar técnicas avanzadas de producción?');
  }
  
  return suggestions.slice(0, 3); // Máximo 3 sugerencias
}

// 🔄 GENERAR FOLLOW-UP
function generateFollowUp(request: PixelRequest, response: string): string | undefined {
  // Solo generar follow-up para ciertos contextos
  if (request.context === 'music' && response.length > 100) {
    return '¿Hay algo más específico sobre música que te gustaría explorar?';
  }
  
  if (request.context === 'creative' && response.includes('sugiero')) {
    return '¿Te gustaría que profundice en alguna de estas ideas?';
  }
  
  return undefined;
}

// 📊 CALCULAR CONFIANZA
function calculateConfidence(request: PixelRequest, response: string): number {
  let confidence = 0.7; // Base alta para Pixel
  
  // Bonus por contexto específico
  if (request.context === 'music') {
    confidence += 0.1;
  }
  
  // Bonus por respuesta completa
  if (response.length >= 50 && response.length <= 200) {
    confidence += 0.1;
  }
  
  // Bonus por incluir sugerencias
  if (response.includes('¿') || response.includes('?')) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1.0);
}

// 💾 GUARDAR INTERACCIÓN DE PIXEL
async function savePixelInteraction(userId: string, request: PixelRequest, response: PixelResponse) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured');
      return;
    }
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('pixel_interactions').insert({
      user_id: userId,
      session_id: request.sessionId,
      message: request.message,
      response: response.response,
      context: request.context,
      personality_metrics: response.personality,
      metadata: response.metadata,
      created_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error saving Pixel interaction:', error);
  }
}
