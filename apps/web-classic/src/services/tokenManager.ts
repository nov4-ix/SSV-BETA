/**
 * 🔑 GESTOR DE TOKENS DE SUNO
 * 
 * Sistema de autogestión de tokens para la integración con Suno AI
 * 
 * ⚠️ NO MODIFICAR SIN LEER SUNO_INTEGRATION_DOCS.md
 */

import { SUNO_CONFIG, updateSunoToken, getSunoConfig, validateSunoConfig } from '../config/apiTokens';

export interface TokenStatus {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface TokenValidationResult {
  isValid: boolean;
  needsRefresh: boolean;
  error?: string;
  status: TokenStatus;
}

class TokenManager {
  private static instance: TokenManager;
  private tokenStatus: TokenStatus | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private readonly TOKEN_STORAGE_KEY = 'suno_token_status';
  private readonly MAX_USAGE_BEFORE_REFRESH = 100;
  private readonly TOKEN_LIFETIME_HOURS = 24;

  private constructor() {
    this.loadTokenStatus();
    this.initializeTokenValidation();
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * 🔍 VALIDAR TOKEN ACTUAL
   */
  async validateToken(): Promise<TokenValidationResult> {
    try {
      // Verificar configuración básica
      const configValidation = validateSunoConfig();
      if (!configValidation.isValid) {
        return {
          isValid: false,
          needsRefresh: false,
          error: `Configuración inválida: ${configValidation.errors.join(', ')}`,
          status: this.getDefaultTokenStatus()
        };
      }

      // Verificar si el token está expirado por tiempo
      if (this.isTokenExpiredByTime()) {
        return {
          isValid: false,
          needsRefresh: true,
          error: 'Token expirado por tiempo',
          status: this.getDefaultTokenStatus()
        };
      }

      // Verificar si el token necesita refresh por uso
      if (this.needsRefreshByUsage()) {
        return {
          isValid: true,
          needsRefresh: true,
          error: undefined,
          status: this.tokenStatus || this.getDefaultTokenStatus()
        };
      }

      // Hacer una prueba real del token
      const isTokenWorking = await this.testTokenWithAPI();
      
      if (!isTokenWorking) {
        return {
          isValid: false,
          needsRefresh: true,
          error: 'Token no válido o expirado',
          status: this.getDefaultTokenStatus()
        };
      }

      // Actualizar estadísticas de uso
      this.updateUsageStats();

      return {
        isValid: true,
        needsRefresh: false,
        error: undefined,
        status: this.tokenStatus || this.getDefaultTokenStatus()
      };

    } catch (error) {
      console.error('❌ Error validando token:', error);
      return {
        isValid: false,
        needsRefresh: true,
        error: `Error de validación: ${error}`,
        status: this.getDefaultTokenStatus()
      };
    }
  }

  /**
   * 🔄 REFRESCAR TOKEN
   */
  async refreshToken(): Promise<boolean> {
    // Evitar múltiples refreshes simultáneos
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * 🧪 PROBAR TOKEN CON API
   */
  private async testTokenWithAPI(): Promise<boolean> {
    try {
      // Hacer una llamada de prueba a la API de Suno
      const response = await fetch(`${SUNO_CONFIG.BASE_URL}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': SUNO_CONFIG.AUTH_TOKEN,
          'channel': 'node-api',
          'origin': 'https://www.livepolls.app',
          'referer': 'https://www.livepolls.app/'
        },
      });

      // Si recibimos 401, el token es inválido
      if (response.status === 401) {
        return false;
      }

      // Si recibimos cualquier otra respuesta (incluso 404), el token es válido
      return true;

    } catch (error) {
      console.warn('⚠️ No se pudo probar el token, asumiendo válido:', error);
      return true; // En caso de error de red, asumimos que el token es válido
    }
  }

  /**
   * 🔄 REALIZAR REFRESH DEL TOKEN
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      console.log('🔄 Iniciando refresh de token de Suno...');

      // Aquí implementarías la lógica de refresh real
      // Por ahora, simulamos un refresh exitoso
      const newToken = await this.fetchNewToken();
      
      if (newToken) {
        updateSunoToken(newToken);
        this.resetTokenStatus();
        console.log('✅ Token de Suno refrescado exitosamente');
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      return false;
    }
  }

  /**
   * 📡 OBTENER NUEVO TOKEN
   */
  private async fetchNewToken(): Promise<string | null> {
    try {
      // Aquí implementarías la llamada real para obtener un nuevo token
      // Por ahora, retornamos null para indicar que no hay refresh automático
      console.warn('⚠️ Refresh automático de token no implementado');
      return null;

    } catch (error) {
      console.error('❌ Error obteniendo nuevo token:', error);
      return null;
    }
  }

  /**
   * ⏰ VERIFICAR SI EL TOKEN EXPIRÓ POR TIEMPO
   */
  private isTokenExpiredByTime(): boolean {
    if (!this.tokenStatus?.expiresAt) {
      return false;
    }

    return new Date() > this.tokenStatus.expiresAt;
  }

  /**
   * 📊 VERIFICAR SI NECESITA REFRESH POR USO
   */
  private needsRefreshByUsage(): boolean {
    if (!this.tokenStatus) {
      return false;
    }

    return this.tokenStatus.usageCount >= this.MAX_USAGE_BEFORE_REFRESH;
  }

  /**
   * 📈 ACTUALIZAR ESTADÍSTICAS DE USO
   */
  private updateUsageStats(): void {
    if (!this.tokenStatus) {
      this.tokenStatus = this.getDefaultTokenStatus();
    }

    this.tokenStatus.usageCount++;
    this.tokenStatus.lastUsed = new Date();
    
    this.saveTokenStatus();
  }

  /**
   * 🔄 REINICIAR ESTADO DEL TOKEN
   */
  private resetTokenStatus(): void {
    this.tokenStatus = {
      isValid: true,
      isExpired: false,
      expiresAt: new Date(Date.now() + this.TOKEN_LIFETIME_HOURS * 60 * 60 * 1000),
      lastUsed: new Date(),
      usageCount: 0
    };

    this.saveTokenStatus();
  }

  /**
   * 💾 CARGAR ESTADO DEL TOKEN
   */
  private loadTokenStatus(): void {
    try {
      const stored = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.tokenStatus = {
          ...parsed,
          expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
          lastUsed: parsed.lastUsed ? new Date(parsed.lastUsed) : undefined
        };
      }
    } catch (error) {
      console.warn('⚠️ Error cargando estado del token:', error);
      this.tokenStatus = this.getDefaultTokenStatus();
    }
  }

  /**
   * 💾 GUARDAR ESTADO DEL TOKEN
   */
  private saveTokenStatus(): void {
    try {
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(this.tokenStatus));
    } catch (error) {
      console.warn('⚠️ Error guardando estado del token:', error);
    }
  }

  /**
   * 🏁 OBTENER ESTADO POR DEFECTO
   */
  private getDefaultTokenStatus(): TokenStatus {
    return {
      isValid: false,
      isExpired: false,
      usageCount: 0
    };
  }

  /**
   * 🚀 INICIALIZAR VALIDACIÓN DE TOKEN
   */
  private initializeTokenValidation(): void {
    // Validar token al inicializar
    this.validateToken().then(result => {
      if (!result.isValid && result.needsRefresh) {
        console.warn('⚠️ Token necesita refresh al inicializar');
      }
    });

    // Validar token periódicamente
    setInterval(() => {
      this.validateToken().then(result => {
        if (!result.isValid && result.needsRefresh) {
          console.warn('⚠️ Token necesita refresh (validación periódica)');
        }
      });
    }, 30 * 60 * 1000); // Cada 30 minutos
  }

  /**
   * 📊 OBTENER ESTADO ACTUAL
   */
  getTokenStatus(): TokenStatus | null {
    return this.tokenStatus;
  }

  /**
   * 🔧 FORZAR REFRESH
   */
  async forceRefresh(): Promise<boolean> {
    console.log('🔄 Forzando refresh de token...');
    return this.refreshToken();
  }
}

// Exportar instancia singleton
export const tokenManager = TokenManager.getInstance();

// ⚠️ ADVERTENCIA DE USO
console.warn('🔑 TOKEN MANAGER: Sistema de autogestión de tokens inicializado');
console.warn('📖 Para más información, consulta: SUNO_INTEGRATION_DOCS.md');
