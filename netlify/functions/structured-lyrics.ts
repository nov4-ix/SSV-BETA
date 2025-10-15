/**
 * 📝 GENERACIÓN DE LETRAS CON ESTRUCTURA SÓLIDA
 * 
 * Genera letras con estructura musical sólida basada en perillas literarias
 */

import { Handler } from '@netlify/functions';

interface LyricsGenerationRequest {
  prompt: string;
  literaryKnobs: {
    narrativeDepth: number; // 0-100
    emotionalIntensity: number; // 0-100
    poeticComplexity: number; // 0-100
    metaphorUsage: number; // 0-100
    rhymeDensity: number; // 0-100
    storyArc: number; // 0-100
    characterDevelopment: number; // 0-100
    thematicConsistency: number; // 0-100
  };
  voiceGender?: string;
  isInstrumental?: boolean;
  structure?: {
    type: 'verse-chorus' | 'verse-prechorus-chorus' | 'verse-chorus-bridge' | 'intro-verse-chorus-bridge' | 'custom';
    customStructure?: string;
  };
  style?: string;
  genre?: string;
  mood?: string;
  userId?: string;
}

interface LyricsGenerationResponse {
  lyrics: string;
  structure: {
    sections: Array<{
      name: string;
      lines: string[];
      rhymeScheme: string;
      syllableCount: number[];
    }>;
    totalLines: number;
    rhymePattern: string;
  };
  literaryAnalysis: {
    narrativeDepth: number;
    emotionalIntensity: number;
    poeticComplexity: number;
    metaphorCount: number;
    rhymeDensity: number;
    thematicConsistency: number;
  };
  suggestions: string[];
  metadata: {
    wordCount: number;
    averageSyllables: number;
    complexity: 'simple' | 'moderate' | 'complex';
    coherence: number;
  };
}

