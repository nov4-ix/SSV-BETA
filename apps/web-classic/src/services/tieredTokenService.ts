// src/services/tieredTokenService.ts

interface ClientTier {
  type: 'free' | 'premium';
  userId?: string;
  email?: string;
  generationLimit: number;
  hourlyLimit: number;
  priority: number;
}

interface TokenPool {
  tokens: string[];
  currentIndex: number;
  lastUsed: number;
  usageCount: number;
  maxUsage: number;
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

interface GenerationResponse {
  success: boolean;
  data: {
    taskId: string;
    status: 'completed' | 'running' | 'failed';
    songs?: any[];
    message?: string;
  };
  error?: string;
}

class TieredTokenService {
  private clientId: string;
  private clientTier: ClientTier;
  private currentToken: string | null = null;
  private tokenExpiry: number = 0;
  private hourlyUsage: number = 0;
  private lastHourReset: number = Date.now();

  constructor() {
    this.clientId = this.generateClientId();
    this.clientTier = this.detectClientTier();
    this.loadToken();
    this.resetHourlyUsage();
  }

  private generateClientId(): string {
    const existingId = localStorage.getItem('son1k_client_id');
    if (existingId) return existingId;
    
    const newId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('son1k_client_id', newId);
    return newId;
  }

  private detectClientTier(): ClientTier {
    // Detectar tier del cliente
    const savedTier = localStorage.getItem(`son1k_tier_${this.clientId}`);
    
    if (savedTier) {
      try {
        return JSON.parse(savedTier);
      } catch (error) {
        console.error('Error parsing saved tier:', error);
      }
    }

    // Por defecto, cliente free
    const defaultTier: ClientTier = {
      type: 'free',
      generationLimit: 10,
      hourlyLimit: 10,
      priority: 1
    };

    this.saveClientTier(defaultTier);
    return defaultTier;
  }

  private saveClientTier(tier: ClientTier): void {
    localStorage.setItem(`son1k_tier_${this.clientId}`, JSON.stringify(tier));
  }

