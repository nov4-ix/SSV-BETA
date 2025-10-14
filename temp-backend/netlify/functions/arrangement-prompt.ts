/**
 * 🎼 PROMPTS INTELIGENTES PARA ARREGLOS
 * 
 * Genera prompts creativos para arreglos musicales basados en análisis de pista
 */

import { Handler } from '@netlify/functions';

interface ArrangementPromptRequest {
  audioAnalysis: {
    bpm: number;
    key: string;
    scale: string;
    genres: Array<{ name: string; confidence: number }>;
    mood: string;
    energy: number;
    danceability: number;
    valence: number;
    tempo: number;
    timeSignature: string;
    arrangement: {
      intro: number;
      verse: number;
      chorus: number;
      bridge: number;
      outro: number;
    };
    instrumentation: string[];
  };
  targetStyle?: string;
  creativityLevel?: 'conservative' | 'moderate' | 'creative' | 'experimental';
  userId?: string;
}

interface ArrangementPromptResponse {
  prompt: string;
  enhancedPrompt: string;
  suggestions: string[];
  arrangement: {
    structure: string;
    sections: Array<{
      name: string;
      duration: number;
      description: string;
    }>;
  };
  instrumentation: {
    current: string[];
    suggested: string[];
    additions: string[];
  };
  creativeElements: string[];
  confidence: number;
}

// 🎼 FUNCIÓN PRINCIPAL
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const request: ArrangementPromptRequest = JSON.parse(event.body || '{}');

    if (!request.audioAnalysis) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Audio analysis is required' })
      };
    }

    // 🎯 GENERAR PROMPT INTELIGENTE
    const promptResponse = await generateArrangementPrompt(request);

    // 💾 GUARDAR EN SUPABASE
    if (request.userId) {
      await savePromptToSupabase(request.userId, promptResponse, request);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptResponse)
    };

  } catch (error) {
    console.error('Error generating arrangement prompt:', error);
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

// 🧠 GENERAR PROMPT DE ARREGLO CON QWEN 2
async function generateArrangementPrompt(request: ArrangementPromptRequest): Promise<ArrangementPromptResponse> {
  const qwenApiKey = process.env.QWEN_API_KEY;
  
  if (!qwenApiKey) {
    throw new Error('QWEN_API_KEY not configured');
  }

  const { audioAnalysis, targetStyle, creativityLevel = 'moderate' } = request;

  // 🎵 PROMPT PARA ARREGLOS CREATIVOS
  const arrangementPrompt = `Eres un productor musical experto y arreglista creativo con conocimientos profundos en teoría musical, producción y composición.

Basándote en este análisis de pista:
- BPM: ${audioAnalysis.bpm}
- Tonalidad: ${audioAnalysis.key}
- Escala: ${audioAnalysis.scale}
- Géneros: ${audioAnalysis.genres.map(g => `${g.name} (${Math.round(g.confidence * 100)}%)`).join(', ')}
- Estado de ánimo: ${audioAnalysis.mood}
- Energía: ${audioAnalysis.energy}/100
- Bailabilidad: ${audioAnalysis.danceability}/100
- Valencia: ${audioAnalysis.valence}/100
- Compás: ${audioAnalysis.timeSignature}
- Arreglo actual: Intro(${audioAnalysis.arrangement.intro}s), Verso(${audioAnalysis.arrangement.verse}s), Coro(${audioAnalysis.arrangement.chorus}s), Puente(${audioAnalysis.arrangement.bridge}s), Outro(${audioAnalysis.arrangement.outro}s)
- Instrumentación: ${audioAnalysis.instrumentation.join(', ')}

${targetStyle ? `Estilo objetivo: ${targetStyle}` : ''}
Nivel de creatividad: ${creativityLevel}

Genera un prompt creativo para arreglar esta pista que incluya:

1. **Prompt principal**: Descripción detallada del arreglo sugerido
2. **Prompt mejorado**: Versión más específica y técnica
3. **Sugerencias**: Ideas creativas específicas
4. **Estructura**: Nueva estructura de la canción con duraciones
5. **Instrumentación**: Instrumentos actuales, sugeridos y adiciones
6. **Elementos creativos**: Ideas innovadoras para el arreglo
7. **Confianza**: Nivel de confianza en las sugerencias (0-100)

Responde en formato JSON estructurado.`;

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
              content: arrangementPrompt
            },
            {
              role: 'user',
              content: `Genera un prompt creativo para arreglar esta pista musical con nivel de creatividad ${creativityLevel}.`
            }
          ]
        },
        parameters: {
          temperature: creativityLevel === 'experimental' ? 0.9 : 
                      creativityLevel === 'creative' ? 0.7 : 
                      creativityLevel === 'moderate' ? 0.5 : 0.3,
          max_tokens: 2500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    const promptText = data.output?.text || '';

    // 🔍 PARSEAR RESPUESTA JSON
    const promptResponse = parsePromptResponse(promptText, audioAnalysis);

    return promptResponse;

  } catch (error) {
    console.error('Error calling Qwen API:', error);
    
    // 🎯 FALLBACK: PROMPT SIMULADO
    return generateFallbackPrompt(audioAnalysis, creativityLevel);
  }
}

// 🔍 PARSEAR RESPUESTA DE PROMPT
function parsePromptResponse(promptText: string, audioAnalysis: any): ArrangementPromptResponse {
  try {
    // Intentar extraer JSON de la respuesta
    const jsonMatch = promptText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing prompt response:', error);
  }

  // 🎯 FALLBACK: PROMPT SIMULADO
  return generateFallbackPrompt(audioAnalysis, 'moderate');
}

