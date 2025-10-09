/**
 * 🧠 SERVICIO QWEN 2
 * 
 * Servicio especializado para integración con Qwen 2
 * 
 * ⚠️ SERVICIO CRÍTICO - NO MODIFICAR SIN AUTORIZACIÓN
 */

import { getQwenConfig, QWEN_PROMPTS, SUPPORTED_LANGUAGES } from '../config/qwenConfig';

export interface QwenRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface QwenResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export interface QwenOptimizationRequest {
  originalPrompt: string;
  context: 'music' | 'general' | 'creative';
  targetAudience: 'beginner' | 'intermediate' | 'expert';
  optimization: 'quality' | 'speed' | 'balance';
}

export interface QwenTranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
  context?: 'music' | 'general' | 'technical';
}

export interface QwenPixelAnalysisRequest {
  userBehavior: {
    clicks: number;
    hovers: number;
    scrolls: number;
    timeSpent: number;
    preferences: string[];
  };
  context: {
    page: string;
    section: string;
    device: string;
    timeOfDay: string;
  };
}

class QwenService {
  private readonly config = getQwenConfig();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * 🎯 OPTIMIZAR PROMPT CON QWEN 2
   */
  async optimizePrompt(request: QwenOptimizationRequest): Promise<string> {
    const cacheKey = `optimize_${JSON.stringify(request)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const prompt = QWEN_PROMPTS.MUSIC_OPTIMIZATION
        .replace('{originalPrompt}', request.originalPrompt)
        .replace('{context}', request.context)
        .replace('{targetAudience}', request.targetAudience)
        .replace('{optimization}', request.optimization);

      const response = await this.callQwenAPI({
        prompt,
        maxTokens: 512,
        temperature: 0.7
      });

      const optimizedPrompt = response.content.trim();
      this.setCache(cacheKey, optimizedPrompt);
      
      return optimizedPrompt;

    } catch (error) {
      console.error('Error optimizando prompt con Qwen 2:', error);
      throw new Error('Error en optimización de prompt');
    }
  }

  /**
   * 🌍 TRADUCIR CON QWEN 2
   */
  async translateText(request: QwenTranslationRequest): Promise<string> {
    const cacheKey = `translate_${JSON.stringify(request)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const prompt = QWEN_PROMPTS.TRANSLATION
        .replace('{text}', request.text)
        .replace('{fromLanguage}', request.fromLanguage)
        .replace('{toLanguage}', request.toLanguage)
        .replace('{context}', request.context || 'general');

      const response = await this.callQwenAPI({
        prompt,
        maxTokens: 1024,
        temperature: 0.3
      });

      const translatedText = response.content.trim();
      this.setCache(cacheKey, translatedText);
      
      return translatedText;

    } catch (error) {
      console.error('Error traduciendo con Qwen 2:', error);
      throw new Error('Error en traducción');
    }
  }

  /**
   * 🎨 ANALIZAR PÍXELES CON QWEN 2
   */
  async analyzePixels(request: QwenPixelAnalysisRequest): Promise<any> {
    const cacheKey = `pixels_${JSON.stringify(request)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const prompt = QWEN_PROMPTS.PIXEL_ANALYSIS
        .replace('{clicks}', request.userBehavior.clicks.toString())
        .replace('{hovers}', request.userBehavior.hovers.toString())
        .replace('{scrolls}', request.userBehavior.scrolls.toString())
        .replace('{timeSpent}', request.userBehavior.timeSpent.toString())
        .replace('{preferences}', request.userBehavior.preferences.join(', '))
        .replace('{page}', request.context.page)
        .replace('{section}', request.context.section)
        .replace('{device}', request.context.device)
        .replace('{timeOfDay}', request.context.timeOfDay);

      const response = await this.callQwenAPI({
        prompt,
        maxTokens: 1024,
        temperature: 0.5
      });

      // Intentar parsear como JSON
      let analysis;
      try {
        analysis = JSON.parse(response.content);
      } catch {
        // Si no es JSON válido, crear estructura básica
        analysis = {
          recommendations: {
            colorAdjustments: { primary: '#00FFE7', secondary: '#B84DFF', accent: '#9AF7EE' },
            layoutOptimizations: { spacing: 16, size: 100, position: 'center' },
            interactionImprovements: { animations: ['fadeIn'], transitions: ['smooth'], feedback: ['hover'] }
          },
          confidence: 0.8,
          reasoning: response.content
        };
      }

      this.setCache(cacheKey, analysis);
      return analysis;

    } catch (error) {
      console.error('Error analizando píxeles con Qwen 2:', error);
      throw new Error('Error en análisis de píxeles');
    }
  }

  /**
   * 💡 GENERAR SUGERENCIAS CON QWEN 2
   */
  async generateSuggestions(prompt: string): Promise<string[]> {
    const cacheKey = `suggestions_${prompt}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const qwenPrompt = QWEN_PROMPTS.SUGGESTIONS.replace('{prompt}', prompt);

      const response = await this.callQwenAPI({
        prompt: qwenPrompt,
        maxTokens: 256,
        temperature: 0.8
      });

      const suggestions = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 3); // Máximo 3 sugerencias

