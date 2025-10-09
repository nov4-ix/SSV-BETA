import { config } from '@/config';
import { logger } from '@/utils/logger';
import { AppError, ServiceUnavailableError } from '@/utils/errors';

// 🤖 SERVICIOS DE IA INTEGRADOS - SUNO + BARK + SO-VITS + FLUX 🤖

export interface SunoCoverRequest {
  audioUrl: string;
  prompt: string;
  style: string;
  genre: string;
  enhanceVocals?: boolean;
  enhanceInstruments?: boolean;
}

export interface SunoCoverResponse {
  id: string;
  audioUrl: string;
  duration: number;
  quality: 'standard' | 'premium';
  processingTime: number;
  metadata: {
    originalDuration: number;
    enhancements: string[];
    style: string;
    genre: string;
  };
}

export interface BarkTTSRequest {
  text: string;
  voice: string;
  speed?: number;
  pitch?: number;
  emotion?: string;
}

export interface BarkTTSResponse {
  id: string;
  audioUrl: string;
  duration: number;
  voice: string;
  text: string;
  processingTime: number;
}

export interface SoVITSCloneRequest {
  audioUrl: string;
  targetVoice: string;
  preserveEmotion?: boolean;
  quality?: 'standard' | 'high';
}

export interface SoVITSCloneResponse {
  id: string;
  audioUrl: string;
  duration: number;
  targetVoice: string;
  similarity: number;
  processingTime: number;
}

export interface FluxArtworkRequest {
  prompt: string;
  style: 'album_cover' | 'single_cover' | 'banner' | 'social_media';
  resolution: '512x512' | '1024x1024' | '2048x2048';
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export interface FluxArtworkResponse {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  resolution: string;
  processingTime: number;
}

// 🎵 SUNO COVER SERVICE 🎵
export class SunoCoverService {
  private readonly API_ENDPOINT: string;
  private readonly API_KEY: string;

  constructor() {
    this.API_ENDPOINT = config.ai.sunoEndpoint || 'https://api.suno.ai/v1';
    this.API_KEY = config.ai.sunoApiKey || '';
  }

  async enhanceTrack(request: SunoCoverRequest): Promise<SunoCoverResponse> {
    logger.info({ 
      audioUrl: request.audioUrl, 
      style: request.style, 
      genre: request.genre 
    }, 'Processing track with Suno Cover');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/cover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: request.audioUrl,
          prompt: request.prompt,
          style: request.style,
          genre: request.genre,
          enhance_vocals: request.enhanceVocals || true,
          enhance_instruments: request.enhanceInstruments || true,
          quality: 'premium'
        })
      });

      if (!response.ok) {
        throw new Error(`Suno API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      logger.info({ 
        sunoId: result.id, 
        duration: result.duration 
      }, 'Suno Cover processing completed');

      return {
        id: result.id,
        audioUrl: result.audio_url,
        duration: result.duration,
        quality: result.quality,
        processingTime: result.processing_time,
        metadata: {
          originalDuration: result.metadata.original_duration,
          enhancements: result.metadata.enhancements,
          style: result.style,
          genre: result.genre
        }
      };

    } catch (error) {
      logger.error({ error, request }, 'Failed to process track with Suno Cover');
      throw new ServiceUnavailableError('Suno Cover service is currently unavailable');
    }
  }

  async getCoverStatus(coverId: string): Promise<{ status: string; progress: number }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/cover/${coverId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Suno API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        status: result.status,
        progress: result.progress
      };

    } catch (error) {
      logger.error({ error, coverId }, 'Failed to get Suno Cover status');
      throw new ServiceUnavailableError('Failed to get cover status');
    }
  }
}

// 🔊 BARK TTS SERVICE 🔊
export class BarkTTSService {
  private readonly API_ENDPOINT: string;
  private readonly API_KEY: string;

  constructor() {
    this.API_ENDPOINT = config.ai.barkEndpoint || 'https://api.bark.ai/v1';
    this.API_KEY = config.ai.barkApiKey || '';
  }

  async generateSpeech(request: BarkTTSRequest): Promise<BarkTTSResponse> {
    logger.info({ 
      text: request.text.substring(0, 50) + '...', 
      voice: request.voice 
    }, 'Generating speech with Bark TTS');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/tts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          voice: request.voice,
          speed: request.speed || 1.0,
          pitch: request.pitch || 1.0,
          emotion: request.emotion || 'neutral',
          format: 'mp3',
          quality: 'high'
        })
      });

      if (!response.ok) {
        throw new Error(`Bark API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      logger.info({ 
        barkId: result.id, 
        duration: result.duration 
      }, 'Bark TTS generation completed');

      return {
        id: result.id,
        audioUrl: result.audio_url,
        duration: result.duration,
        voice: result.voice,
        text: result.text,
        processingTime: result.processing_time
      };

    } catch (error) {
      logger.error({ error, request }, 'Failed to generate speech with Bark TTS');
      throw new ServiceUnavailableError('Bark TTS service is currently unavailable');
    }
  }

  async getAvailableVoices(): Promise<Array<{ id: string; name: string; language: string; gender: string }>> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/voices`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Bark API error: ${response.status}`);
      }

      const result = await response.json();
      return result.voices;

    } catch (error) {
      logger.error({ error }, 'Failed to get available voices from Bark');
      return [];
    }
  }
}

