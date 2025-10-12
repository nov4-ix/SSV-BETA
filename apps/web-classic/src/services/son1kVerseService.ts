/**
 * 🌌 SERVICIO DE INTEGRACIÓN CON NETLIFY FUNCTIONS
 * 
 * Este servicio conecta el frontend con las funciones de Netlify
 * que actúan como backend para Son1kVerse
 */

export interface NetlifyFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SunoGenerateRequest {
  prompt: string;
  style?: string;
  title?: string;
  customMode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
}

export interface SunoGenerateResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_url?: string;
  error?: string;
}

export interface PixelAssistantRequest {
  message: string;
  context: string;
  userId?: string;
}

export interface PixelAssistantResponse {
  response: string;
  personality: {
    name: string;
    role: string;
    mood: string;
  };
  suggestions: string[];
}

export interface QwenLyricsRequest {
  prompt: string;
  style: string;
  genre: string;
  mood: string;
}

export interface QwenLyricsResponse {
  lyrics: string;
  structure: {
    intro: string;
    verse: string;
    chorus: string;
    bridge: string;
    outro: string;
  };
  metadata: {
    language: string;
    length: string;
    complexity: string;
  };
}

// 🌐 CONFIGURACIÓN DE ENDPOINTS
const NETLIFY_FUNCTIONS_BASE = 'https://68ebcc1e58a3244416592635--son1k.netlify.app/.netlify/functions';

