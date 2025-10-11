/**
 * 🧠 SERVICIO QWEN 2 PARA SON1KVERSE
 * 
 * Servicio principal para interactuar con Qwen 2 a través de Netlify Functions
 */

import { QWEN_CONFIG } from '../config/qwenConfig';
import { getEndpoint, TIMEOUT_CONFIG, RETRY_CONFIG, CACHE_CONFIG } from '../config/qwenFrontendConfig';

// 🎵 TIPOS DE GENERACIÓN
export interface LyricsRequest {
  prompt: string;
  style: string;
  genre: string;
  mood: string;
  language: 'es' | 'en';
  length: 'short' | 'medium' | 'long';
  userId?: string;
}

export interface LyricsResponse {
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

// 🌐 TIPOS DE TRADUCCIÓN
export interface TranslationRequest {
  text: string;
  sourceLanguage: 'es' | 'en';
  targetLanguage: 'es' | 'en';
  context: 'music' | 'general' | 'technical';
  preserveFormatting?: boolean;
  userId?: string;
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number;
  detectedLanguage: string;
  alternatives?: string[];
}

// 🎯 TIPOS DE PIXEL
export interface PixelRequest {
  message: string;
  context: 'music' | 'general' | 'help' | 'creative';
  userId?: string;
  sessionId?: string;
  userPreferences?: {
    experience: 'beginner' | 'intermediate' | 'expert';
    personality: 'creative' | 'technical' | 'social' | 'analytical';
    language: 'es' | 'en';
  };
}

export interface PixelResponse {
  response: string;
  personality: {
    enthusiasm: number;
    creativity: number;
    helpfulness: number;
  };
  suggestions: string[];
  followUp?: string;
}

// 🧠 TIPOS DE PROMPTS INTELIGENTES
export interface SmartPromptRequest {
  originalPrompt: string;
  context: 'music' | 'lyrics' | 'general';
  style?: string;
  genre?: string;
  mood?: string;
  userId?: string;
}

export interface SmartPromptResponse {
  enhancedPrompt: string;
  improvements: string[];
  confidence: number;
  alternatives: string[];
}

// 🎯 CLASE PRINCIPAL DEL SERVICIO QWEN
export class QwenService {
  private cache: Map<string, any> = new Map();

  constructor() {
    // El baseUrl se obtiene dinámicamente según el entorno
  }

  // 🎵 GENERAR LETRAS
  async generateLyrics(request: LyricsRequest): Promise<LyricsResponse> {
    const cacheKey = `lyrics_${JSON.stringify(request)}`;
    
    if (CACHE_CONFIG.enabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest(
        getEndpoint('lyrics'),
        'POST',
        request,
        TIMEOUT_CONFIG.lyrics
      );

      const result = await response.json();
      
      if (CACHE_CONFIG.enabled) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), CACHE_CONFIG.lyricsTTL);
      }
      
      return result;
    } catch (error) {
      console.error('Error generating lyrics:', error);
      throw error;
    }
  }

  // 🌐 TRADUCIR TEXTO
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const cacheKey = `translate_${JSON.stringify(request)}`;
    
    if (CACHE_CONFIG.enabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest(
        getEndpoint('translate'),
        'POST',
        request,
        TIMEOUT_CONFIG.translate
      );

      const result = await response.json();
      
      if (CACHE_CONFIG.enabled) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), CACHE_CONFIG.translateTTL);
      }
      
      return result;
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }

  // 🤖 INTERACTUAR CON PIXEL
  async interactWithPixel(request: PixelRequest): Promise<PixelResponse> {
    const cacheKey = `pixel_${JSON.stringify(request)}`;
    
    if (CACHE_CONFIG.enabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest(
        getEndpoint('pixel'),
        'POST',
        request,
        TIMEOUT_CONFIG.pixel
      );

      const result = await response.json();
      
      if (CACHE_CONFIG.enabled) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), CACHE_CONFIG.pixelTTL);
      }
      
      return result;
    } catch (error) {
      console.error('Error interacting with Pixel:', error);
      throw error;
    }
  }

  // 🧠 GENERAR PROMPTS INTELIGENTES
  async generateSmartPrompt(request: SmartPromptRequest): Promise<SmartPromptResponse> {
    const cacheKey = `smart_prompt_${JSON.stringify(request)}`;
    
    if (CACHE_CONFIG.enabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.makeRequest(
        getEndpoint('smartPrompts'),
        'POST',
        request,
        TIMEOUT_CONFIG.smartPrompts
      );

      const result = await response.json();
      
      if (CACHE_CONFIG.enabled) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), CACHE_CONFIG.smartPromptsTTL);
      }
      
      return result;
    } catch (error) {
      console.error('Error generating smart prompt:', error);
      throw error;
    }
  }

  // 🔧 MÉTODO PRIVADO PARA HACER REQUEST CON REINTENTOS
  private async makeRequest(
    url: string,
    method: string,
    data: any,
    timeout: number
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Request failed after all retries');
  }

  // 🧹 LIMPIAR CACHE
  clearCache(): void {
    this.cache.clear();
  }

  // 📊 OBTENER ESTADÍSTICAS DE CACHE
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 🎯 INSTANCIA SINGLETON
export const qwenService = new QwenService();

// 🎯 HELPERS PARA USO RÁPIDO
export const qwenHelpers = {
  // Generar letras rápidamente
  generateLyrics: (prompt: string, style: string, genre: string, mood: string) => {
    return qwenService.generateLyrics({
      prompt,
      style,
      genre,
      mood,
      language: 'es',
      length: 'medium'
    });
  },

  // Traducir texto rápidamente
  translateText: (text: string, from: 'es' | 'en', to: 'es' | 'en') => {
    return qwenService.translateText({
      text,
      sourceLanguage: from,
      targetLanguage: to,
      context: 'music'
    });
  },

  // Interactuar con Pixel rápidamente
  interactWithPixel: (message: string, context: 'music' | 'general' | 'help' | 'creative') => {
    return qwenService.interactWithPixel({
      message,
      context
    });
  },

  // Generar prompt inteligente rápidamente
  generateSmartPrompt: (originalPrompt: string, context: 'music' | 'lyrics' | 'general') => {
    return qwenService.generateSmartPrompt({
      originalPrompt,
      context
    });
  }
};

export default qwenService;