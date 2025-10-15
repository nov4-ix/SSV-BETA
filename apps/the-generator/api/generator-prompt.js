/**
 * ✨ GENERATOR PROMPT API - VERCEL SERVERLESS FUNCTION
 * 
 * Genera prompts creativos y variados para música
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
    const input = body.input || body.prompt || '';
    
    console.log('✨ Generator Prompt Request:', {
      input: input.substring(0, 100) + '...',
      hasInput: !!input
    });

    // Detectar género y mood del input
    const genreHints = detectGenreHints(input);
    const moodWords = detectMoodWords(input);
    
    console.log('🎭 Detected Genre:', genreHints);
    console.log('😊 Detected Mood:', moodWords);

    // Generar prompt creativo y variado
    const creativePrompt = generateCreativePrompt(genreHints, moodWords, input);
    const metadata = generateMetadata(genreHints, moodWords);

    console.log('🎵 Generated Creative Prompt:', creativePrompt.substring(0, 200) + '...');

    return res.status(200).json({
      success: true,
      prompt: creativePrompt,
      metadata,
      genre: genreHints,
      mood: moodWords
    });

  } catch (error) {
    console.error('❌ Error in generator-prompt:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
}

function detectGenreHints(input) {
  const genreKeywords = {
    rock: ['rock', 'guitar', 'distorted', 'electric', 'heavy', 'metal', 'punk', 'grunge'],
    pop: ['pop', 'catchy', 'melodic', 'radio', 'mainstream', 'commercial'],
    hiphop: ['hip hop', 'rap', 'beat', 'rhythm', 'urban', 'street', 'trap'],
    electronic: ['electronic', 'synth', 'dance', 'techno', 'house', 'edm', 'ambient'],
    jazz: ['jazz', 'smooth', 'saxophone', 'trumpet', 'swing', 'blues'],
    classical: ['classical', 'orchestral', 'symphony', 'piano', 'violin', 'elegant'],
    indie: ['indie', 'alternative', 'underground', 'experimental', 'artistic'],
    reggae: ['reggae', 'caribbean', 'island', 'tropical', 'calypso'],
    country: ['country', 'folk', 'acoustic', 'western', 'rural'],
    rnb: ['r&b', 'soul', 'funk', 'groove', 'smooth']
  };

  const lowerInput = input.toLowerCase();
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      return genre;
    }
  }
  
  return 'pop'; // Default
}

function detectMoodWords(input) {
  const moodKeywords = {
    happy: ['happy', 'joyful', 'cheerful', 'upbeat', 'positive', 'bright', 'energetic'],
    sad: ['sad', 'melancholy', 'depressed', 'blue', 'down', 'gloomy', 'sorrowful'],
    angry: ['angry', 'furious', 'rage', 'intense', 'aggressive', 'hostile'],
    calm: ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'gentle'],
    romantic: ['romantic', 'love', 'passionate', 'intimate', 'tender', 'sweet'],
    mysterious: ['mysterious', 'dark', 'mystical', 'enigmatic', 'haunting', 'eerie'],
    nostalgic: ['nostalgic', 'retro', 'vintage', 'old', 'classic', 'timeless'],
    epic: ['epic', 'grand', 'powerful', 'majestic', 'heroic', 'dramatic']
  };

  const lowerInput = input.toLowerCase();
  
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      return mood;
    }
  }
  
  return 'happy'; // Default
}

function generateCreativePrompt(genre, mood, input) {
  // Arrays de elementos creativos para mayor variedad
  const instruments = {
    rock: ['distorted electric guitars', 'thunderous drums', 'punchy bass', 'power chords', 'crunchy riffs'],
    pop: ['catchy melodies', 'synthetic beats', 'vocal harmonies', 'bright synths', 'uplifting chords'],
    hiphop: ['heavy 808s', 'trap hi-hats', 'bass drops', 'urban samples', 'rhythmic flows'],
    electronic: ['pulsating synths', 'electronic beats', 'filter sweeps', 'ambient pads', 'digital textures'],
    jazz: ['smooth saxophone', 'piano melodies', 'walking bass', 'swing rhythms', 'brass sections'],
    classical: ['orchestral strings', 'grand piano', 'woodwind sections', 'timpani drums', 'brass fanfares'],
    indie: ['alternative guitars', 'lo-fi textures', 'experimental sounds', 'artistic arrangements', 'unique timbres'],
    reggae: ['tropical rhythms', 'island vibes', 'reggae basslines', 'steel drums', 'caribbean melodies'],
    country: ['acoustic guitars', 'country fiddle', 'steel guitar', 'folk melodies', 'rural sounds'],
    rnb: ['smooth vocals', 'funky basslines', 'soulful melodies', 'groove rhythms', 'sultry tones']
  };

  const atmospheres = {
    happy: ['uplifting', 'energetic', 'bright', 'vibrant', 'cheerful', 'sunny'],
    sad: ['melancholic', 'emotional', 'touching', 'heartfelt', 'moving', 'poignant'],
    angry: ['intense', 'powerful', 'aggressive', 'driving', 'forceful', 'explosive'],
    calm: ['peaceful', 'serene', 'gentle', 'soothing', 'relaxing', 'meditative'],
    romantic: ['passionate', 'intimate', 'tender', 'sweet', 'loving', 'romantic'],
    mysterious: ['dark', 'mystical', 'enigmatic', 'haunting', 'atmospheric', 'eerie'],
    nostalgic: ['retro', 'vintage', 'classic', 'timeless', 'nostalgic', 'old-school'],
    epic: ['grand', 'majestic', 'heroic', 'dramatic', 'powerful', 'cinematic']
  };

  const textures = ['layered', 'rich', 'complex', 'dynamic', 'textured', 'full', 'deep', 'warm', 'bright', 'crisp'];
  const rhythms = ['driving', 'pulsating', 'rhythmic', 'groovy', 'syncopated', 'steady', 'varied', 'complex'];

  // Seleccionar elementos aleatorios para mayor variedad
  const selectedInstruments = instruments[genre] || instruments.pop;
  const selectedAtmospheres = atmospheres[mood] || atmospheres.happy;
  
  const randomInstrument = selectedInstruments[Math.floor(Math.random() * selectedInstruments.length)];
  const randomAtmosphere = selectedAtmospheres[Math.floor(Math.random() * selectedAtmospheres.length)];
  const randomTexture = textures[Math.floor(Math.random() * textures.length)];
  const randomRhythm = rhythms[Math.floor(Math.random() * rhythms.length)];

  // Construir prompt creativo
  let prompt = `${randomAtmosphere} ${genre} with ${randomInstrument}`;
  
  if (input.trim()) {
    prompt += `, inspired by "${input.trim().substring(0, 50)}"`;
  }
  
  prompt += `, ${randomTexture} production, ${randomRhythm} rhythm`;
  
  // Agregar elementos adicionales según el género
  if (genre === 'rock') {
    prompt += ', thunderous kick, punchy production, complex rhythm, filter sweeps';
  } else if (genre === 'electronic') {
    prompt += ', electronic beats, synth layers, digital effects, ambient atmosphere';
  } else if (genre === 'jazz') {
    prompt += ', smooth instrumentation, sophisticated arrangements, elegant phrasing';
  } else if (genre === 'classical') {
    prompt += ', orchestral grandeur, majestic arrangements, timeless elegance';
  }

  return prompt;
}

function generateMetadata(genre, mood) {
  const bpmRanges = {
    rock: '120-140 BPM',
    pop: '100-130 BPM',
    hiphop: '70-100 BPM',
    electronic: '120-140 BPM',
    jazz: '80-120 BPM',
    classical: '60-120 BPM',
    indie: '90-130 BPM',
    reggae: '70-90 BPM',
    country: '80-120 BPM',
    rnb: '70-100 BPM'
  };

  const keySignatures = ['C major', 'G major', 'D major', 'A major', 'E major', 'F major', 'Bb major', 'Eb major'];
  const randomKey = keySignatures[Math.floor(Math.random() * keySignatures.length)];

  return {
    genre,
    mood,
    bpm: bpmRanges[genre] || '100-120 BPM',
    key: randomKey,
    style: `${mood} ${genre}`,
    complexity: 'medium-high'
  };
}