// 🎵 PROMPT SIMULADO (FALLBACK)
function generateFallbackPrompt(audioAnalysis: any, creativityLevel: string): ArrangementPromptResponse {
  const basePrompt = `Arregla esta pista de ${audioAnalysis.bpm} BPM en ${audioAnalysis.key} con un enfoque ${audioAnalysis.mood}`;
  
  const enhancedPrompt = `${basePrompt}. 
  
Estructura sugerida:
- Intro: ${audioAnalysis.arrangement.intro + 4}s (agregar elementos atmosféricos)
- Verso: ${audioAnalysis.arrangement.verse}s (mantener ritmo base)
- Coro: ${audioAnalysis.arrangement.chorus + 2}s (agregar capas instrumentales)
- Puente: ${audioAnalysis.arrangement.bridge + 4}s (cambio de dinámica)
- Outro: ${audioAnalysis.arrangement.outro + 2}s (fade creativo)

Instrumentación adicional: Sintetizadores, cuerdas, percusión étnica`;

  const suggestions = [
    'Agregar una sección instrumental antes del coro',
    'Cambiar la dinámica en el puente',
    'Usar efectos de delay en las voces',
    'Agregar capas de sintetizadores en el coro',
    'Incluir elementos de percusión étnica'
  ];

  const structure = generateSongStructure(audioAnalysis);
  const instrumentation = generateInstrumentation(audioAnalysis);
  const creativeElements = generateCreativeElements(creativityLevel);

  return {
    prompt: basePrompt,
    enhancedPrompt,
    suggestions,
    arrangement: structure,
    instrumentation,
    creativeElements,
    confidence: 75
  };
}

// 🎼 GENERAR ESTRUCTURA DE CANCIÓN
function generateSongStructure(audioAnalysis: any) {
  const sections = [
    {
      name: 'Intro',
      duration: audioAnalysis.arrangement.intro + 4,
      description: 'Entrada atmosférica con elementos melódicos'
    },
    {
      name: 'Verso 1',
      duration: audioAnalysis.arrangement.verse,
      description: 'Establecimiento del ritmo y melodía principal'
    },
    {
      name: 'Pre-Coro',
      duration: 8,
      description: 'Transición hacia el coro con crescendo'
    },
    {
      name: 'Coro',
      duration: audioAnalysis.arrangement.chorus + 2,
      description: 'Sección principal con máxima energía'
    },
    {
      name: 'Verso 2',
      duration: audioAnalysis.arrangement.verse,
      description: 'Variación del verso con elementos adicionales'
    },
    {
      name: 'Coro',
      duration: audioAnalysis.arrangement.chorus + 2,
      description: 'Repetición del coro con más capas'
    },
    {
      name: 'Puente',
      duration: audioAnalysis.arrangement.bridge + 4,
      description: 'Cambio de dinámica y tonalidad'
    },
    {
      name: 'Coro Final',
      duration: audioAnalysis.arrangement.chorus + 4,
      description: 'Coro final con elementos de cierre'
    },
    {
      name: 'Outro',
      duration: audioAnalysis.arrangement.outro + 2,
      description: 'Cierre atmosférico con fade creativo'
    }
  ];

  return {
    structure: 'Intro → Verso → Pre-Coro → Coro → Verso → Coro → Puente → Coro Final → Outro',
    sections
  };
}

// 🎵 GENERAR INSTRUMENTACIÓN
function generateInstrumentation(audioAnalysis: any) {
  const current = audioAnalysis.instrumentation || [];
  
  const suggested = [
    'Sintetizadores',
    'Cuerdas',
    'Percusión étnica',
    'Efectos atmosféricos',
    'Samplers'
  ];

  const additions = [
    'Arpéggios de sintetizador',
    'Cuerdas en octavas',
    'Shakers y percusión menor',
    'Reverb y delay',
    'Samplers de voz'
  ];

  return {
    current,
    suggested,
    additions
  };
}

// 🎨 GENERAR ELEMENTOS CREATIVOS
function generateCreativeElements(creativityLevel: string): string[] {
  const elements = {
    conservative: [
      'Variaciones sutiles en la dinámica',
      'Agregar capas instrumentales',
      'Mejorar la transición entre secciones'
    ],
    moderate: [
      'Cambios de tonalidad en el puente',
      'Efectos de delay y reverb',
      'Variaciones rítmicas',
      'Elementos de percusión étnica'
    ],
    creative: [
      'Modulaciones inesperadas',
      'Efectos de granulado',
      'Samplers creativos',
      'Cambios de compás',
      'Elementos de música electrónica'
    ],
    experimental: [
      'Microtonalidad',
      'Efectos de distorsión extrema',
      'Samplers de sonidos no musicales',
      'Cambios de tempo dramáticos',
      'Elementos de música concreta',
      'Síntesis granular'
    ]
  };

  return elements[creativityLevel] || elements.moderate;
}

// 💾 GUARDAR PROMPT EN SUPABASE
async function savePromptToSupabase(userId: string, promptResponse: ArrangementPromptResponse, request: ArrangementPromptRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, skipping save');
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/arrangement_prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        user_id: userId,
        audio_analysis: request.audioAnalysis,
        prompt_data: promptResponse,
        creativity_level: request.creativityLevel,
        target_style: request.targetStyle,
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Error saving prompt to Supabase:', response.status);
    }
  } catch (error) {
    console.error('Error saving prompt:', error);
  }
}
