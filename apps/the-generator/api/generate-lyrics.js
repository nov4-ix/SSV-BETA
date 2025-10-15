/**
 * 🎵 GENERATE LYRICS API - VERCEL SERVERLESS FUNCTION
 * 
 * Genera letras usando Qwen-2 con estilo personalizado
 */

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const lyricsInput = body.lyricsInput || body.input || '';
    const literaryValues = body.literaryValues || {};
    
    console.log('🎵 Generate Lyrics Request:', {
      input: lyricsInput.substring(0, 100) + '...',
      literaryValues
    });

    // Validar entrada
    if (!lyricsInput || typeof lyricsInput !== 'string' || lyricsInput.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'El input debe tener al menos 10 caracteres'
      });
    }

    // Detectar género
    const genreHint = detectGenre(lyricsInput);
    console.log('🎭 Detected Genre:', genreHint);

    // Construir prompt con estilo personalizado
    const prompt = buildPrompt(lyricsInput, genreHint, literaryValues);
    console.log('📝 Generated Prompt:', prompt.substring(0, 200) + '...');

    // Generar letras con Qwen-2
    const lyrics = await generateWithQwen(prompt);
    
    if (!lyrics || lyrics.trim().length < 50) {
      return res.status(500).json({
        success: false,
        error: 'No se pudieron generar letras válidas'
      });
    }

    console.log('✅ Generated Lyrics Length:', lyrics.length);

    return res.status(200).json({
      success: true,
      lyrics: lyrics.trim(),
      genre: genreHint,
      literaryValues
    });

  } catch (error) {
    console.error('❌ Error in generate-lyrics:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
}

function detectGenre(input) {
  const genreKeywords = {
    rock: ['rock', 'guitar', 'distorted', 'electric', 'heavy', 'metal', 'punk'],
    pop: ['pop', 'catchy', 'melodic', 'radio', 'mainstream'],
    hiphop: ['hip hop', 'rap', 'beat', 'rhythm', 'urban', 'street'],
    electronic: ['electronic', 'synth', 'dance', 'techno', 'house'],
    jazz: ['jazz', 'smooth', 'saxophone', 'trumpet', 'swing'],
    classical: ['classical', 'orchestral', 'symphony', 'piano'],
    indie: ['indie', 'alternative', 'underground', 'experimental'],
    reggae: ['reggae', 'caribbean', 'island', 'tropical'],
    country: ['country', 'folk', 'acoustic', 'western'],
    rnb: ['r&b', 'soul', 'funk', 'groove']
  };

  const lowerInput = input.toLowerCase();
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      return genre;
    }
  }
  
  return 'pop';
}

function buildPrompt(input, genre, literaryValues) {
  const styleProfile = getStyleProfile();
  
  // Construir prompt base
  let prompt = `Eres un compositor experto especializado en ${genre}. `;
  
  // Agregar perfil de estilo
  prompt += `Tu estilo se caracteriza por: ${styleProfile}. `;
  
  // Agregar valores literarios
  if (literaryValues.intensidadEmocional > 0.5) {
    prompt += `Usa intensidad emocional alta. `;
  }
  if (literaryValues.metafora > 0.5) {
    prompt += `Incluye metáforas creativas y originales. `;
  }
  if (literaryValues.ritmoOMetrica > 0.5) {
    prompt += `Mantén ritmo y métrica consistentes. `;
  }
  if (literaryValues.profundidadNarrativa > 0.5) {
    prompt += `Desarrolla profundidad narrativa. `;
  }
  if (literaryValues.complejidadPoetica > 0.5) {
    prompt += `Usa complejidad poética elevada. `;
  }
  if (literaryValues.densidadLirica > 0.5) {
    prompt += `Aumenta la densidad lírica. `;
  }
  
  // Instrucciones específicas
  prompt += `Crea una canción completa con estructura: [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Pre-Chorus], [Chorus], [Bridge], [Chorus], [Outro]. `;
  prompt += `Basándote en esta inspiración: "${input.trim()}". `;
  prompt += `NO copies directamente el texto, crea contenido original con la misma esencia emocional. `;
  prompt += `Usa metáforas nuevas y profundas. `;
  prompt += `Escribe en español. `;
  prompt += `Cada sección debe tener 4-6 líneas. `;
  
  return prompt;
}

function getStyleProfile() {
  return `metáforas profundas y originales, emociones auténticas, narrativas complejas, lenguaje poético sofisticado, imágenes vívidas, conexiones emocionales profundas, versos que trascienden lo literal`;
}

async function generateWithQwen(prompt) {
  try {
    // Simular llamada a Qwen-2 (reemplazar con implementación real)
    const response = await fetch('https://api.qwen.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QWEN_API_KEY || 'your-qwen-key'}`
      },
      body: JSON.stringify({
        model: 'qwen-2-72b-instruct',
        messages: [
          {
            role: 'system',
            content: 'Eres un compositor experto que crea letras originales y profundas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    return extractTextFromQwenResponse(data);
    
  } catch (error) {
    console.error('Qwen API Error:', error);
    
    // Fallback: generar letras localmente
    return generateLocalLyrics(prompt);
  }
}

function extractTextFromQwenResponse(data) {
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  throw new Error('Invalid Qwen response format');
}

function generateLocalLyrics(prompt) {
  // Generar letras localmente como fallback
  const verses = [
    "[Intro]\nEn el silencio de la noche\nDonde los sueños se despiertan\nTu voz resuena en mi mente\nComo una melodía eterna",
    
    "[Verse 1]\nLos años pasan pero mi amor crece más\nContigo aprendí lo que es amar de verdad\nCada momento a tu lado es un regalo\nY en tu corazón encontré mi hogar ideal",
    
    "[Pre-Chorus]\nAunque la distancia\nNos separe un poco\nMi corazón late\nSolo por ti",
    
    "[Chorus]\nEres mi sol, eres mi luna\nEres mi estrella, mi fortuna\nAmor, amor, mi corazón\nLate solo por ti",
    
    "[Verse 2]\nLos recuerdos se entrelazan\nComo hilos de seda en el viento\nTu risa es mi canción favorita\nY tu amor mi mejor momento",
    
    "[Bridge]\nLos días se vuelven grises\nPero tu recuerdo brilla\nComo una estrella\nEn mi vida",
    
    "[Outro]\nEsta canción es mi verdad\nMi forma de expresar\nTodo lo que siento\nSin poderte hablar"
  ];
  
  return verses.join('\n\n');
}