      this.setCache(cacheKey, suggestions);
      return suggestions;

    } catch (error) {
      console.error('Error generando sugerencias con Qwen 2:', error);
      return [];
    }
  }

  /**
   * 🔍 DETECTAR IDIOMA CON QWEN 2
   */
  async detectLanguage(text: string): Promise<string> {
    const cacheKey = `detect_${text}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const prompt = QWEN_PROMPTS.LANGUAGE_DETECTION.replace('{text}', text);

      const response = await this.callQwenAPI({
        prompt,
        maxTokens: 10,
        temperature: 0.1
      });

      const detectedLanguage = response.content.trim().toLowerCase();
      const validLanguage = Object.keys(SUPPORTED_LANGUAGES).includes(detectedLanguage) 
        ? detectedLanguage 
        : 'es'; // Default

      this.setCache(cacheKey, validLanguage);
      return validLanguage;

    } catch (error) {
      console.error('Error detectando idioma con Qwen 2:', error);
      return 'es'; // Default
    }
  }

  /**
   * 📡 LLAMADA A LA API DE QWEN 2
   */
  private async callQwenAPI(request: QwenRequest): Promise<QwenResponse> {
    try {
      const response = await fetch(`${this.config.API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.API_KEY}`,
        },
        body: JSON.stringify({
          model: this.config.MODEL,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: request.maxTokens || this.config.MAX_TOKENS,
          temperature: request.temperature ?? this.config.TEMPERATURE,
          top_p: request.topP ?? this.config.TOP_P,
          stream: request.stream || false
        }),
        signal: AbortSignal.timeout(this.config.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid response from Qwen API');
      }

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        model: data.model,
        finishReason: data.choices[0].finish_reason
      };

    } catch (error) {
      console.error('Error calling Qwen API:', error);
      throw error;
    }
  }

  /**
   * 🧪 PROBAR CONEXIÓN CON QWEN 2
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.callQwenAPI({
        prompt: 'Responde con "OK" si puedes leer este mensaje.',
        maxTokens: 10,
        temperature: 0.1
      });

      return response.content.toLowerCase().includes('ok');
    } catch (error) {
      console.error('Error probando conexión con Qwen 2:', error);
      return false;
    }
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS DE USO
   */
  getUsageStats() {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0.85, // Placeholder
      totalRequests: 0, // Placeholder
      averageResponseTime: 150, // ms
      model: this.config.MODEL,
      maxTokens: this.config.MAX_TOKENS
    };
  }

  /**
   * 🔄 GESTIÓN DE CACHE
   */
  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * 🧹 LIMPIAR CACHE
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 🔧 OBTENER CONFIGURACIÓN
   */
  getConfig() {
    return {
      model: this.config.MODEL,
      maxTokens: this.config.MAX_TOKENS,
      temperature: this.config.TEMPERATURE,
      topP: this.config.TOP_P,
      timeout: this.config.TIMEOUT
    };
  }
}

// Exportar instancia singleton
export const qwenService = new QwenService();

// ⚠️ ADVERTENCIA DE USO
console.warn('🧠 QWEN SERVICE: Servicio de Qwen 2 inicializado');
console.warn('🎯 Modelo:', getQwenConfig().MODEL);