// 🎭 SO-VITS CLONE SERVICE 🎭
export class SoVITSCloneService {
  private readonly API_ENDPOINT: string;
  private readonly API_KEY: string;

  constructor() {
    this.API_ENDPOINT = config.ai.soVITSEndpoint || 'https://api.so-vits.com/v1';
    this.API_KEY = config.ai.soVITSApiKey || '';
  }

  async cloneVoice(request: SoVITSCloneRequest): Promise<SoVITSCloneResponse> {
    logger.info({ 
      audioUrl: request.audioUrl, 
      targetVoice: request.targetVoice 
    }, 'Cloning voice with So-VITS');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/clone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: request.audioUrl,
          target_voice: request.targetVoice,
          preserve_emotion: request.preserveEmotion || true,
          quality: request.quality || 'high',
          format: 'wav'
        })
      });

      if (!response.ok) {
        throw new Error(`So-VITS API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      logger.info({ 
        sovitsId: result.id, 
        similarity: result.similarity 
      }, 'So-VITS voice cloning completed');

      return {
        id: result.id,
        audioUrl: result.audio_url,
        duration: result.duration,
        targetVoice: result.target_voice,
        similarity: result.similarity,
        processingTime: result.processing_time
      };

    } catch (error) {
      logger.error({ error, request }, 'Failed to clone voice with So-VITS');
      throw new ServiceUnavailableError('So-VITS service is currently unavailable');
    }
  }

  async getAvailableModels(): Promise<Array<{ id: string; name: string; language: string; quality: string }>> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/models`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`So-VITS API error: ${response.status}`);
      }

      const result = await response.json();
      return result.models;

    } catch (error) {
      logger.error({ error }, 'Failed to get available models from So-VITS');
      return [];
    }
  }
}

// 🎨 FLUX ARTWORK SERVICE 🎨
export class FluxArtworkService {
  private readonly API_ENDPOINT: string;
  private readonly API_KEY: string;

  constructor() {
    this.API_ENDPOINT = config.ai.fluxEndpoint || 'https://api.flux.ai/v1';
    this.API_KEY = config.ai.fluxApiKey || '';
  }