  private loadToken(): void {
    try {
      const saved = localStorage.getItem(`son1k_token_${this.clientTier.type}`);
      const expiry = localStorage.getItem(`son1k_token_expiry_${this.clientTier.type}`);
      
      if (saved && expiry) {
        this.currentToken = saved;
        this.tokenExpiry = parseInt(expiry);
        
        if (Date.now() > this.tokenExpiry) {
          console.log('🔄 Token expirado, refrescando...');
          this.refreshToken();
        } else {
          console.log(`✅ Token ${this.clientTier.type} cargado`);
        }
      } else {
        console.log(`📝 No hay token ${this.clientTier.type}, obteniendo uno nuevo...`);
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
    localStorage.setItem(`son1k_token_${this.clientTier.type}`, token);
    localStorage.setItem(`son1k_token_expiry_${this.clientTier.type}`, expiry.toString());
  }

  private resetHourlyUsage(): void {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    
    if (now - this.lastHourReset > hourInMs) {
      this.hourlyUsage = 0;
      this.lastHourReset = now;
      localStorage.setItem(`son1k_hourly_usage_${this.clientId}`, '0');
      localStorage.setItem(`son1k_last_hour_reset_${this.clientId}`, now.toString());
    } else {
      const saved = localStorage.getItem(`son1k_hourly_usage_${this.clientId}`);
      this.hourlyUsage = saved ? parseInt(saved) : 0;
    }
  }

  private incrementUsage(): void {
    this.hourlyUsage++;
    localStorage.setItem(`son1k_hourly_usage_${this.clientId}`, this.hourlyUsage.toString());
  }

  private async getNewToken(): Promise<string> {
    try {
      console.log(`🔑 Obteniendo nuevo token ${this.clientTier.type}...`);

      const response = await fetch('http://localhost:3001/api/token/get-tiered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify({
          clientId: this.clientId,
          tier: this.clientTier.type,
          priority: this.clientTier.priority
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const expiry = Date.now() + (result.expiresIn || 3600000);
        this.saveToken(result.token, expiry);
        console.log(`✅ Nuevo token ${this.clientTier.type} obtenido`);
        return result.token;
      }

      throw new Error(result.error || 'Error obteniendo token');
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<string> {
    try {
      console.log(`🔄 Refrescando token ${this.clientTier.type}...`);

      const response = await fetch('http://localhost:3001/api/token/refresh-tiered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify({
          clientId: this.clientId,
          tier: this.clientTier.type,
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
        console.log(`✅ Token ${this.clientTier.type} refrescado`);
        return result.token;
      }

      return await this.getNewToken();
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      return await this.getNewToken();
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.currentToken || Date.now() > (this.tokenExpiry - 300000)) {
      return await this.refreshToken();
    }
    
    return this.currentToken;
  }

  private canGenerate(): { canGenerate: boolean; reason?: string } {
    this.resetHourlyUsage();

    if (this.hourlyUsage >= this.clientTier.hourlyLimit) {
      return {
        canGenerate: false,
        reason: `Límite horario alcanzado (${this.clientTier.hourlyLimit}/${this.clientTier.hourlyLimit}). Upgrade a premium para más generaciones.`
      };
    }

    return { canGenerate: true };
  }

  async generateMusic(params: MusicGenerationParams): Promise<GenerationResponse> {
    try {
      // Verificar límites
      const canGen = this.canGenerate();
      if (!canGen.canGenerate) {
        throw new Error(canGen.reason || 'No se puede generar música');
      }

      console.log(`🎵 Generando música con tier ${this.clientTier.type}...`, params.prompt);

      // Asegurar token válido
      const token = await this.ensureValidToken();

      const response = await fetch('http://localhost:3001/api/suno/generate-and-wait', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId,
          'X-Tier': this.clientTier.type,
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
        if (response.status === 401) {
          console.log('🔄 Token inválido, refrescando y reintentando...');
          const newToken = await this.refreshToken();
          
          const retryResponse = await fetch('http://localhost:3001/api/suno/generate-and-wait', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Client-ID': this.clientId,
              'X-Tier': this.clientTier.type,
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

          this.incrementUsage();
          console.log('✅ Música generada exitosamente (reintento)');
          return retryResult;
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error generando música');
      }

      this.incrementUsage();
      console.log('✅ Música generada exitosamente');
      return result;

    } catch (error) {
      console.error('❌ Error generando música:', error);
      throw error;
    }
  }

  async upgradeToPremium(email: string): Promise<boolean> {
    try {
      console.log('⬆️ Upgrading to premium...', email);

      const response = await fetch('http://localhost:3001/api/tier/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify({
          clientId: this.clientId,
          email,
          currentTier: this.clientTier.type
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.clientTier = {
          type: 'premium',
          userId: result.userId,
          email,
          generationLimit: 100,
          hourlyLimit: 100,
          priority: 2
        };
        
        this.saveClientTier(this.clientTier);
        console.log('✅ Upgrade a premium exitoso');
        return true;
      }

      throw new Error(result.error || 'Error upgrading to premium');
    } catch (error) {
      console.error('❌ Error upgrading to premium:', error);
      return false;
    }
  }

  async getStatus(): Promise<{
    tier: string;
    hasToken: boolean;
    isExpired: boolean;
    expiresIn: number;
    hourlyUsage: number;
    hourlyLimit: number;
    canGenerate: boolean;
    clientId: string;
  }> {
    const now = Date.now();
    const canGen = this.canGenerate();
    
    return {
      tier: this.clientTier.type,
      hasToken: !!this.currentToken,
      isExpired: now > this.tokenExpiry,
      expiresIn: Math.max(0, this.tokenExpiry - now),
      hourlyUsage: this.hourlyUsage,
      hourlyLimit: this.clientTier.hourlyLimit,
      canGenerate: canGen.canGenerate,
      clientId: this.clientId
    };
  }

  logout(): void {
    this.currentToken = null;
    this.tokenExpiry = 0;
    this.hourlyUsage = 0;
    
    localStorage.removeItem(`son1k_token_${this.clientTier.type}`);
    localStorage.removeItem(`son1k_token_expiry_${this.clientTier.type}`);
    localStorage.removeItem(`son1k_hourly_usage_${this.clientId}`);
    localStorage.removeItem(`son1k_last_hour_reset_${this.clientId}`);
    
    console.log('👋 Cliente deslogueado');
  }
}

export const tieredTokenService = new TieredTokenService();