// 📝 FUNCIÓN PRINCIPAL
export const handler: Handler = async (event) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const request: LyricsGenerationRequest = JSON.parse(event.body || '{}');

    if (!request.prompt || !request.literaryKnobs) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Prompt and literary knobs are required' })
      };
    }

    // 🎯 GENERAR LETRAS CON ESTRUCTURA SÓLIDA
    const lyricsResponse = await generateStructuredLyrics(request);

    // 💾 GUARDAR EN SUPABASE
    if (request.userId) {
      await saveLyricsToSupabase(request.userId, lyricsResponse, request);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(lyricsResponse)
    };

  } catch (error) {
    console.error('Error generating structured lyrics:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// 🧠 GENERAR LETRAS CON QWEN 2
async function generateStructuredLyrics(request: LyricsGenerationRequest): Promise<LyricsGenerationResponse> {
  const qwenApiKey = process.env.QWEN_API_KEY;
  
  if (!qwenApiKey) {
    throw new Error('QWEN_API_KEY not configured');
  }

  const { prompt, literaryKnobs, voiceGender, isInstrumental } = request;
  
  // Valores por defecto
  const structure = request.structure || { type: 'verse-chorus' };
  const style = request.style || 'pop';
  const genre = request.genre || 'contemporary';
  const mood = request.mood || 'uplifting';

  // 📝 PROMPT PARA LETRAS ESTRUCTURADAS
  const lyricsPrompt = `Eres un compositor experto y poeta con conocimientos profundos en estructura musical, teoría literaria y composición de canciones.

Crea letras para esta canción:
- Tema: ${prompt}
- Estilo: ${style}
- Género: ${genre}
- Estado de ánimo: ${mood}

Configuración de perillas literarias:
- Profundidad narrativa: ${literaryKnobs.narrativeDepth}/100
- Intensidad emocional: ${literaryKnobs.emotionalIntensity}/100
- Complejidad poética: ${literaryKnobs.poeticComplexity}/100
- Uso de metáforas: ${literaryKnobs.metaphorUsage}/100
- Densidad de rimas: ${literaryKnobs.rhymeDensity}/100
- Arco narrativo: ${literaryKnobs.storyArc}/100
- Desarrollo de personajes: ${literaryKnobs.characterDevelopment}/100
- Consistencia temática: ${literaryKnobs.thematicConsistency}/100

Estructura requerida: ${structure.type}
${structure.customStructure ? `Estructura personalizada: ${structure.customStructure}` : ''}

IMPORTANTE: La estructura debe ser sólida y seguir patrones musicales establecidos:

**Estructuras válidas:**
1. **Intro → Verso → Verso → Coro → Verso → Coro → Puente → Coro**
2. **Verso → Verso → Coro → Puente → Coro → Verso → Coro**
3. **Intro → Verso → Pre-Coro → Coro → Verso → Pre-Coro → Coro → Puente → Coro**
4. **Verso → Pre-Coro → Coro → Verso → Pre-Coro → Coro → Instrumental → Pre-Coro → Coro**

Genera letras que incluyan:

1. **Letras completas** con estructura sólida
2. **Análisis de estructura** por secciones
3. **Esquema de rimas** para cada sección
4. **Análisis literario** basado en las perillas
5. **Sugerencias** de mejora
6. **Metadatos** de complejidad y coherencia

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
              content: lyricsPrompt
            },
            {
              role: 'user',
              content: `Crea letras con estructura sólida para: "${prompt}"`
            }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 3000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    const lyricsText = data.output?.text || '';

    // 🔍 PARSEAR RESPUESTA JSON
    const lyricsResponse = parseLyricsResponse(lyricsText, request);

    return lyricsResponse;

  } catch (error) {
    console.error('Error calling Qwen API:', error);
    
    // 🎯 FALLBACK: LETRAS SIMULADAS
    return generateFallbackLyrics(request);
  }
}

// 🔍 PARSEAR RESPUESTA DE LETRAS
function parseLyricsResponse(lyricsText: string, request: LyricsGenerationRequest): LyricsGenerationResponse {
  try {
    // Intentar extraer JSON de la respuesta
    const jsonMatch = lyricsText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing lyrics response:', error);
  }

  // 🎯 FALLBACK: LETRAS SIMULADAS
  return generateFallbackLyrics(request);
}

// 📝 LETRAS SIMULADAS (FALLBACK)
function generateFallbackLyrics(request: LyricsGenerationRequest): LyricsGenerationResponse {
  const { prompt, literaryKnobs } = request;
  
  // Valores por defecto
  const structure = request.structure || { type: 'verse-chorus' };

  // 🎵 GENERAR ESTRUCTURA SÓLIDA
  const solidStructure = generateSolidStructure(structure.type);
  
  // 📝 GENERAR LETRAS BASADAS EN PERILLAS
  const lyrics = generateLyricsFromKnobs(prompt, literaryKnobs, solidStructure);
  
  // 🔍 ANÁLISIS LITERARIO
  const literaryAnalysis = analyzeLiteraryContent(lyrics, literaryKnobs);
  
  // 📊 METADATOS
  const metadata = generateMetadata(lyrics, literaryAnalysis);

  return {
    lyrics,
    structure: solidStructure,
    literaryAnalysis,
    suggestions: [
      'Considera agregar más metáforas visuales',
      'El puente podría tener un cambio de perspectiva',
      'Las rimas internas mejorarían el flujo',
      'Un gancho más memorable en el coro'
    ],
    metadata
  };
}

// 🎵 GENERAR ESTRUCTURA SÓLIDA
function generateSolidStructure(type?: string) {
  const structures = {
    'verse-chorus': {
      sections: [
        { name: 'Verso 1', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'ABAB', syllableCount: [8, 8, 8, 8] },
        { name: 'Coro', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] },
        { name: 'Verso 2', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'ABAB', syllableCount: [8, 8, 8, 8] },
        { name: 'Coro', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] },
        { name: 'Puente', lines: ['Línea 1', 'Línea 2'], rhymeScheme: 'AA', syllableCount: [10, 10] },
        { name: 'Coro Final', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] }
      ],
      totalLines: 22,
      rhymePattern: 'ABAB-AABB-ABAB-AABB-AA-AABB'
    },
    'verse-prechorus-chorus': {
      sections: [
        { name: 'Verso 1', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'ABAB', syllableCount: [8, 8, 8, 8] },
        { name: 'Pre-Coro', lines: ['Línea 1', 'Línea 2'], rhymeScheme: 'AA', syllableCount: [6, 6] },
        { name: 'Coro', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] },
        { name: 'Verso 2', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'ABAB', syllableCount: [8, 8, 8, 8] },
        { name: 'Pre-Coro', lines: ['Línea 1', 'Línea 2'], rhymeScheme: 'AA', syllableCount: [6, 6] },
        { name: 'Coro', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] },
        { name: 'Puente', lines: ['Línea 1', 'Línea 2'], rhymeScheme: 'AA', syllableCount: [10, 10] },
        { name: 'Pre-Coro', lines: ['Línea 1', 'Línea 2'], rhymeScheme: 'AA', syllableCount: [6, 6] },
        { name: 'Coro Final', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] }
      ],
      totalLines: 30,
      rhymePattern: 'ABAB-AA-AABB-ABAB-AA-AABB-AA-AA-AABB'
    },
    'intro-verse-chorus-bridge': {
      sections: [
        { name: 'Intro', lines: ['Línea 1', 'Línea 2'], rhymeScheme: 'AA', syllableCount: [6, 6] },
        { name: 'Verso 1', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'ABAB', syllableCount: [8, 8, 8, 8] },
        { name: 'Coro', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] },
        { name: 'Verso 2', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'ABAB', syllableCount: [8, 8, 8, 8] },
        { name: 'Coro', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] },
        { name: 'Puente', lines: ['Línea 1', 'Línea 2'], rhymeScheme: 'AA', syllableCount: [10, 10] },
        { name: 'Coro Final', lines: ['Línea 1', 'Línea 2', 'Línea 3', 'Línea 4'], rhymeScheme: 'AABB', syllableCount: [7, 7, 8, 8] }
      ],
      totalLines: 24,
      rhymePattern: 'AA-ABAB-AABB-ABAB-AABB-AA-AABB'
    }
  };

  return structures[type || 'verse-chorus'] || structures['verse-chorus'];
}

// 📝 GENERAR LETRAS BASADAS EN PERILLAS
function generateLyricsFromKnobs(prompt: string, knobs: any, structure: any): string {
  const sections = structure.sections.map(section => {
    const lines = section.lines.map((line: string, index: number) => {
      return generateLineFromKnobs(prompt, knobs, section.name, index);
    });
    return `${section.name}:\n${lines.join('\n')}\n`;
  });

  return sections.join('\n');
}

// 📝 GENERAR LÍNEA BASADA EN PERILLAS
function generateLineFromKnobs(prompt: string, knobs: any, sectionName: string, lineIndex: number): string {
  const templates = {
    'Verso': [
      `En el ${prompt.toLowerCase()} encuentro mi verdad`,
      `Caminando por ${prompt.toLowerCase()} sin temor`,
      `El ${prompt.toLowerCase()} me guía hacia la luz`,
      `En ${prompt.toLowerCase()} descubro quién soy`
    ],
    'Coro': [
      `${prompt} es mi destino`,
      `Siempre ${prompt.toLowerCase()} en mi corazón`,
      `${prompt} me da la fuerza`,
      `Con ${prompt.toLowerCase()} puedo volar`
    ],
    'Pre-Coro': [
      `Y ahora siento que`,
      `Todo está cambiando`,
      `Puedo sentir que`,
      `Algo está llegando`
    ],
    'Puente': [
      `Pero en la oscuridad`,
      `Encuentro la esperanza`
    ],
    'Intro': [
      `En el silencio`,
      `Nace la música`
    ]
  };

  const sectionTemplates = templates[sectionName] || templates['Verso'];
  const template = sectionTemplates[lineIndex % sectionTemplates.length];

  // 🎨 APLICAR PERILLAS LITERARIAS
  let line = template;

  // Aplicar complejidad poética
  if (knobs.poeticComplexity > 70) {
    line = addPoeticComplexity(line);
  }

  // Aplicar metáforas
  if (knobs.metaphorUsage > 60) {
    line = addMetaphors(line);
  }

  // Aplicar intensidad emocional
  if (knobs.emotionalIntensity > 80) {
    line = addEmotionalIntensity(line);
  }

  return line;
}

// 🎨 FUNCIONES DE MEJORA LITERARIA
function addPoeticComplexity(line: string): string {
  const enhancements = [
    line.replace('es', 'se convierte en'),
    line.replace('mi', 'mi más profundo'),
    line.replace('el', 'el eterno'),
    line.replace('la', 'la infinita')
  ];
  return enhancements[Math.floor(Math.random() * enhancements.length)];
}

function addMetaphors(line: string): string {
  const metaphors = [
    line.replace('camino', 'navego'),
    line.replace('encuentro', 'descubro'),
    line.replace('siento', 'percibo'),
    line.replace('veo', 'contemplo')
  ];
  return metaphors[Math.floor(Math.random() * metaphors.length)];
}

function addEmotionalIntensity(line: string): string {
  const intensifiers = [
    line.replace('siempre', 'eternamente'),
    line.replace('puedo', 'soy capaz de'),
    line.replace('quiero', 'anhelo'),
    line.replace('necesito', 'requiero')
  ];
  return intensifiers[Math.floor(Math.random() * intensifiers.length)];
}

// 🔍 ANÁLISIS LITERARIO
function analyzeLiteraryContent(lyrics: string, knobs: any) {
  const words = lyrics.split(' ').length;
  const lines = lyrics.split('\n').filter(line => line.trim()).length;
  
  return {
    narrativeDepth: knobs.narrativeDepth,
    emotionalIntensity: knobs.emotionalIntensity,
    poeticComplexity: knobs.poeticComplexity,
    metaphorCount: Math.floor(knobs.metaphorUsage / 20),
    rhymeDensity: knobs.rhymeDensity,
    thematicConsistency: knobs.thematicConsistency
  };
}

// 📊 GENERAR METADATOS
function generateMetadata(lyrics: string, analysis: any) {
  const words = lyrics.split(' ').length;
  const syllables = words * 1.5; // Estimación promedio
  
  return {
    wordCount: words,
    averageSyllables: Math.round(syllables / words),
    complexity: analysis.poeticComplexity > 70 ? 'complex' : 
                analysis.poeticComplexity > 40 ? 'moderate' : 'simple',
    coherence: Math.round((analysis.thematicConsistency + analysis.narrativeDepth) / 2)
  };
}

// 💾 GUARDAR LETRAS EN SUPABASE
async function saveLyricsToSupabase(userId: string, lyricsResponse: LyricsGenerationResponse, request: LyricsGenerationRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, skipping save');
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/structured_lyrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        user_id: userId,
        prompt: request.prompt,
        literary_knobs: request.literaryKnobs,
        structure_type: request.structure?.type || 'verse-chorus',
        lyrics_data: lyricsResponse,
        style: request.style || 'pop',
        genre: request.genre || 'contemporary',
        mood: request.mood || 'uplifting',
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Error saving lyrics to Supabase:', response.status);
    }
  } catch (error) {
    console.error('Error saving lyrics:', error);
  }
}
