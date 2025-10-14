// src/services/son1kService.ts

// Configuración de API
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const BACKEND_URL = `${API_BASE_URL}/suno-generate-and-wait`;

export interface Son1kGenerationParams {
  prompt: string;
  style?: string;
  title?: string;
  customMode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
}

export interface Son1kSong {
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

export interface Son1kGenerationResponse {
  success: boolean;
  data: {
    taskId: string;
    status: 'completed' | 'running' | 'failed';
    songs?: Son1kSong[];
    message?: string;
    audioUrl?: string;
    imageUrl?: string;
  };
  error?: string;
}

export class Son1kService {
  private static instance: Son1kService;
  
  public static getInstance(): Son1kService {
    if (!Son1kService.instance) {
      Son1kService.instance = new Son1kService();
    }
    return Son1kService.instance;
  }

  async generateAndWait(params: Son1kGenerationParams, onProgress?: (progress: number) => void): Promise<Son1kGenerationResponse> {
    try {
      console.log('[Son1k] 🎵 Generando música...', params);

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
        throw new Error(result.error || 'Generación falló');
      }

      console.log('[Son1k] ✅ ¡Música generada exitosamente!', result.data);
      return result;

    } catch (error) {
      console.error('[Son1k] ❌ Error:', error);
      throw error;
    }
  }

  async generate(params: Son1kGenerationParams): Promise<Son1kGenerationResponse> {
    try {
      console.log('[Son1k] 🎵 Iniciando generación...', params);

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
        throw new Error(result.error || 'Generación falló');
      }

      console.log('[Son1k] ✅ Generación iniciada:', result.data);
      return result;

    } catch (error) {
      console.error('[Son1k] ❌ Error:', error);
      throw error;
    }
  }

  async getStatus(taskId: string): Promise<Son1kGenerationResponse> {
    try {
      console.log('[Son1k] 🔍 Verificando estado para:', taskId);

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
        throw new Error(result.error || 'Verificación de estado falló');
      }

      console.log('[Son1k] 📊 Estado:', result.data);
      return result;

    } catch (error) {
      console.error('[Son1k] ❌ Error:', error);
      throw error;
    }
  }

  async updateToken(token: string): Promise<boolean> {
    try {
      console.log('[Son1k] 🔑 Actualizando token...');

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
        throw new Error(result.error || 'Actualización de token falló');
      }

      console.log('[Son1k] ✅ Token actualizado exitosamente');
      return true;

    } catch (error) {
      console.error('[Son1k] ❌ Error actualizando token:', error);
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      console.log('[Son1k] 🏥 Verificando salud del backend...');

      const response = await fetch(`${BACKEND_URL.replace('/api/suno', '')}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      console.log('[Son1k] ✅ Backend saludable:', result);
      return result.status === 'running' && result.hasToken;

    } catch (error) {
      console.error('[Son1k] ❌ Backend no disponible:', error);
      return false;
    }
  }

  // Método de conveniencia para generar música rápida
  async quickGenerate(prompt: string, style: string = 'pop'): Promise<Son1kSong[]> {
    try {
      const result = await this.generateAndWait({
        prompt,
        style,
        title: '',
        customMode: false,
        instrumental: false,
        lyrics: '',
        gender: ''
      });

      if (result.success && result.data.songs) {
        return result.data.songs;
      }

      throw new Error('No se generaron canciones');
    } catch (error) {
      console.error('[Son1k] ❌ Error en generación rápida:', error);
      throw error;
    }
  }

  // Método para obtener información de una canción
  getSongInfo(song: Son1kSong): {
    id: string;
    title: string;
    tags: string[];
    audioUrl: string;
    imageUrl: string;
    duration?: number;
  } {
    return {
      id: song.id,
      title: song.title,
      tags: song.tags.split(',').map(tag => tag.trim()),
      audioUrl: song.stream_audio_url || song.audio_url,
      imageUrl: song.image_url,
      duration: undefined // Suno no proporciona duración
    };
  }
}

export const son1kService = Son1kService.getInstance();
