import api from './api';
import { sunoService, SunoGenerationRequest } from './sunoService';

export interface MusicGenerationRequest {
  prompt: string;
  style: string;
  title: string;
  customMode: boolean;
  instrumental: boolean;
  lyrics?: string;
  gender?: string;
  model: '3.5' | '5';
}

export interface MusicGeneration {
  id: string;
  prompt: string;
  style: string;
  title: string;
  model: '3.5' | '5';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  waveformUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface GenerationLimits {
  model35: number;
  model5: number;
  total: number;
  canGenerate: boolean;
  reason?: string;
}

class MusicService {
  async generateMusic(data: MusicGenerationRequest): Promise<MusicGeneration> {
    try {
      // Usar el servicio de Suno para generar música
      const sunoRequest: SunoGenerationRequest = {
        prompt: data.prompt,
        style: data.style,
        title: data.title,
        customMode: !!data.lyrics,
        instrumental: data.instrumental,
        lyrics: data.lyrics,
        gender: data.gender,
        model: data.model
      };

      const sunoResponse = await sunoService.generateMusic(sunoRequest);
      
      // Convertir respuesta de Suno a formato interno
      const generation: MusicGeneration = {
        id: sunoResponse.taskId,
        prompt: data.prompt,
        style: data.style,
        title: data.title,
        model: data.model,
        status: sunoResponse.status === 'completed' ? 'completed' : 
                sunoResponse.status === 'failed' ? 'failed' : 'processing',
        audioUrl: sunoResponse.audioUrl,
        errorMessage: sunoResponse.error,
        createdAt: new Date().toISOString(),
        completedAt: sunoResponse.status === 'completed' ? new Date().toISOString() : undefined
      };

      return generation;
    } catch (error) {
      console.error('Error en generación musical:', error);
      throw error;
    }
  }

  async getGenerations(): Promise<{ generations: MusicGeneration[] }> {
    const response = await api.get('/music/generations');
    return response.data;
  }

  async getGenerationStatus(id: string): Promise<MusicGeneration> {
    const response = await api.get(`/music/generations/${id}`);
    return response.data;
  }

  async cancelGeneration(id: string): Promise<void> {
    await api.delete(`/music/generations/${id}`);
  }

  async getLimits(): Promise<GenerationLimits> {
    const response = await api.get('/music/limits');
    return response.data;
  }

  async checkCanGenerate(model: '3.5' | '5'): Promise<{ canGenerate: boolean; remaining: number; reason?: string }> {
    const response = await api.post('/music/check-limits', { model });
    return response.data;
  }

  // Métodos de utilidad
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'processing': return 'Procesando...';
      case 'failed': return 'Fallido';
      default: return 'Pendiente';
    }
  }
}

export const musicService = new MusicService();
