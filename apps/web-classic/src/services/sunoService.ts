// src/services/sunoService.ts

const BACKEND_URL = 'http://localhost:3001/api/suno';

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
      console.log('[Suno] Calling backend...', params);

      const response = await fetch(`${BACKEND_URL}/generate-and-wait`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      console.log('[Suno] ✅ Complete!', result.data);
      return result;

    } catch (error) {
      console.error('[Suno] Error:', error);
      throw error;
    }
  }

  async generate(params: SunoGenerationParams): Promise<SunoGenerationResponse> {
    try {
      console.log('[Suno] Starting generation...', params);

      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      console.log('[Suno] Generation started:', result.data);
      return result;

    } catch (error) {
      console.error('[Suno] Error:', error);
      throw error;
    }
  }

  async getStatus(taskId: string): Promise<SunoGenerationResponse> {
    try {
      console.log('[Suno] Checking status for:', taskId);

      const response = await fetch(`${BACKEND_URL}/status/${taskId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Status check failed');
      }

      console.log('[Suno] Status:', result.data);
      return result;

    } catch (error) {
      console.error('[Suno] Error:', error);
      throw error;
    }
  }

  async updateToken(token: string): Promise<boolean> {
    try {
      console.log('[Suno] Updating token...');

      const response = await fetch(`${BACKEND_URL}/update-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Token update failed');
      }

      console.log('[Suno] ✅ Token updated successfully');
      return true;

    } catch (error) {
      console.error('[Suno] Error updating token:', error);
      return false;
    }
  }
}

export const sunoService = new SunoService();