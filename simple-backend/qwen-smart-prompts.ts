/**
 * 🧠 NETLIFY FUNCTION: PROMPTS INTELIGENTES CON QWEN 2
 * 
 * Sistema de prompts inteligentes que mejora automáticamente los prompts del usuario
 */

import { Handler } from '@netlify/functions';

interface SmartPromptRequest {
  originalPrompt: string;
  targetStyle: string;
  genre: string;
  mood: string;
  complexity: 'simple' | 'detailed' | 'expert';
  userId?: string;
}

interface SmartPromptResponse {
  enhancedPrompt: string;
  improvements: {
    clarity: number;
    specificity: number;
    creativity: number;
    musicality: number;
  };
  suggestions: string[];
  metadata: {
    originalLength: number;
    enhancedLength: number;
    improvementScore: number;
    processingTime: number;
  };
  alternatives?: string[];
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
    const request: SmartPromptRequest = JSON.parse(event.body || '{}');
    
    if (!request.originalPrompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'originalPrompt is required' })
      };
    }

    const startTime = Date.now();

    // Mejorar el prompt usando Qwen 2
    const enhancedPrompt = await enhancePrompt(request);
    
    // Calcular mejoras
    const improvements = calculateImprovements(request.originalPrompt, enhancedPrompt, request);
    
    // Generar sugerencias
    const suggestions = generatePromptSuggestions(request, enhancedPrompt);
    
    // Generar alternativas si es necesario
    const alternatives = request.complexity === 'expert' ? 
      await generateAlternatives(request) : undefined;

    const processingTime = Date.now() - startTime;
    const improvementScore = calculateImprovementScore(request.originalPrompt, enhancedPrompt);

    const response: SmartPromptResponse = {
      enhancedPrompt,
      improvements,
      suggestions,
      metadata: {
        originalLength: request.originalPrompt.length,
        enhancedLength: enhancedPrompt.length,
        improvementScore,
        processingTime
      },
      alternatives
    };

    // Guardar en Supabase
    if (request.userId) {
      await saveToSupabase(request.userId, 'smart_prompt', request, response);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error enhancing prompt:', error);
    
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

// 🧠 MEJORAR PROMPT CON QWEN 2
async function enhancePrompt(request: SmartPromptRequest): Promise<string> {
  const complexityInstructions = {
    simple: 'Mantén el prompt simple y directo, fácil de entender',
    detailed: 'Agrega detalles específicos y descriptivos',
    expert: 'Incluye terminología técnica y conceptos avanzados'
  };

  const systemPrompt = `Eres un experto en generación musical con IA. Tu tarea es mejorar prompts para obtener mejores resultados musicales.

INSTRUCCIONES:
- Mejora la claridad y especificidad del prompt
- Agrega elementos musicales concretos si faltan
- Mantén el estilo y intención original
- Optimiza para generación de música AI
- ${complexityInstructions[request.complexity]}
- Responde SOLO con el prompt mejorado

ELEMENTOS A CONSIDERAR:
- Instrumentos específicos
- Tempo y ritmo
- Mood y atmósfera
- Género musical
- Estructura y progresión
- Calidad de audio`;

  const userPrompt = `Mejora este prompt musical:

PROMPT ORIGINAL: "${request.originalPrompt}"
ESTILO OBJETIVO: ${request.targetStyle}
GÉNERO: ${request.genre}
MOOD: ${request.mood}
COMPLEJIDAD: ${request.complexity}

Prompt mejorado:`;

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
        max_tokens: 400,
        temperature: 0.7,
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

// 📊 CALCULAR MEJORAS
function calculateImprovements(original: string, enhanced: string, request: SmartPromptRequest) {
  return {
    clarity: calculateClarity(original, enhanced),
    specificity: calculateSpecificity(original, enhanced),
    creativity: calculateCreativity(original, enhanced),
    musicality: calculateMusicality(enhanced, request)
  };
}

// 🔍 CALCULAR CLARIDAD
function calculateClarity(original: string, enhanced: string): number {
  let clarity = 0.5; // Base
  
  // Bonus por longitud adecuada
  if (enhanced.length > original.length && enhanced.length < 300) {
    clarity += 0.2;
  }
  
  // Bonus por estructura clara
  const hasStructure = /primero|después|luego|finalmente|first|then|next|finally/i.test(enhanced);
  if (hasStructure) {
    clarity += 0.2;
  }
  
  // Bonus por especificidad
  const specificWords = ['específico', 'concreto', 'detallado', 'preciso', 'specific', 'concrete', 'detailed', 'precise'];
  const hasSpecificity = specificWords.some(word => enhanced.toLowerCase().includes(word));
  if (hasSpecificity) {
    clarity += 0.1;
  }
  
  return Math.min(clarity, 1.0);
}

// 🎯 CALCULAR ESPECIFICIDAD
function calculateSpecificity(original: string, enhanced: string): number {
  let specificity = 0.5; // Base
  
  // Bonus por términos musicales específicos
  const musicTerms = ['tempo', 'bpm', 'escala', 'acorde', 'armonía', 'melodía', 'ritmo', 'scale', 'chord', 'harmony', 'melody', 'rhythm'];
  const originalTerms = musicTerms.filter(term => original.toLowerCase().includes(term)).length;
  const enhancedTerms = musicTerms.filter(term => enhanced.toLowerCase().includes(term)).length;
  
  if (enhancedTerms > originalTerms) {
    specificity += 0.3;
  }
  
  // Bonus por instrumentos específicos
  const instruments = ['guitarra', 'piano', 'batería', 'bajo', 'violín', 'guitar', 'piano', 'drums', 'bass', 'violin'];
  const instrumentCount = instruments.filter(instrument => enhanced.toLowerCase().includes(instrument)).length;
  specificity += Math.min(instrumentCount * 0.1, 0.2);
  
  return Math.min(specificity, 1.0);
}

// 🎨 CALCULAR CREATIVIDAD
function calculateCreativity(original: string, enhanced: string): number {
  let creativity = 0.5; // Base
  
  // Bonus por palabras creativas
  const creativeWords = ['innovador', 'único', 'experimental', 'artístico', 'innovative', 'unique', 'experimental', 'artistic'];
  const creativeCount = creativeWords.filter(word => enhanced.toLowerCase().includes(word)).length;
  creativity += Math.min(creativeCount * 0.15, 0.3);
  
  // Bonus por metáforas
  const metaphors = ['como', 'como si', 'similar a', 'like', 'as if', 'similar to'];
  const metaphorCount = metaphors.filter(metaphor => enhanced.toLowerCase().includes(metaphor)).length;
  creativity += Math.min(metaphorCount * 0.1, 0.2);
  
  return Math.min(creativity, 1.0);
}

// 🎵 CALCULAR MUSICALIDAD
function calculateMusicality(enhanced: string, request: SmartPromptRequest): number {
  let musicality = 0.5; // Base
  
  // Bonus por términos musicales
  const musicTerms = ['tempo', 'ritmo', 'melodía', 'armonía', 'escala', 'acorde', 'progresión', 'rhythm', 'melody', 'harmony', 'scale', 'chord', 'progression'];
  const musicTermCount = musicTerms.filter(term => enhanced.toLowerCase().includes(term)).length;
  musicality += Math.min(musicTermCount * 0.1, 0.3);
  
  // Bonus por género específico
  if (enhanced.toLowerCase().includes(request.genre.toLowerCase())) {
    musicality += 0.1;
  }
  
  // Bonus por mood específico
  if (enhanced.toLowerCase().includes(request.mood.toLowerCase())) {
    musicality += 0.1;
  }
  
  return Math.min(musicality, 1.0);
}

// 💡 GENERAR SUGERENCIAS DE PROMPT
function generatePromptSuggestions(request: SmartPromptRequest, enhanced: string): string[] {
  const suggestions = [];
  
  // Sugerencias basadas en el contenido
  if (!enhanced.toLowerCase().includes('tempo') && !enhanced.toLowerCase().includes('bpm')) {
    suggestions.push('Considera agregar información sobre el tempo deseado');
  }
  
  if (!enhanced.toLowerCase().includes('instrumento') && !enhanced.toLowerCase().includes('instrument')) {
    suggestions.push('Especifica los instrumentos principales que quieres');
  }
  
  if (!enhanced.toLowerCase().includes('mood') && !enhanced.toLowerCase().includes('atmósfera')) {
    suggestions.push('Describe el mood o atmósfera que buscas');
  }
  
  // Sugerencias basadas en la complejidad
  if (request.complexity === 'simple' && enhanced.length > 150) {
    suggestions.push('Para un prompt simple, considera reducir la longitud');
  }
  
  if (request.complexity === 'expert' && enhanced.length < 100) {
    suggestions.push('Para un prompt experto, podrías agregar más detalles técnicos');
  }
  
  return suggestions.slice(0, 3); // Máximo 3 sugerencias
}

// 🔄 GENERAR ALTERNATIVAS
async function generateAlternatives(request: SmartPromptRequest): Promise<string[]> {
  const alternatives = [];
  
  // Generar 2 alternativas adicionales
  for (let i = 0; i < 2; i++) {
    try {
      const alternative = await enhancePrompt({
        ...request,
        complexity: i === 0 ? 'detailed' : 'simple'
      });
      alternatives.push(alternative);
    } catch (error) {
      console.error('Error generating alternative:', error);
    }
  }
  
  return alternatives;
}

// 📊 CALCULAR PUNTUACIÓN DE MEJORA
function calculateImprovementScore(original: string, enhanced: string): number {
  let score = 0;
  
  // Bonus por longitud mejorada
  const lengthImprovement = (enhanced.length - original.length) / original.length;
  if (lengthImprovement > 0.2 && lengthImprovement < 1.0) {
    score += 0.3;
  }
  
  // Bonus por contenido musical
  const musicTerms = ['tempo', 'ritmo', 'melodía', 'armonía', 'escala', 'acorde', 'rhythm', 'melody', 'harmony', 'scale', 'chord'];
  const originalMusicTerms = musicTerms.filter(term => original.toLowerCase().includes(term)).length;
  const enhancedMusicTerms = musicTerms.filter(term => enhanced.toLowerCase().includes(term)).length;
  
  if (enhancedMusicTerms > originalMusicTerms) {
    score += 0.4;
  }
  
  // Bonus por estructura
  const hasStructure = /primero|después|luego|finalmente|first|then|next|finally/i.test(enhanced);
  if (hasStructure) {
    score += 0.3;
  }
  
  return Math.min(score, 1.0);
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
