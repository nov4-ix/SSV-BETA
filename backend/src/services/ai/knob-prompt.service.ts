import { config } from '@/config';
import { logger } from '@/utils/logger';
import { AppError, ServiceUnavailableError } from '@/utils/errors';

// 🎛️ SERVICIO DE KNOBS PARA CONTROL DE PROMPT DE SUNO 🎛️

export interface KnobValue {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
}

export interface TrackAnalysis {
  bpm: number;
  genre: string;
  instrumentation: string[];
  style: string;
  mood: string;
  energy: number;
  complexity: number;
  key: string;
  timeSignature: string;
  duration: number;
}

export interface PromptGenerationRequest {
  trackAnalysis?: TrackAnalysis;
  knobs: KnobValue[];
  basePrompt?: string;
  targetStyle?: string;
  isGhostStudio?: boolean;
}

export interface PromptGenerationResponse {
  prompt: string;
  optimizedPrompt: string;
  knobInfluences: Record<string, string>;
  confidence: number;
  estimatedQuality: number;
  processingTime: number;
}

export class KnobPromptService {
  private readonly SUNO_API_ENDPOINT: string;
  private readonly SUNO_API_KEY: string;

  constructor() {
    this.SUNO_API_ENDPOINT = config.ai.sunoEndpoint || 'https://api.suno.ai/v1';
    this.SUNO_API_KEY = config.ai.sunoApiKey || '';
  }

  // 🎵 ANALIZAR PISTA PARA OBTENER PARÁMETROS BASE 🎵
  async analyzeTrack(audioUrl: string): Promise<TrackAnalysis> {
    logger.info({ audioUrl }, 'Analyzing track for knob optimization');

    try {
      // Simular análisis de pista (en producción sería con ML)
      const analysis: TrackAnalysis = {
        bpm: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
        genre: this.detectGenre(audioUrl),
        instrumentation: this.detectInstrumentation(audioUrl),
        style: this.detectStyle(audioUrl),
        mood: this.detectMood(audioUrl),
        energy: Math.floor(Math.random() * 100),
        complexity: Math.floor(Math.random() * 100),
        key: this.detectKey(audioUrl),
        timeSignature: this.detectTimeSignature(audioUrl),
        duration: Math.floor(Math.random() * 300) + 60 // 60-360 seconds
      };

      logger.info({ analysis }, 'Track analysis completed');

      return analysis;

    } catch (error) {
      logger.error({ error, audioUrl }, 'Failed to analyze track');
      throw new ServiceUnavailableError('Track analysis service is currently unavailable');
    }
  }

  // 🎛️ GENERAR PROMPT OPTIMIZADO CON KNOBS 🎛️
  async generateOptimizedPrompt(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    logger.info({ 
      knobsCount: request.knobs.length, 
      hasTrackAnalysis: !!request.trackAnalysis,
      isGhostStudio: request.isGhostStudio 
    }, 'Generating optimized prompt with knobs');

    const startTime = Date.now();

    try {
      // 1. Crear prompt base
      let basePrompt = request.basePrompt || '';
      
      if (request.trackAnalysis) {
        basePrompt += this.buildTrackAnalysisPrompt(request.trackAnalysis);
      }

      // 2. Procesar cada knob
      const knobInfluences: Record<string, string> = {};
      const knobPrompts: string[] = [];

      for (const knob of request.knobs) {
        const influence = this.processKnob(knob, request.trackAnalysis, request.isGhostStudio);
        knobInfluences[knob.id] = influence;
        knobPrompts.push(influence);
      }

      // 3. Combinar prompts
      const combinedPrompt = basePrompt + ' ' + knobPrompts.join(', ');
      
      // 4. Optimizar para Suno
      const optimizedPrompt = this.optimizeForSuno(combinedPrompt, request.trackAnalysis);

      // 5. Calcular métricas
      const confidence = this.calculateConfidence(request.knobs, request.trackAnalysis);
      const estimatedQuality = this.estimateQuality(optimizedPrompt);

      const response: PromptGenerationResponse = {
        prompt: combinedPrompt,
        optimizedPrompt,
        knobInfluences,
        confidence,
        estimatedQuality,
        processingTime: Date.now() - startTime
      };

      logger.info({ 
        promptLength: optimizedPrompt.length,
        confidence,
        estimatedQuality 
      }, 'Optimized prompt generated successfully');

      return response;

    } catch (error) {
      logger.error({ error, request }, 'Failed to generate optimized prompt');
      throw new ServiceUnavailableError('Prompt generation service is currently unavailable');
    }
  }