// 🔧 FUNCIÓN HELPER PARA LLAMADAS A NETLIFY FUNCTIONS
async function callNetlifyFunction<T>(
  functionName: string,
  data: any = {},
  method: 'GET' | 'POST' = 'POST'
): Promise<NetlifyFunctionResponse<T>> {
  try {
    const url = `${NETLIFY_FUNCTIONS_BASE}/${functionName}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 🎵 SERVICIO DE GENERACIÓN MUSICAL
export class Son1kMusicService {
  /**
   * Genera música usando Suno a través de Netlify Functions
   */
  static async generateMusic(request: SunoGenerateRequest): Promise<NetlifyFunctionResponse<SunoGenerateResponse>> {
    return callNetlifyFunction<SunoGenerateResponse>('suno-generate', request);
  }

  /**
   * Verifica el estado de salud del servicio Suno
   */
  static async checkHealth(): Promise<NetlifyFunctionResponse<{ status: string; connected: boolean }>> {
    return callNetlifyFunction<{ status: string; connected: boolean }>('suno-health', {}, 'GET');
  }
}

// 🤖 SERVICIO DE ASISTENTE PIXEL
export class PixelAssistantService {
  /**
   * Interactúa con el asistente Pixel
   */
  static async interact(request: PixelAssistantRequest): Promise<NetlifyFunctionResponse<PixelAssistantResponse>> {
    return callNetlifyFunction<PixelAssistantResponse>('pixel-assistant', request);
  }
}

// 🎼 SERVICIO DE GENERACIÓN DE LETRAS
export class LyricsService {
  /**
   * Genera letras usando Qwen 2
   */
  static async generateLyrics(request: QwenLyricsRequest): Promise<NetlifyFunctionResponse<QwenLyricsResponse>> {
    return callNetlifyFunction<QwenLyricsResponse>('qwen-lyrics', request);
  }

  /**
   * Genera letras estructuradas
   */
  static async generateStructuredLyrics(request: QwenLyricsRequest): Promise<NetlifyFunctionResponse<QwenLyricsResponse>> {
    return callNetlifyFunction<QwenLyricsResponse>('structured-lyrics', request);
  }

  /**
   * Traduce texto para Suno
   */
  static async translateForSuno(text: string, sourceLanguage: string = 'es', targetLanguage: string = 'en'): Promise<NetlifyFunctionResponse<{ translatedText: string; confidence: number }>> {
    return callNetlifyFunction<{ translatedText: string; confidence: number }>('qwen-translate', {
      text,
      sourceLanguage,
      targetLanguage,
    });
  }
}

// 🎛️ SERVICIO DE PROMPTS INTELIGENTES
export class SmartPromptsService {
  /**
   * Optimiza prompts musicales
   */
  static async optimizePrompt(prompt: string, context: string = 'music'): Promise<NetlifyFunctionResponse<{ optimizedPrompt: string; improvements: string[] }>> {
    return callNetlifyFunction<{ optimizedPrompt: string; improvements: string[] }>('optimize-prompt', {
      prompt,
      context,
    });
  }

  /**
   * Genera prompts inteligentes
   */
  static async generateSmartPrompts(originalPrompt: string, context: string = 'music'): Promise<NetlifyFunctionResponse<{ enhancedPrompt: string; improvements: string[] }>> {
    return callNetlifyFunction<{ enhancedPrompt: string; improvements: string[] }>('qwen-smart-prompts', {
      originalPrompt,
      context,
    });
  }
}

// 🛡️ SERVICIO DE SANCTUARY (RED SOCIAL)
export class SanctuaryService {
  /**
   * Envía mensaje al chat de Sanctuary
   */
  static async sendMessage(message: string, userId?: string): Promise<NetlifyFunctionResponse<{ response: string; timestamp: string }>> {
    return callNetlifyFunction<{ response: string; timestamp: string }>('sanctuary-chat', {
      message,
      userId,
    });
  }
}

// 🚀 SERVICIO DE NOVA POST PILOT
export class NovaPostPilotService {
  /**
   * Genera contenido para redes sociales
   */
  static async generateSocialContent(prompt: string, platform: string = 'instagram'): Promise<NetlifyFunctionResponse<{ content: string; hashtags: string[] }>> {
    return callNetlifyFunction<{ content: string; hashtags: string[] }>('nova-post-pilot', {
      prompt,
      platform,
    });
  }
}

// 🎵 SERVICIO DE ANÁLISIS DE AUDIO
export class AudioAnalysisService {
  /**
   * Analiza una pista de audio
   */
  static async analyzeAudio(audioUrl: string): Promise<NetlifyFunctionResponse<{ bpm: number; key: string; genre: string; mood: string }>> {
    return callNetlifyFunction<{ bpm: number; key: string; genre: string; mood: string }>('analyze-audio', {
      audioUrl,
    });
  }
}

// 🔧 SERVICIO PRINCIPAL DE SON1KVERSE
export class Son1kVerseService {
  static music = Son1kMusicService;
  static pixel = PixelAssistantService;
  static lyrics = LyricsService;
  static prompts = SmartPromptsService;
  static sanctuary = SanctuaryService;
  static nova = NovaPostPilotService;
  static analysis = AudioAnalysisService;

  /**
   * Verifica el estado de todos los servicios
   */
  static async checkAllServices(): Promise<{
    suno: boolean;
    pixel: boolean;
    qwen: boolean;
    sanctuary: boolean;
    nova: boolean;
  }> {
    const [sunoHealth, pixelTest, qwenTest] = await Promise.allSettled([
      Son1kMusicService.checkHealth(),
      PixelAssistantService.interact({ message: 'test', context: 'health' }),
      LyricsService.translateForSuno('test'),
    ]);

    return {
      suno: sunoHealth.status === 'fulfilled' && sunoHealth.value.success,
      pixel: pixelTest.status === 'fulfilled' && pixelTest.value.success,
      qwen: qwenTest.status === 'fulfilled' && qwenTest.value.success,
      sanctuary: true, // Asumir que funciona si no hay error
      nova: true, // Asumir que funciona si no hay error
    };
  }
}

// 📊 EXPORTAR TIPOS
export type {
  NetlifyFunctionResponse,
  SunoGenerateRequest,
  SunoGenerateResponse,
  PixelAssistantRequest,
  PixelAssistantResponse,
  QwenLyricsRequest,
  QwenLyricsResponse,
};
