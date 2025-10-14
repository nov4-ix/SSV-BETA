/**
 * 🎵 MUSIC SERVICE - SERVICIO DE GENERACIÓN MUSICAL
 * 
 * Maneja la comunicación con el backend para generación de música
 */

export interface MusicGenerationRequest {
  prompt: string;
  style: string;
  title: string;
  model: '3.5' | '5';
  instrumental: boolean;
  lyrics?: string;
  gender?: 'male' | 'female' | 'mixed';
}

export interface MusicGeneration {
  id: string;
  prompt: string;
  style: string;
  title: string;
  audioUrl: string;
  createdAt: string;
  model: string;
  instrumental: boolean;
  lyrics?: string;
  gender?: string;
}

export interface GenerationLimits {
  dailyLimit: number;
  monthlyLimit: number;
  usedToday: number;
  usedThisMonth: number;
  canGenerate: boolean;
}

export interface CanGenerateResponse {
  canGenerate: boolean;
  reason?: string;
}

class MusicService {
  private baseUrl = 'https://68ecf6352bc0b35bdc2f1ae5--son1k.netlify.app/api'; // Backend Netlify Functions

  async generateMusic(request: MusicGenerationRequest): Promise<MusicGeneration> {
    try {
      console.log('🎵 Generando música con backend Suno...', request);
      
      const response = await fetch(`${this.baseUrl}/suno-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          style: request.style,
          title: request.title,
          customMode: false,
          instrumental: request.instrumental,
          lyrics: request.lyrics || '',
          gender: request.gender || ''
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error generando música');
      }
      
      // Convertir respuesta del backend Suno al formato esperado
      if (data.data.songs && data.data.songs.length > 0) {
        const song = data.data.songs[0]; // Tomar la primera canción
        return {
          id: song.id,
          prompt: request.prompt,
          style: request.style,
          title: song.title || request.title,
          audioUrl: song.stream_audio_url || song.audio_url,
          createdAt: new Date(song.createTime).toISOString(),
          model: song.model_name || 'chirp-crow',
          instrumental: request.instrumental,
          lyrics: request.lyrics,
          gender: request.gender
        };
      }
      
      throw new Error('No se generaron canciones');
    } catch (error) {
      console.error('Error generating music:', error);
      throw error;
    }
  }

  async getGenerations(): Promise<{ generations: MusicGeneration[] }> {
    // El backend Suno no tiene endpoint de historial, retornar array vacío
    console.log('📝 Backend Suno no tiene historial, retornando array vacío');
    return { generations: [] };
  }

  async getLimits(): Promise<GenerationLimits> {
    // El backend Suno no tiene límites, retornar límites generosos
    console.log('📊 Backend Suno sin límites, retornando límites generosos');
    return {
      dailyLimit: 100,
      monthlyLimit: 1000,
      usedToday: 0,
      usedThisMonth: 0,
      canGenerate: true,
    };
  }

  async checkCanGenerate(model: '3.5' | '5'): Promise<CanGenerateResponse> {
    // El backend Suno no tiene límites, siempre permitir generación
    console.log('✅ Backend Suno sin límites, permitiendo generación');
    return { canGenerate: true };
  }

  async deleteGeneration(id: string): Promise<void> {
    // El backend Suno no tiene endpoint de eliminación, solo log
    console.log('🗑️ Backend Suno no tiene eliminación, solo log:', id);
  }
}

export const musicService = new MusicService();