  // 🎯 PROCESAR KNOB INDIVIDUAL 🎯
  private processKnob(knob: KnobValue, trackAnalysis?: TrackAnalysis, isGhostStudio?: boolean): string {
    const normalizedValue = (knob.value - knob.min) / (knob.max - knob.min);

    switch (knob.id) {
      case 'expressivity':
        return this.processExpressivityKnob(normalizedValue);
      
      case 'weirdness':
        if (!isGhostStudio) return '';
        return this.processWeirdnessKnob(normalizedValue, trackAnalysis);
      
      case 'grunge':
        return this.processGrungeKnob(normalizedValue);
      
      case 'complexity':
        return this.processComplexityKnob(normalizedValue);
      
      case 'tempo':
        return this.processTempoKnob(knob.value, trackAnalysis);
      
      case 'atmosphere':
        return this.processAtmosphereKnob(normalizedValue);
      
      default:
        return '';
    }
  }

  // 💔 PROCESAR KNOB DE EXPRESIVIDAD 💔
  private processExpressivityKnob(value: number): string {
    if (value < 0.1) return 'extremely sad, melancholic, heartbroken, emotional depth';
    if (value < 0.2) return 'sad, melancholic, introspective, contemplative';
    if (value < 0.3) return 'melancholic, nostalgic, bittersweet, reflective';
    if (value < 0.4) return 'calm, peaceful, serene, tranquil';
    if (value < 0.5) return 'neutral, balanced, moderate, stable';
    if (value < 0.6) return 'uplifting, positive, cheerful, optimistic';
    if (value < 0.7) return 'happy, joyful, energetic, vibrant';
    if (value < 0.8) return 'excited, enthusiastic, passionate, dynamic';
    if (value < 0.9) return 'intense, dramatic, powerful, emotional';
    return 'frenetic, chaotic, overwhelming, intense emotional expression';
  }

  // 🎭 PROCESAR KNOB DE RAREZA (GHOST STUDIO ONLY) 🎭
  private processWeirdnessKnob(value: number, trackAnalysis?: TrackAnalysis): string {
    const baseStyle = trackAnalysis?.style || 'modern';
    
    if (value < 0.2) return `faithful to original ${baseStyle} arrangement, traditional interpretation`;
    if (value < 0.4) return `slight variation on ${baseStyle}, subtle reinterpretation`;
    if (value < 0.6) return `creative ${baseStyle} reinterpretation, modern twist`;
    if (value < 0.8) return `experimental ${baseStyle} arrangement, avant-garde approach`;
    return `completely deconstructed ${baseStyle}, abstract interpretation, experimental`;
  }

  // 🔥 PROCESAR KNOB DE GRUNGE 🔥
  private processGrungeKnob(value: number): string {
    if (value < 0.2) return 'clean, polished, pristine sound, high fidelity';
    if (value < 0.4) return 'slight distortion, warm overdrive, vintage tone';
    if (value < 0.6) return 'moderate distortion, gritty texture, raw sound';
    if (value < 0.8) return 'heavy distortion, aggressive tone, powerful';
    return 'extreme distortion, chaotic noise, wall of sound, intense';
  }

