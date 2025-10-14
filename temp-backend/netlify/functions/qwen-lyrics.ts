/**
 * 🎵 NETLIFY FUNCTION: GENERACIÓN DE LETRAS CON QWEN 2
 * 
 * Genera letras de canciones con coherencia narrativa usando Qwen 2
 */

import { Handler } from '@netlify/functions';

interface LyricsRequest {
  prompt: string;
  style: string;
  genre: string;
  mood: string;
  language: 'es' | 'en';
  length: 'short' | 'medium' | 'long';
  userId?: string;
}

interface LyricsResponse {
  lyrics: string;
  structure: {
    verses: number;
    chorus: number;
    bridge?: number;
  };
  metadata: {
    language: string;
    wordCount: number;
    coherence: number;
    creativity: number;
  };
  suggestions: string[];
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
    const request: LyricsRequest = JSON.parse(event.body || '{}');
    
    if (!request.prompt || !request.style) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'prompt and style are required' })
      };
    }

    // Generar letras usando Qwen 2
    const lyrics = await generateLyrics(request);
    
    // Analizar estructura
    const structure = analyzeLyricsStructure(lyrics);
    
    // Calcular métricas
    const metadata = {
      language: request.language,
      wordCount: lyrics.split(' ').length,
      coherence: calculateCoherence(lyrics, request),
      creativity: calculateCreativity(lyrics, request)
    };

    // Generar sugerencias
    const suggestions = generateLyricsSuggestions(request, lyrics);

    const response: LyricsResponse = {
      lyrics,
      structure,
      metadata,
      suggestions
    };

    // Guardar en Supabase si hay userId
    if (request.userId) {
      await saveToSupabase(request.userId, 'lyrics', request, response);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error generating lyrics:', error);
    
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

// 🎵 GENERAR LETRAS CON QWEN 2
async function generateLyrics(request: LyricsRequest): Promise<string> {
  const systemPrompt = `Eres un compositor experto especializado en crear letras de canciones coherentes y emocionales.

Instrucciones específicas:
- Genera letras que tengan coherencia temática y emocional
- Incluye versos, estribillos y puentes bien estructurados
- Usa lenguaje poético pero accesible
- Adapta el estilo al género musical solicitado
- Mantén consistencia narrativa a lo largo de toda la canción
- ${request.language === 'es' ? 'Escribe en español' : 'Write in English'}

Estructura sugerida:
- 2-3 versos
- 1 estribillo repetido
- 1 puente (opcional)
- Longitud: ${request.length === 'short' ? '150-200 palabras' : request.length === 'medium' ? '200-300 palabras' : '300-400 palabras'}`;

  const userPrompt = `Crea letras para una canción con estas características:

Tema/Prompt: "${request.prompt}"
Estilo musical: ${request.style}
Género: ${request.genre}
Mood/Atmósfera: ${request.mood}
Idioma: ${request.language === 'es' ? 'Español' : 'English'}

Genera letras completas y coherentes:`;

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
        max_tokens: 1000,
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

// 📊 ANALIZAR ESTRUCTURA DE LETRAS
function analyzeLyricsStructure(lyrics: string) {
  const lines = lyrics.split('\n').filter(line => line.trim());
  
  // Detectar estribillos (líneas repetidas)
  const lineCounts: { [key: string]: number } = {};
  lines.forEach(line => {
    const normalized = line.trim().toLowerCase();
    lineCounts[normalized] = (lineCounts[normalized] || 0) + 1;
  });
  
  const repeatedLines = Object.entries(lineCounts)
    .filter(([_, count]) => count > 1)
    .map(([line, _]) => line);
  
  return {
    verses: Math.max(1, lines.length - repeatedLines.length),
    chorus: repeatedLines.length,
    bridge: lines.length > 8 ? 1 : undefined
  };
}

// 🧠 CALCULAR COHERENCIA
function calculateCoherence(lyrics: string, request: LyricsRequest): number {
  let coherence = 0.5; // Base
  
  // Bonus por longitud adecuada
  const wordCount = lyrics.split(' ').length;
  if (wordCount >= 150 && wordCount <= 400) {
    coherence += 0.2;
  }
  
  // Bonus por repetición de palabras clave (indica tema coherente)
  const words = lyrics.toLowerCase().split(' ');
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const repeatedWords = Object.values(wordFreq).filter(count => count > 1).length;
  if (repeatedWords > 0) {
    coherence += 0.2;
  }
  
  // Bonus por estructura (versos/estribillos)
  const lines = lyrics.split('\n').filter(line => line.trim());
  if (lines.length >= 6) {
    coherence += 0.1;
  }
  
  return Math.min(coherence, 1.0);
}

// 🎨 CALCULAR CREATIVIDAD
function calculateCreativity(lyrics: string, request: LyricsRequest): number {
  let creativity = 0.5; // Base
  
  // Bonus por uso de metáforas y lenguaje poético
  const poeticWords = ['como', 'como si', 'mientras', 'cuando', 'donde', 'hacia', 'desde'];
  const poeticCount = poeticWords.filter(word => lyrics.toLowerCase().includes(word)).length;
  creativity += Math.min(poeticCount * 0.1, 0.3);
  
  // Bonus por variedad de vocabulario
  const uniqueWords = new Set(lyrics.toLowerCase().split(' ').filter(word => word.length > 3));
  const totalWords = lyrics.split(' ').length;
  const vocabularyRatio = uniqueWords.size / totalWords;
  
  if (vocabularyRatio > 0.7) {
    creativity += 0.2;
  }
  
  return Math.min(creativity, 1.0);
}

// 💡 GENERAR SUGERENCIAS DE LETRAS
function generateLyricsSuggestions(request: LyricsRequest, lyrics: string): string[] {
  const suggestions = [];
  
  // Sugerencias basadas en el contenido
  if (!lyrics.includes('[') && !lyrics.includes(']')) {
    suggestions.push('Considera agregar indicaciones musicales como [Instrumental] o [Coro]');
  }
  
  if (lyrics.split('\n').length < 6) {
    suggestions.push('Podrías expandir con más versos o un puente');
  }
  
  // Sugerencias basadas en el género
  if (request.genre.toLowerCase().includes('rock') && !lyrics.toLowerCase().includes('gritar')) {
    suggestions.push('Para rock, considera agregar elementos más intensos');
  }
  
  if (request.genre.toLowerCase().includes('pop') && lyrics.split('\n').length > 12) {
    suggestions.push('Para pop, considera simplificar la estructura');
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
