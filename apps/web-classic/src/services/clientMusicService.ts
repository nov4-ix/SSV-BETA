// src/services/clientMusicService.ts

// Configuración de API
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

interface ClientAccount {
  email: string;
  password: string;
  token?: string;
  lastUsed: number;
  isActive: boolean;
}

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

class ClientMusicService {
  private clientId: string;
  private clientAccount: ClientAccount | null = null;
  private isInitialized = false;

  constructor() {
    this.clientId = this.generateClientId();
    this.loadClientAccount();
  }

  private generateClientId(): string {
    // Generar ID único para este cliente/navegador
    const existingId = localStorage.getItem('son1k_client_id');
    if (existingId) return existingId;
    
    const newId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('son1k_client_id', newId);
    return newId;
  }

  private loadClientAccount(): void {
    try {
      const saved = localStorage.getItem(`son1k_account_${this.clientId}`);
      if (saved) {
        this.clientAccount = JSON.parse(saved);
        console.log('✅ Cuenta del cliente cargada:', this.clientAccount?.email);
      }
    } catch (error) {
      console.error('Error cargando cuenta del cliente:', error);
    }
  }

  private saveClientAccount(): void {
    if (this.clientAccount) {
      localStorage.setItem(`son1k_account_${this.clientId}`, JSON.stringify(this.clientAccount));
    }
  }

  async registerClientAccount(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Registrando cuenta del cliente...', email);

      // Crear cuenta en imgkits usando el backend
      const response = await fetch(`${API_BASE_URL}/client-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.clientId,
          email,
          password
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.clientAccount = {
          email,
          password,
          token: result.token,
          lastUsed: Date.now(),
          isActive: true
        };
        
        this.saveClientAccount();
        console.log('✅ Cuenta del cliente registrada exitosamente');
        return true;
      }

      throw new Error(result.error || 'Error registrando cuenta');
    } catch (error) {
      console.error('❌ Error registrando cuenta del cliente:', error);
      return false;
    }
  }

  async generateMusic(params: MusicGenerationParams): Promise<GenerationResponse> {
    try {
      // Verificar si tenemos cuenta del cliente
      if (!this.clientAccount) {
        throw new Error('No hay cuenta del cliente registrada. Por favor regístrate primero.');
      }

      // Verificar si la cuenta está activa
      if (!this.clientAccount.isActive) {
        throw new Error('La cuenta del cliente no está activa. Por favor vuelve a registrarte.');
      }

      console.log('🎵 Generando música con cuenta del cliente...', this.clientAccount.email);

      // Usar la cuenta del cliente para generar música
      const response = await fetch(`${API_BASE_URL}/client-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify({
          clientId: this.clientId,
          params: {
            prompt: params.prompt,
            style: params.style || '',
            title: params.title || '',
            customMode: params.customMode ?? false,
            instrumental: params.instrumental ?? false,
            lyrics: params.lyrics || '',
            gender: params.gender || ''
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        // Si falla, marcar cuenta como inactiva
        if (this.clientAccount) {
          this.clientAccount.isActive = false;
          this.saveClientAccount();
        }
        throw new Error(result.error || 'Error generando música');
      }

      // Actualizar último uso
      if (this.clientAccount) {
        this.clientAccount.lastUsed = Date.now();
        this.saveClientAccount();
      }

      console.log('✅ Música generada exitosamente con cuenta del cliente');
      return result;

    } catch (error) {
      console.error('❌ Error generando música:', error);
      throw error;
    }
  }

  async checkClientStatus(): Promise<{
    hasAccount: boolean;
    isActive: boolean;
    email?: string;
    lastUsed?: number;
  }> {
    return {
      hasAccount: !!this.clientAccount,
      isActive: this.clientAccount?.isActive || false,
      email: this.clientAccount?.email,
      lastUsed: this.clientAccount?.lastUsed
    };
  }

  async refreshClientToken(): Promise<boolean> {
    if (!this.clientAccount) return false;

    try {
      console.log('🔄 Refrescando token del cliente...');

      const response = await fetch(`${API_BASE_URL}/client-refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify({
          clientId: this.clientId,
          email: this.clientAccount.email,
          password: this.clientAccount.password
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && this.clientAccount) {
        this.clientAccount.token = result.token;
        this.clientAccount.isActive = true;
        this.clientAccount.lastUsed = Date.now();
        this.saveClientAccount();
        
        console.log('✅ Token del cliente refrescado exitosamente');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error refrescando token del cliente:', error);
      return false;
    }
  }

  logout(): void {
    this.clientAccount = null;
    localStorage.removeItem(`son1k_account_${this.clientId}`);
    console.log('👋 Cliente deslogueado');
  }

  getClientInfo(): {
    clientId: string;
    hasAccount: boolean;
    email?: string;
    isActive?: boolean;
  } {
    return {
      clientId: this.clientId,
      hasAccount: !!this.clientAccount,
      email: this.clientAccount?.email,
      isActive: this.clientAccount?.isActive
    };
  }
}

export const clientMusicService = new ClientMusicService();

