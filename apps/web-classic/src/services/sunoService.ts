// src/services/sunoService.ts

import { Son1kMusicService } from './son1kVerseService';

const BACKEND_URL = 'https://68ebcc1e58a3244416592635--son1k.netlify.app/.netlify/functions';

export interface SunoGenerationParams {
  prompt: string;
  style?: string;
  title?: string;
  customMode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
}

export interface SunoSong {
  id: string;
  title: string;
  prompt: string;
  tags: string;
  audio_url: string;
  stream_audio_url: string;
  image_url: string;
  source_image_url: string;
  source_stream_audio_url: string;
  createTime: number;
  model_name: string;
}

export interface SunoGenerationResponse {
  success: boolean;
  data: {
    taskId: string;
    status: 'completed' | 'running' | 'failed';
    songs?: SunoSong[];
    message?: string;
    audioUrl?: string;
    imageUrl?: string;
  };
  error?: string;
}

export class SunoService {
  async generateAndWait(params: SunoGenerationParams, onProgress?: (progress: number) => void): Promise<SunoGenerationResponse> {
    try {
      console.log('[Suno] Calling Netlify Functions...', params);

      // Usar el servicio de Son1kVerse que maneja Netlify Functions
      const result = await Son1kMusicService.generateMusic({
        prompt: params.prompt,
        style: params.style,
        title: params.title,
        customMode: params.customMode,
        instrumental: params.instrumental,
        lyrics: params.lyrics,
        gender: params.gender
      });

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      console.log('[Suno] ✅ Complete!', result.data);
      return {
        success: true,
        data: {
          taskId: result.data?.taskId || 'unknown',
          status: result.data?.status || 'completed',
          audioUrl: result.data?.audio_url,
          message: result.message
        }
      };

    } catch (error) {
      console.error('[Suno] Error:', error);
      throw error;
    }
  }

  async generate(params: SunoGenerationParams): Promise<SunoGenerationResponse> {
    try {
      console.log('[Suno] Starting generation via Netlify Functions...', params);

      // Usar el servicio de Son1kVerse que maneja Netlify Functions
      const result = await Son1kMusicService.generateMusic({
        prompt: params.prompt,
        style: params.style,
        title: params.title,
        customMode: params.customMode,
        instrumental: params.instrumental,
        lyrics: params.lyrics,
        gender: params.gender
      });

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      console.log('[Suno] Generation started:', result.data);
      return {
        success: true,
        data: {
          taskId: result.data?.taskId || 'unknown',
          status: result.data?.status || 'processing',
          message: result.message
        }
      };

    } catch (error) {
      console.error('[Suno] Error:', error);
      throw error;
    }
  }

  async getStatus(taskId: string): Promise<SunoGenerationResponse> {
    try {
      console.log('[Suno] Checking status via Netlify Functions for:', taskId);

      // Por ahora, simular el polling usando el servicio de Son1kVerse
      // En una implementación real, esto debería hacer polling al backend
      const result = await Son1kMusicService.checkHealth();

      if (!result.success) {
        throw new Error(result.error || 'Status check failed');
      }

      console.log('[Suno] Status check completed');
      return {
        success: true,
        data: {
          taskId: taskId,
          status: 'completed', // Simulado por ahora
          message: 'Status check completed'
        }
      };

    } catch (error) {
      console.error('[Suno] Error:', error);
      throw error;
    }
  }

  async updateToken(token: string): Promise<boolean> {
    try {
      console.log('[Suno] Token update not needed - using Netlify Functions');
      
      // Con Netlify Functions, el token se maneja en el backend
      // Este método se mantiene para compatibilidad
      return true;

    } catch (error) {
      console.error('[Suno] Error updating token:', error);
      return false;
    }
  }
}

export const sunoService = new SunoService();