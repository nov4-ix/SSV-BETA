// src/services/sharedTokenService.ts

// Configuración de API
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

interface MusicGenerationParams {
  prompt: string;
  style?: string;
  title?: string;
  customMode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
}

interface SunoSong {
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

interface GenerationResponse {
  success: boolean;
  data: {
    taskId: string;
    status: 'completed' | 'running' | 'failed';
    songs?: SunoSong[];
    message?: string;
  };
  error?: string;
}

class SharedTokenService {
  private clientId: string;
  private currentToken: string | null = null;
  private tokenExpiry: number = 0;
  private isRefreshing = false;

  constructor() {
    this.clientId = this.generateClientId();
    this.loadToken();
  }

  private generateClientId(): string {
    const existingId = localStorage.getItem('son1k_client_id');
    if (existingId) return existingId;
    
    const newId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('son1k_client_id', newId);
    return newId;
  }

  private loadToken(): void {
    try {
      const saved = localStorage.getItem('son1k_shared_token');
      const expiry = localStorage.getItem('son1k_token_expiry');
      
      if (saved && expiry) {
        this.currentToken = saved;
        this.tokenExpiry = parseInt(expiry);
        
        // Verificar si el token está expirado
        if (Date.now() > this.tokenExpiry) {
          console.log('🔄 Token expirado, refrescando...');
          this.refreshToken();
        } else {
          console.log('✅ Token compartido cargado');
        }
      } else {
        console.log('📝 No hay token compartido, obteniendo uno nuevo...');
        this.getNewToken();
      }
    } catch (error) {
      console.error('Error cargando token:', error);
      this.getNewToken();
    }
  }

  private saveToken(token: string, expiry: number): void {
    this.currentToken = token;
    this.tokenExpiry = expiry;
    localStorage.setItem('son1k_shared_token', token);
    localStorage.setItem('son1k_token_expiry', expiry.toString());
  }

  private async getNewToken(): Promise<string> {
    try {
      console.log('🔑 Obteniendo nuevo token compartido...');

      const response = await fetch(`${API_BASE_URL}/token-get-shared`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify({
          clientId: this.clientId
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const expiry = Date.now() + (result.expiresIn || 3600000); // 1 hora por defecto
        this.saveToken(result.token, expiry);
        console.log('✅ Nuevo token compartido obtenido');
        return result.token;
      }

      throw new Error(result.error || 'Error obteniendo token');
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      // Esperar a que termine el refresh actual
      while (this.isRefreshing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.currentToken!;
    }

    this.isRefreshing = true;
    
    try {
      console.log('🔄 Refrescando token compartido...');

      const response = await fetch(`${API_BASE_URL}/token-refresh-shared`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify({
          clientId: this.clientId,
          currentToken: this.currentToken
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const expiry = Date.now() + (result.expiresIn || 3600000);
        this.saveToken(result.token, expiry);
        console.log('✅ Token compartido refrescado');
        return result.token;
      }

      // Si falla el refresh, obtener uno nuevo
      return await this.getNewToken();
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      return await this.getNewToken();
    } finally {
      this.isRefreshing = false;
    }
  }

  private async ensureValidToken(): Promise<string> {
    // Verificar si el token está expirado o cerca de expirar (5 minutos antes)
    if (!this.currentToken || Date.now() > (this.tokenExpiry - 300000)) {
      return await this.refreshToken();
    }
    
    return this.currentToken;
  }

  async generateMusic(params: MusicGenerationParams): Promise<GenerationResponse> {
    try {
      console.log('🎵 Generando música con token compartido...', params.prompt);

      // Asegurar que tenemos un token válido
      const token = await this.ensureValidToken();

      const response = await fetch(`${API_BASE_URL}/suno-generate-and-wait`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId,
          'X-Shared-Token': token
        },
        body: JSON.stringify({
          prompt: params.prompt,
          style: params.style || '',
          title: params.title || '',
          customMode: params.customMode ?? false,
          instrumental: params.instrumental ?? false,
          lyrics: params.lyrics || '',
          gender: params.gender || ''
        })
      });

      if (!response.ok) {
        // Si falla por token, refrescar y reintentar
        if (response.status === 401) {
          console.log('🔄 Token inválido, refrescando y reintentando...');
          const newToken = await this.refreshToken();
          
          const retryResponse = await fetch(`${API_BASE_URL}/suno-generate-and-wait`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Client-ID': this.clientId,
              'X-Shared-Token': newToken
            },
            body: JSON.stringify({
              prompt: params.prompt,
              style: params.style || '',
              title: params.title || '',
              customMode: params.customMode ?? false,
              instrumental: params.instrumental ?? false,
              lyrics: params.lyrics || '',
              gender: params.gender || ''
            })
          });

          if (!retryResponse.ok) {
            throw new Error(`Error ${retryResponse.status}: ${retryResponse.statusText}`);
          }

          const retryResult = await retryResponse.json();
          if (!retryResult.success) {
            throw new Error(retryResult.error || 'Error generando música');
          }

          console.log('✅ Música generada exitosamente (reintento)');
          return retryResult;
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error generando música');
      }

      console.log('✅ Música generada exitosamente');
      return result;

    } catch (error) {
      console.error('❌ Error generando música:', error);
      throw error;
    }
  }

  async getStatus(): Promise<{
    hasToken: boolean;
    isExpired: boolean;
    expiresIn: number;
    clientId: string;
  }> {
    const now = Date.now();
    return {
      hasToken: !!this.currentToken,
      isExpired: now > this.tokenExpiry,
      expiresIn: Math.max(0, this.tokenExpiry - now),
      clientId: this.clientId
    };
  }

  async forceRefresh(): Promise<boolean> {
    try {
      await this.refreshToken();
      return true;
    } catch (error) {
      console.error('Error forzando refresh:', error);
      return false;
    }
  }

  logout(): void {
    this.currentToken = null;
    this.tokenExpiry = 0;
    localStorage.removeItem('son1k_shared_token');
    localStorage.removeItem('son1k_token_expiry');
    console.log('👋 Cliente deslogueado del token compartido');
  }
}

export const sharedTokenService = new SharedTokenService();

