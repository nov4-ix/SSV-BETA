/**
 * 🌐 NETLIFY FUNCTION: TRADUCCIÓN AUTOMÁTICA CON QWEN 2
 * 
 * Traduce prompts de español a inglés para Suno sin que el usuario lo vea
 */

import { Handler } from '@netlify/functions';

interface TranslationRequest {
  text: string;
  sourceLanguage: 'es' | 'en';
  targetLanguage: 'es' | 'en';
  context: 'music' | 'general' | 'technical';
  preserveFormatting?: boolean;
  userId?: string;
}

interface TranslationResponse {
  translatedText: string;
  confidence: number;
  detectedLanguage: string;
  metadata: {
    originalLength: number;
    translatedLength: number;
    processingTime: number;
  };
  suggestions?: string[];
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
    const request: TranslationRequest = JSON.parse(event.body || '{}');
    
    if (!request.text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'text is required' })
      };
    }

    const startTime = Date.now();

    // Detectar idioma si no se especifica
    const detectedLanguage = request.sourceLanguage || await detectLanguage(request.text);
    
    // Traducir usando Qwen 2
    const translatedText = await translateWithQwen(request.text, detectedLanguage, request.targetLanguage, request.context);
    
    // Calcular confianza
    const confidence = calculateTranslationConfidence(request.text, translatedText, request.context);
    
    // Generar sugerencias si es necesario
    const suggestions = confidence < 0.8 ? generateTranslationSuggestions(request.text, translatedText) : undefined;

    const processingTime = Date.now() - startTime;

    const response: TranslationResponse = {
      translatedText,
      confidence,
      detectedLanguage,
      metadata: {
        originalLength: request.text.length,
        translatedLength: translatedText.length,
        processingTime
      },
      suggestions
    };

    // Guardar en Supabase si hay userId
    if (request.userId) {
      await saveToSupabase(request.userId, 'translation', request, response);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error translating text:', error);
    
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

// 🔍 DETECTAR IDIOMA
async function detectLanguage(text: string): Promise<string> {
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
          {
            role: 'user',
            content: `Detecta el idioma del siguiente texto y responde SOLO con "es" para español o "en" para inglés:

Texto: "${text}"

Idioma:`
          }
        ]
      },
      parameters: {
        max_tokens: 10,
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    return 'es'; // Default to Spanish
  }

  const data = await response.json();
  const detected = data.output.text.trim().toLowerCase();
  return detected === 'en' ? 'en' : 'es';
}

// 🌐 TRADUCIR CON QWEN 2
async function translateWithQwen(
  text: string, 
  sourceLanguage: string, 
  targetLanguage: string, 
  context: string
): Promise<string> {
  const systemPrompt = `Eres un traductor experto especializado en música y tecnología. 

Instrucciones específicas:
- Traduce manteniendo el contexto musical y creativo
- Preserva términos técnicos musicales cuando sea apropiado
- Mantén el tono y estilo del texto original
- Para contexto musical, prioriza la creatividad sobre la traducción literal
- Responde SOLO con la traducción, sin explicaciones adicionales`;

  const contextInstructions = {
    music: 'Este texto es para generación de música con IA. Mantén términos musicales técnicos y creativos.',
    general: 'Traduce de manera natural y fluida.',
    technical: 'Mantén precisión técnica y términos especializados.'
  };

  const userPrompt = `Traduce el siguiente texto de ${sourceLanguage === 'es' ? 'español' : 'inglés'} a ${targetLanguage === 'es' ? 'español' : 'inglés'}:

${contextInstructions[context]}

Texto a traducir: "${text}"

Traducción:`;

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
        max_tokens: 500,
        temperature: 0.3,
        top_p: 0.9
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.status}`);
  }

  const data = await response.json();
  return data.output.text.trim();
}

// 📊 CALCULAR CONFIANZA DE TRADUCCIÓN
function calculateTranslationConfidence(original: string, translated: string, context: string): number {
  let confidence = 0.5; // Base
  
  // Bonus por longitud similar
  const lengthRatio = translated.length / original.length;
  if (lengthRatio > 0.7 && lengthRatio < 1.3) {
    confidence += 0.2;
  }
  
  // Bonus por contexto musical
  if (context === 'music') {
    const musicTerms = ['beat', 'rhythm', 'melody', 'harmony', 'tempo', 'bpm', 'key', 'scale'];
    const hasMusicTerms = musicTerms.some(term => 
      original.toLowerCase().includes(term) || translated.toLowerCase().includes(term)
    );
    if (hasMusicTerms) {
      confidence += 0.1;
    }
  }
  
  // Bonus por preservación de estructura
  const originalLines = original.split('\n').length;
  const translatedLines = translated.split('\n').length;
  if (Math.abs(originalLines - translatedLines) <= 1) {
    confidence += 0.1;
  }
  
  // Penalty por texto muy corto
  if (original.length < 10) {
    confidence -= 0.1;
  }
  
  return Math.min(Math.max(confidence, 0), 1);
}

// 💡 GENERAR SUGERENCIAS DE TRADUCCIÓN
function generateTranslationSuggestions(original: string, translated: string): string[] {
  const suggestions = [];
  
  // Sugerencias basadas en longitud
  const lengthRatio = translated.length / original.length;
  if (lengthRatio < 0.5) {
    suggestions.push('La traducción parece muy corta, considera expandir');
  } else if (lengthRatio > 2) {
    suggestions.push('La traducción parece muy larga, considera condensar');
  }
  
  // Sugerencias basadas en estructura
  const originalLines = original.split('\n').length;
  const translatedLines = translated.split('\n').length;
  if (Math.abs(originalLines - translatedLines) > 2) {
    suggestions.push('Considera mantener mejor la estructura del texto original');
  }
  
  return suggestions;
}

// 💾 GUARDAR EN SUPABASE
async function saveToSupabase(userId: string, type: string, request: any, response: any) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured');
      return;
    }
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('ai_responses').insert({
      user_id: userId,
      type: type,
      input_data: request,
      output_data: response,
      created_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error saving to Supabase:', error);
  }
}