  async generateArtwork(request: FluxArtworkRequest): Promise<FluxArtworkResponse> {
    logger.info({ 
      prompt: request.prompt.substring(0, 50) + '...', 
      style: request.style 
    }, 'Generating artwork with Flux');

    try {
      const response = await fetch(`${this.API_ENDPOINT}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          style: request.style,
          resolution: request.resolution,
          aspect_ratio: request.aspectRatio || 'square',
          quality: 'high',
          format: 'png'
        })
      });

      if (!response.ok) {
        throw new Error(`Flux API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      logger.info({ 
        fluxId: result.id, 
        resolution: result.resolution 
      }, 'Flux artwork generation completed');

      return {
        id: result.id,
        imageUrl: result.image_url,
        prompt: result.prompt,
        style: result.style,
        resolution: result.resolution,
        processingTime: result.processing_time
      };

    } catch (error) {
      logger.error({ error, request }, 'Failed to generate artwork with Flux');
      throw new ServiceUnavailableError('Flux service is currently unavailable');
    }
  }

  async getArtworkStatus(artworkId: string): Promise<{ status: string; progress: number }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/generate/${artworkId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Flux API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        status: result.status,
        progress: result.progress
      };

    } catch (error) {
      logger.error({ error, artworkId }, 'Failed to get Flux artwork status');
      throw new ServiceUnavailableError('Failed to get artwork status');
    }
  }
}

// 🎯 INTEGRATED AI SERVICE 🎯
export class IntegratedAIService {
  private sunoService: SunoCoverService;
  private barkService: BarkTTSService;
  private soVITSService: SoVITSCloneService;
  private fluxService: FluxArtworkService;

  constructor() {
    this.sunoService = new SunoCoverService();
    this.barkService = new BarkTTSService();
    this.soVITSService = new SoVITSCloneService();
    this.fluxService = new FluxArtworkService();
  }

  // Procesar track completo con todas las IAs
  async processTrackComplete(trackData: {
    audioUrl: string;
    trackName: string;
    genre: string;
    style: string;
    generateArtwork?: boolean;
    generateMarketing?: boolean;
  }) {
    logger.info({ trackName: trackData.trackName }, 'Starting complete track processing');

    const results = {
      enhanced: null as SunoCoverResponse | null,
      artwork: null as FluxArtworkResponse | null,
      marketing: null as any,
      processingTime: 0
    };

    const startTime = Date.now();

    try {
      // 1. Enhance with Suno
      const enhanced = await this.sunoService.enhanceTrack({
        audioUrl: trackData.audioUrl,
        prompt: `Professional studio quality enhancement for ${trackData.trackName}`,
        style: trackData.style,
        genre: trackData.genre,
        enhanceVocals: true,
        enhanceInstruments: true
      });
      results.enhanced = enhanced;

      // 2. Generate artwork if requested
      if (trackData.generateArtwork) {
        const artwork = await this.fluxService.generateArtwork({
          prompt: `${trackData.trackName} album cover, ${trackData.style} style, ${trackData.genre} music`,
          style: 'album_cover',
          resolution: '1024x1024',
          aspectRatio: 'square'
        });
        results.artwork = artwork;
      }

      // 3. Generate marketing content if requested
      if (trackData.generateMarketing) {
        // This would integrate with Nova Post Pilot
        results.marketing = {
          socialMediaPosts: [],
          hashtags: [],
          descriptions: []
        };
      }

      results.processingTime = Date.now() - startTime;

      logger.info({ 
        trackName: trackData.trackName, 
        processingTime: results.processingTime 
      }, 'Complete track processing finished');

      return results;

    } catch (error) {
      logger.error({ error, trackData }, 'Failed to process track completely');
      throw new ServiceUnavailableError('Complete track processing failed');
    }
  }

  // Obtener estado de todos los servicios
  async getServicesStatus() {
    return {
      suno: { available: !!config.ai.sunoApiKey, endpoint: config.ai.sunoEndpoint },
      bark: { available: !!config.ai.barkApiKey, endpoint: config.ai.barkEndpoint },
      soVITS: { available: !!config.ai.soVITSApiKey, endpoint: config.ai.soVITSEndpoint },
      flux: { available: !!config.ai.fluxApiKey, endpoint: config.ai.fluxEndpoint }
    };
  }
}

// Exportar instancias
export const sunoCoverService = new SunoCoverService();
export const barkTTSService = new BarkTTSService();
export const soVITSCloneService = new SoVITSCloneService();
export const fluxArtworkService = new FluxArtworkService();
export const integratedAIService = new IntegratedAIService();