  // ⭐ PROCESAR KNOB DE COMPLEJIDAD ⭐
  private processComplexityKnob(value: number): string {
    if (value < 0.2) return 'simple, minimal, stripped down, essential elements only';
    if (value < 0.4) return 'moderate complexity, standard arrangement, balanced';
    if (value < 0.6) return 'complex, layered, sophisticated, intricate';
    if (value < 0.8) return 'highly complex, intricate arrangements, detailed';
    return 'extremely complex, orchestral, maximalist, dense arrangements';
  }

  // ⚡ PROCESAR KNOB DE TEMPO ⚡
  private processTempoKnob(value: number, trackAnalysis?: TrackAnalysis): string {
    const originalBpm = trackAnalysis?.bpm || 120;
    const tempoChange = Math.abs(value - originalBpm);
    
    if (value < 80) return 'slow tempo, ballad-like, relaxed, contemplative rhythm';
    if (value < 100) return 'moderate tempo, steady rhythm, comfortable pace';
    if (value < 120) return 'upbeat tempo, energetic rhythm, driving beat';
    if (value < 140) return 'fast tempo, driving rhythm, intense pace';
    return 'very fast tempo, frenetic rhythm, high energy';
  }

  // 🌙 PROCESAR KNOB DE ATMÓSFERA 🌙
  private processAtmosphereKnob(value: number): string {
    if (value < 0.2) return 'bright, sunny, optimistic atmosphere, uplifting mood';
    if (value < 0.4) return 'warm, cozy, intimate atmosphere, comfortable';
    if (value < 0.6) return 'neutral, balanced atmosphere, natural';
    if (value < 0.8) return 'dark, mysterious, atmospheric, moody';
    return 'haunting, ethereal, otherworldly atmosphere, mystical';
  }

  // 🎵 CONSTRUIR PROMPT DE ANÁLISIS DE PISTA 🎵
  private buildTrackAnalysisPrompt(analysis: TrackAnalysis): string {
    return `Based on original track analysis: ${analysis.genre} style, ${analysis.bpm} BPM, ${analysis.mood} mood, ${analysis.style} approach, ${analysis.key} key, ${analysis.timeSignature} time signature. `;
  }

