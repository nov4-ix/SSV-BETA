/**
 * 🎛️ PROMPTS INTELIGENTES PARA THE GENERATOR
 * 
 * Genera prompts creativos para arreglos en The Generator
 */

import { Handler } from '@netlify/functions';

interface GeneratorPromptRequest {
  prompt: string;
  style: string;
  genre: string;
  mood: string;
  creativityLevel?: 'conservative' | 'moderate' | 'creative' | 'experimental';
  targetInstrumentation?: string[];
  arrangementGoals?: string[];
  userId?: string;
}

interface GeneratorPromptResponse {
  basePrompt: string;
  enhancedPrompt: string;
  creativePrompt: string;
  technicalPrompt: string;
  arrangementSuggestions: Array<{
    section: string;
    suggestion: string;
    confidence: number;
  }>;
  instrumentation: {
    primary: string[];
    secondary: string[];
    effects: string[];
  };
  creativeElements: string[];
  technicalSpecs: {
    tempo: string;
    key: string;
    timeSignature: string;
    dynamics: string;
  };
  confidence: number;
}

// 🎛️ FUNCIÓN PRINCIPAL
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const request: GeneratorPromptRequest = JSON.parse(event.body || '{}');

    if (!request.prompt) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    // 🎯 GENERAR PROMPTS INTELIGENTES
    const promptResponse = await generateIntelligentPrompts(request);

    // 💾 GUARDAR EN SUPABASE
    if (request.userId) {
      await savePromptsToSupabase(request.userId, promptResponse, request);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptResponse)
    };

  } catch (error) {
    console.error('Error generating intelligent prompts:', error);
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

// 🧠 GENERAR PROMPTS INTELIGENTES CON QWEN 2
async function generateIntelligentPrompts(request: GeneratorPromptRequest): Promise<GeneratorPromptResponse> {
  const qwenApiKey = process.env.QWEN_API_KEY;
  
  if (!qwenApiKey) {
    throw new Error('QWEN_API_KEY not configured');
  }

  const { prompt, style, genre, mood, creativityLevel = 'moderate', targetInstrumentation, arrangementGoals } = request;

  // 🎛️ PROMPT PARA THE GENERATOR
  const generatorPrompt = `Eres un productor musical experto y arreglista creativo especializado en The Generator de Son1kverse.

Crea prompts inteligentes para esta canción:
- Tema: ${prompt}
- Estilo: ${style}
- Género: ${genre}
- Estado de ánimo: ${mood}
- Nivel de creatividad: ${creativityLevel}

${targetInstrumentation ? `Instrumentación objetivo: ${targetInstrumentation.join(', ')}` : ''}
${arrangementGoals ? `Objetivos de arreglo: ${arrangementGoals.join(', ')}` : ''}

Genera múltiples tipos de prompts:

1. **Prompt Base**: Versión simple y directa
2. **Prompt Mejorado**: Versión más detallada y técnica
3. **Prompt Creativo**: Versión con elementos innovadores
4. **Prompt Técnico**: Versión con especificaciones técnicas

También incluye:
- **Sugerencias de arreglo** por sección (intro, verso, coro, puente, outro)
- **Instrumentación** (primaria, secundaria, efectos)
- **Elementos creativos** específicos
- **Especificaciones técnicas** (tempo, tonalidad, compás, dinámicas)
- **Nivel de confianza** en las sugerencias

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
              content: generatorPrompt
            },
            {
              role: 'user',
              content: `Genera prompts inteligentes para The Generator con nivel de creatividad ${creativityLevel}.`
            }
          ]
        },
        parameters: {
          temperature: creativityLevel === 'experimental' ? 0.9 : 
                      creativityLevel === 'creative' ? 0.7 : 
                      creativityLevel === 'moderate' ? 0.5 : 0.3,
          max_tokens: 3000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    const promptText = data.output?.text || '';

    // 🔍 PARSEAR RESPUESTA JSON
    const promptResponse = parsePromptResponse(promptText, request);

    return promptResponse;

  } catch (error) {
    console.error('Error calling Qwen API:', error);
    
    // 🎯 FALLBACK: PROMPTS SIMULADOS
    return generateFallbackPrompts(request);
  }
}

// 🔍 PARSEAR RESPUESTA DE PROMPTS
function parsePromptResponse(promptText: string, request: GeneratorPromptRequest): GeneratorPromptResponse {
  try {
    // Intentar extraer JSON de la respuesta
    const jsonMatch = promptText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing prompt response:', error);
  }

  // 🎯 FALLBACK: PROMPTS SIMULADOS
  return generateFallbackPrompts(request);
}

// 🎛️ PROMPTS SIMULADOS (FALLBACK)
function generateFallbackPrompts(request: GeneratorPromptRequest): GeneratorPromptResponse {
  const { prompt, style, genre, mood, creativityLevel } = request;

  const basePrompt = `Genera una canción de ${style} con tema "${prompt}" en estilo ${genre}`;
  
  const enhancedPrompt = `${basePrompt}. 
  
Especificaciones:
- Estado de ánimo: ${mood}
- Estructura: Intro → Verso → Pre-Coro → Coro → Verso → Coro → Puente → Coro
- Dinámicas: Crescendo en pre-coros, máximo impacto en coros
- Instrumentación: Guitarra, bajo, batería, sintetizadores`;

  const creativePrompt = `${enhancedPrompt}

Elementos creativos:
- Modulación en el puente
- Efectos de delay en las voces
- Arpéggios de sintetizador
- Percusión étnica
- Cambios de tempo sutiles`;

  const technicalPrompt = `${creativePrompt}

Especificaciones técnicas:
- Tempo: 120-140 BPM
- Tonalidad: C mayor o A menor
- Compás: 4/4
- Dinámicas: pp → mf → f → ff`;

  const arrangementSuggestions = generateArrangementSuggestions(creativityLevel);
  const instrumentation = generateInstrumentation(style, genre);
  const creativeElements = generateCreativeElements(creativityLevel);
  const technicalSpecs = generateTechnicalSpecs(style, mood);

  return {
    basePrompt,
    enhancedPrompt,
    creativePrompt,
    technicalPrompt,
    arrangementSuggestions,
    instrumentation,
    creativeElements,
    technicalSpecs,
    confidence: 80
  };
}

// 🎵 GENERAR SUGERENCIAS DE ARREGLO
function generateArrangementSuggestions(creativityLevel: string) {
  const suggestions = {
    conservative: [
      { section: 'Intro', suggestion: 'Entrada suave con guitarra acústica', confidence: 90 },
      { section: 'Verso', suggestion: 'Ritmo estable con elementos básicos', confidence: 85 },
      { section: 'Pre-Coro', suggestion: 'Crescendo gradual hacia el coro', confidence: 80 },
      { section: 'Coro', suggestion: 'Máxima energía con todos los instrumentos', confidence: 90 },
      { section: 'Puente', suggestion: 'Cambio de dinámica con elementos minimalistas', confidence: 75 },
      { section: 'Outro', suggestion: 'Fade-out suave y elegante', confidence: 85 }
    ],
    moderate: [
      { section: 'Intro', suggestion: 'Entrada atmosférica con sintetizadores', confidence: 85 },
      { section: 'Verso', suggestion: 'Ritmo con variaciones sutiles', confidence: 80 },
      { section: 'Pre-Coro', suggestion: 'Crescendo con efectos de delay', confidence: 85 },
      { section: 'Coro', suggestion: 'Impacto máximo con capas instrumentales', confidence: 90 },
      { section: 'Puente', suggestion: 'Cambio de tonalidad y ritmo', confidence: 80 },
      { section: 'Outro', suggestion: 'Cierre dramático con elementos ambientales', confidence: 85 }
    ],
    creative: [
      { section: 'Intro', suggestion: 'Entrada experimental con samples', confidence: 80 },
      { section: 'Verso', suggestion: 'Ritmo con cambios de compás', confidence: 75 },
      { section: 'Pre-Coro', suggestion: 'Crescendo con modulaciones', confidence: 80 },
      { section: 'Coro', suggestion: 'Impacto con elementos electrónicos', confidence: 85 },
      { section: 'Puente', suggestion: 'Cambio radical de estilo', confidence: 75 },
      { section: 'Outro', suggestion: 'Cierre experimental con efectos', confidence: 80 }
    ],
    experimental: [
      { section: 'Intro', suggestion: 'Entrada con música concreta', confidence: 70 },
      { section: 'Verso', suggestion: 'Ritmo con microtonalidad', confidence: 65 },
      { section: 'Pre-Coro', suggestion: 'Crescendo con síntesis granular', confidence: 70 },
      { section: 'Coro', suggestion: 'Impacto con distorsión extrema', confidence: 75 },
      { section: 'Puente', suggestion: 'Cambio de género completo', confidence: 70 },
      { section: 'Outro', suggestion: 'Cierre con elementos aleatorios', confidence: 65 }
    ]
  };

  return suggestions[creativityLevel] || suggestions.moderate;
}

// 🎵 GENERAR INSTRUMENTACIÓN
function generateInstrumentation(style: string, genre: string) {
  const instrumentations = {
    'rock': {
      primary: ['Guitarra eléctrica', 'Bajo', 'Batería'],
      secondary: ['Guitarra acústica', 'Piano', 'Sintetizadores'],
      effects: ['Distorsión', 'Reverb', 'Delay', 'Chorus']
    },
    'pop': {
      primary: ['Sintetizadores', 'Batería', 'Bajo'],
      secondary: ['Piano', 'Guitarra', 'Cuerdas'],
      effects: ['Compresión', 'EQ', 'Reverb', 'Auto-tune']
    },
    'electronic': {
      primary: ['Sintetizadores', 'Samplers', 'Drum Machine'],
      secondary: ['Efectos', 'Vocoders', 'Arpéggiadores'],
      effects: ['Filtros', 'Distorsión', 'Granular', 'Modulación']
    },
    'acoustic': {
      primary: ['Guitarra acústica', 'Bajo acústico', 'Percusión'],
      secondary: ['Piano', 'Cuerdas', 'Armónica'],
      effects: ['Reverb natural', 'Compresión suave', 'EQ']
    }
  };

  return instrumentations[style.toLowerCase()] || instrumentations.pop;
}

// 🎨 GENERAR ELEMENTOS CREATIVOS
function generateCreativeElements(creativityLevel: string): string[] {
  const elements = {
    conservative: [
      'Variaciones sutiles en la dinámica',
      'Agregar capas instrumentales',
      'Mejorar transiciones entre secciones'
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

// 🔧 GENERAR ESPECIFICACIONES TÉCNICAS
function generateTechnicalSpecs(style: string, mood: string) {
  const tempos = {
    'energetic': '140-160 BPM',
    'moderate': '120-140 BPM',
    'slow': '80-100 BPM',
    'melancholic': '70-90 BPM'
  };

  const keys = {
    'energetic': 'C mayor, G mayor',
    'moderate': 'C mayor, F mayor',
    'slow': 'A menor, D menor',
    'melancholic': 'A menor, E menor'
  };

  const dynamics = {
    'energetic': 'mf → f → ff',
    'moderate': 'mp → mf → f',
    'slow': 'p → mp → mf',
    'melancholic': 'pp → p → mp'
  };

  return {
    tempo: tempos[mood] || tempos.moderate,
    key: keys[mood] || keys.moderate,
    timeSignature: '4/4',
    dynamics: dynamics[mood] || dynamics.moderate
  };
}

// 💾 GUARDAR PROMPTS EN SUPABASE
async function savePromptsToSupabase(userId: string, promptResponse: GeneratorPromptResponse, request: GeneratorPromptRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, skipping save');
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/generator_prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        user_id: userId,
        prompt: request.prompt,
        style: request.style,
        genre: request.genre,
        mood: request.mood,
        creativity_level: request.creativityLevel,
        prompt_data: promptResponse,
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Error saving prompts to Supabase:', response.status);
    }
  } catch (error) {
    console.error('Error saving prompts:', error);
  }
}