  // 🌍 TRADUCIR PROMPT AL INGLÉS PARA SUNO 🌍
  private async translateToEnglish(prompt: string): Promise<string> {
    try {
      // Detectar si el prompt está en español
      const isSpanish = this.detectSpanish(prompt);
      if (!isSpanish) return prompt;

      logger.info({ promptLength: prompt.length }, 'Translating prompt to English for Suno AI');

      // Usar servicio de traducción (Google Translate API o similar)
      const response = await fetch('https://api.translate.googleapis.com/language/translate/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: prompt,
          target: 'en',
          source: 'es',
          format: 'text'
        })
      });

      if (!response.ok) {
        logger.warn('Translation service unavailable, using fallback');
        return this.fallbackTranslation(prompt);
      }

      const result = await response.json();
      const translatedPrompt = result.data.translations[0].translatedText;

      logger.info({ 
        originalLength: prompt.length, 
        translatedLength: translatedPrompt.length 
      }, 'Prompt translated to English successfully');

      return translatedPrompt;

    } catch (error) {
      logger.error({ error }, 'Failed to translate prompt, using fallback');
      return this.fallbackTranslation(prompt);
    }
  }

  // 🔄 TRADUCCIÓN DE FALLBACK (DICCIONARIO INTERNO) 🔄
  private fallbackTranslation(prompt: string): string {
    const translations: Record<string, string> = {
      // Estados emocionales
      'extremely sad': 'extremely sad',
      'melancholic': 'melancholic',
      'heartbroken': 'heartbroken',
      'emotional depth': 'emotional depth',
      'sad': 'sad',
      'introspective': 'introspective',
      'contemplative': 'contemplative',
      'nostalgic': 'nostalgic',
      'bittersweet': 'bittersweet',
      'reflective': 'reflective',
      'calm': 'calm',
      'peaceful': 'peaceful',
      'serene': 'serene',
      'tranquil': 'tranquil',
      'neutral': 'neutral',
      'balanced': 'balanced',
      'moderate': 'moderate',
      'stable': 'stable',
      'uplifting': 'uplifting',
      'positive': 'positive',
      'cheerful': 'cheerful',
      'optimistic': 'optimistic',
      'happy': 'happy',
      'joyful': 'joyful',
      'energetic': 'energetic',
      'vibrant': 'vibrant',
      'excited': 'excited',
      'enthusiastic': 'enthusiastic',
      'passionate': 'passionate',
      'dynamic': 'dynamic',
      'intense': 'intense',
      'dramatic': 'dramatic',
      'powerful': 'powerful',
      'frenetic': 'frenetic',
      'chaotic': 'chaotic',
      'overwhelming': 'overwhelming',
      
      // Estilos musicales
      'faithful to original': 'faithful to original',
      'traditional arrangement': 'traditional arrangement',
      'slight variation': 'slight variation',
      'subtle reinterpretation': 'subtle reinterpretation',
      'creative reinterpretation': 'creative reinterpretation',
      'modern twist': 'modern twist',
      'experimental arrangement': 'experimental arrangement',
      'avant-garde approach': 'avant-garde approach',
      'completely deconstructed': 'completely deconstructed',
      'abstract interpretation': 'abstract interpretation',
      'experimental': 'experimental',
      
      // Calidad de sonido
      'clean': 'clean',
      'polished': 'polished',
      'pristine sound': 'pristine sound',
      'high fidelity': 'high fidelity',
      'slight distortion': 'slight distortion',
      'warm overdrive': 'warm overdrive',
      'vintage tone': 'vintage tone',
      'moderate distortion': 'moderate distortion',
      'gritty texture': 'gritty texture',
      'raw sound': 'raw sound',
      'heavy distortion': 'heavy distortion',
      'aggressive tone': 'aggressive tone',
      'extreme distortion': 'extreme distortion',
      'wall of sound': 'wall of sound',
      
      // Complejidad
      'simple': 'simple',
      'minimal': 'minimal',
      'stripped down': 'stripped down',
      'essential elements only': 'essential elements only',
      'standard arrangement': 'standard arrangement',
      'complex': 'complex',
      'layered': 'layered',
      'sophisticated': 'sophisticated',
      'intricate': 'intricate',
      'highly complex': 'highly complex',
      'intricate arrangements': 'intricate arrangements',
      'detailed': 'detailed',
      'extremely complex': 'extremely complex',
      'orchestral': 'orchestral',
      'maximalist': 'maximalist',
      'dense arrangements': 'dense arrangements',
      
      // Tempo y ritmo
      'slow tempo': 'slow tempo',
      'ballad-like': 'ballad-like',
      'relaxed': 'relaxed',
      'contemplative rhythm': 'contemplative rhythm',
      'moderate tempo': 'moderate tempo',
      'steady rhythm': 'steady rhythm',
      'comfortable pace': 'comfortable pace',
      'upbeat tempo': 'upbeat tempo',
      'energetic rhythm': 'energetic rhythm',
      'driving beat': 'driving beat',
      'fast tempo': 'fast tempo',
      'driving rhythm': 'driving rhythm',
      'intense pace': 'intense pace',
      'very fast tempo': 'very fast tempo',
      'frenetic rhythm': 'frenetic rhythm',
      'high energy': 'high energy',
      
      // Atmósfera
      'bright': 'bright',
      'sunny': 'sunny',
      'optimistic atmosphere': 'optimistic atmosphere',
      'uplifting mood': 'uplifting mood',
      'warm': 'warm',
      'cozy': 'cozy',
      'intimate atmosphere': 'intimate atmosphere',
      'comfortable': 'comfortable',
      'natural': 'natural',
      'dark': 'dark',
      'mysterious': 'mysterious',
      'atmospheric': 'atmospheric',
      'moody': 'moody',
      'haunting': 'haunting',
      'ethereal': 'ethereal',
      'otherworldly atmosphere': 'otherworldly atmosphere',
      'mystical': 'mystical',
      
      // Calidad profesional
      'Professional studio quality': 'Professional studio quality',
      'enhanced production': 'enhanced production',
      'crisp sound': 'crisp sound',
      'high quality': 'high quality',
      'professional': 'professional',
      'studio quality': 'studio quality',
      'enhanced': 'enhanced',
      'production': 'production',
      'crisp': 'crisp',
      'sound': 'sound'
    };

    let translatedPrompt = prompt;
    
    // Reemplazar términos conocidos
    Object.entries(translations).forEach(([spanish, english]) => {
      const regex = new RegExp(spanish, 'gi');
      translatedPrompt = translatedPrompt.replace(regex, english);
    });

    return translatedPrompt;
  }

  // 🔍 DETECTAR SI EL TEXTO ESTÁ EN ESPAÑOL 🔍
  private detectSpanish(text: string): boolean {
    const spanishWords = [
      'melancólico', 'triste', 'feliz', 'alegre', 'energético', 'calmado',
      'complejo', 'simple', 'distorsión', 'limpio', 'rápido', 'lento',
      'atmosférico', 'brillante', 'oscuro', 'misterioso', 'profesional',
      'calidad', 'estudio', 'producción', 'sonido', 'ritmo', 'tempo',
      'arreglo', 'interpretación', 'experimental', 'tradicional', 'moderno'
    ];

    const textLower = text.toLowerCase();
    const spanishWordCount = spanishWords.filter(word => 
      textLower.includes(word)
    ).length;

    // Si encuentra más de 2 palabras en español, asumir que está en español
    return spanishWordCount > 2;
  }

  // 🚀 OPTIMIZAR PROMPT PARA SUNO (CON TRADUCCIÓN) 🚀
  private async optimizeForSuno(prompt: string, trackAnalysis?: TrackAnalysis): Promise<string> {
    // 1. Traducir al inglés si es necesario
    let optimized = await this.translateToEnglish(prompt);
    
    // 2. Optimizaciones específicas para Suno AI
    optimized += ' Professional studio quality, enhanced production, crisp sound.';
    
    // 3. Agregar instrucciones técnicas si hay análisis de pista
    if (trackAnalysis) {
      optimized += ` Maintain ${trackAnalysis.bpm} BPM, ${trackAnalysis.key} key, ${trackAnalysis.timeSignature} time signature.`;
    }
    
    // 4. Limitar longitud para mejor procesamiento
    if (optimized.length > 500) {
      optimized = optimized.substring(0, 500) + '...';
    }
    
    logger.info({ 
      originalLength: prompt.length, 
      optimizedLength: optimized.length,
      wasTranslated: prompt !== optimized 
    }, 'Prompt optimized for Suno AI');
    
    return optimized;
  }

  // 📊 CALCULAR CONFIANZA 📊
  private calculateConfidence(knobs: KnobValue[], trackAnalysis?: TrackAnalysis): number {
    let confidence = 0.5; // Base confidence
    
    // Más confianza si hay análisis de pista
    if (trackAnalysis) confidence += 0.2;
    
    // Más confianza si los knobs están en rangos óptimos
    const optimalRanges = {
      expressivity: [0.3, 0.7],
      grunge: [0.2, 0.8],
      complexity: [0.3, 0.7],
      atmosphere: [0.2, 0.8]
    };
    
    for (const knob of knobs) {
      const range = optimalRanges[knob.id as keyof typeof optimalRanges];
      if (range) {
        const normalizedValue = (knob.value - knob.min) / (knob.max - knob.min);
        if (normalizedValue >= range[0] && normalizedValue <= range[1]) {
          confidence += 0.05;
        }
      }
    }
    
    return Math.min(confidence, 1.0);
  }

  // 🎯 ESTIMAR CALIDAD 🎯
  private estimateQuality(prompt: string): number {
    let quality = 0.5; // Base quality
    
    // Más calidad si el prompt es descriptivo
    const descriptiveWords = ['professional', 'enhanced', 'crisp', 'sophisticated', 'intricate'];
    descriptiveWords.forEach(word => {
      if (prompt.toLowerCase().includes(word)) quality += 0.1;
    });
    
    // Más calidad si tiene instrucciones técnicas
    const technicalWords = ['BPM', 'key', 'tempo', 'rhythm', 'arrangement'];
    technicalWords.forEach(word => {
      if (prompt.includes(word)) quality += 0.05;
    });
    
    return Math.min(quality, 1.0);
  }

  // 🔍 DETECTAR GÉNERO (SIMULADO) 🔍
  private detectGenre(audioUrl: string): string {
    const genres = ['electronic', 'rock', 'pop', 'jazz', 'classical', 'hip-hop', 'folk', 'blues'];
    return genres[Math.floor(Math.random() * genres.length)];
  }

  // 🎼 DETECTAR INSTRUMENTACIÓN (SIMULADO) 🎼
  private detectInstrumentation(audioUrl: string): string[] {
    const instruments = [
      ['guitar', 'bass', 'drums'],
      ['piano', 'strings', 'brass'],
      ['synth', 'electronic', 'drum machine'],
      ['vocals', 'guitar', 'bass'],
      ['orchestra', 'strings', 'woodwinds']
    ];
    return instruments[Math.floor(Math.random() * instruments.length)];
  }

  // 🎨 DETECTAR ESTILO (SIMULADO) 🎨
  private detectStyle(audioUrl: string): string {
    const styles = ['modern', 'vintage', 'experimental', 'minimalist', 'maximalist'];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  // 😊 DETECTAR MOOD (SIMULADO) 😊
  private detectMood(audioUrl: string): string {
    const moods = ['happy', 'sad', 'energetic', 'calm', 'mysterious', 'romantic'];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  // 🎹 DETECTAR TONALIDAD (SIMULADO) 🎹
  private detectKey(audioUrl: string): string {
    const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const modes = ['major', 'minor'];
    const key = keys[Math.floor(Math.random() * keys.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    return `${key} ${mode}`;
  }

  // 🥁 DETECTAR COMPÁS (SIMULADO) 🥁
  private detectTimeSignature(audioUrl: string): string {
    const signatures = ['4/4', '3/4', '2/4', '6/8', '12/8'];
    return signatures[Math.floor(Math.random() * signatures.length)];
  }

  // 🎵 ENVIAR A SUNO CON PROMPT OPTIMIZADO 🎵
  async sendToSuno(optimizedPrompt: string, audioUrl?: string): Promise<{
    generationId: string;
    status: string;
    estimatedTime: number;
  }> {
    logger.info({ promptLength: optimizedPrompt.length }, 'Sending optimized prompt to Suno AI');

    try {
      const response = await fetch(`${this.SUNO_API_ENDPOINT}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.SUNO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: optimizedPrompt,
          audio_url: audioUrl,
          style: 'professional',
          quality: 'high'
        })
      });

      if (!response.ok) {
        throw new Error(`Suno API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      logger.info({ 
        generationId: result.id, 
        status: result.status 
      }, 'Prompt sent to Suno AI successfully');

      return {
        generationId: result.id,
        status: result.status,
        estimatedTime: result.estimated_time || 60
      };

    } catch (error) {
      logger.error({ error, optimizedPrompt }, 'Failed to send prompt to Suno AI');
      throw new ServiceUnavailableError('Suno AI service is currently unavailable');
    }
  }
}

// Exportar instancia
export const knobPromptService = new KnobPromptService();
