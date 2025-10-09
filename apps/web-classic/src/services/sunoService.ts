/**
 * 🎵 SERVICIO DE GENERACIÓN MUSICAL
 * 
 * Conecta con la extensión de Chrome para generar música
 * 
 * ⚠️ NO MODIFICAR SIN LEER SUNO_INTEGRATION_DOCS.md
 */

import { getSunoConfig } from '../config/apiTokens';
import { tokenManager } from './tokenManager';
import { clientManager } from './clientManager';

export interface SunoGenerationRequest {
  prompt: string;
  style: string;
  title: string;
  customMode: boolean;
  instrumental: boolean;
  lyrics?: string;
  gender?: string;
  model: '3.5' | '5';
}

export interface SunoGenerationResponse {
  taskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  error?: string;
}

class SunoService {
  private readonly POLLING_INTERVAL = 3000; // 3 segundos
  private readonly MAX_POLLING_ATTEMPTS = 60; // 3 minutos máximo

  /**
   * 🎵 GENERAR MÚSICA
   */
  async generateMusic(request: SunoGenerationRequest): Promise<SunoGenerationResponse> {
    try {
      // Validar token antes de generar
      const tokenValidation = await tokenManager.validateToken();
      if (!tokenValidation.isValid) {
        if (tokenValidation.needsRefresh) {
          const refreshed = await tokenManager.refreshToken();
          if (!refreshed) {
            throw new Error('No se pudo renovar el token de IA musical');
          }
        } else {
          throw new Error(tokenValidation.error || 'Token de IA musical inválido');
        }
      }

      // Verificar que el cliente puede generar
      if (!clientManager.canGenerate()) {
        throw new Error('Límite de generaciones del cliente alcanzado');
      }

      const config = getSunoConfig();
      
      // Preparar datos para la generación
      const generationData = {
        prompt: request.prompt,
        style: request.style,
        title: request.title,
        customMode: request.customMode,
        instrumental: request.instrumental,
        lyrics: request.lyrics || '',
        gender: request.gender || 'mixed'
      };

      console.log('🎵 Iniciando generación musical:', generationData);

      // Llamar a la API de generación
      const response = await fetch(`${config.BASE_URL}/generate`, {
        method: 'POST',
        headers: config.HEADERS,
        body: JSON.stringify(generationData),
      });

      if (!response.ok) {
        throw new Error(`Error en generación: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.taskId) {
        throw new Error('No se recibió taskId de la generación');
      }

      console.log('✅ Generación iniciada, taskId:', result.taskId);

      // Iniciar polling para obtener el resultado
      return await this.pollGenerationStatus(result.taskId);

    } catch (error) {
      console.error('❌ Error en generación musical:', error);
      throw error;
    }
  }

  /**
   * 🔄 POLLING DEL ESTADO DE GENERACIÓN
   */
  private async pollGenerationStatus(taskId: string): Promise<SunoGenerationResponse> {
    const config = getSunoConfig();
    let attempts = 0;

    while (attempts < this.MAX_POLLING_ATTEMPTS) {
      try {
        // Usar el endpoint correcto: /get_mj_status/{taskId}
        const response = await fetch(`${config.POLLING_URL}/get_mj_status/${taskId}`, {
          method: 'GET',
          headers: config.HEADERS,
        });

        if (!response.ok) {
          throw new Error(`Error en polling: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        console.log(`🔄 Polling ${attempts + 1}/${this.MAX_POLLING_ATTEMPTS}:`, result);

        // Si la generación está completada
        if (!result.running) {
          if (result.audio_url) {
            console.log('✅ Generación completada exitosamente');
            return {
              taskId,
              status: 'completed',
              audioUrl: result.audio_url
            };
          } else {
            console.error('❌ Generación falló:', result);
            return {
              taskId,
              status: 'failed',
              error: result.error || 'Error desconocido en la generación'
            };
          }
        }

        // Si aún está procesando, esperar y continuar
        attempts++;
        await this.sleep(this.POLLING_INTERVAL);

      } catch (error) {
        console.error('❌ Error en polling:', error);
        attempts++;
        
        if (attempts >= this.MAX_POLLING_ATTEMPTS) {
          throw new Error('Timeout en la generación musical');
        }
        
        await this.sleep(this.POLLING_INTERVAL);
      }
    }

    throw new Error('Timeout: La generación tardó demasiado tiempo');
  }

  /**
   * ⏰ UTILIDAD DE SLEEP
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🧪 PROBAR CONEXIÓN CON LA EXTENSIÓN
   */
  async testConnection(): Promise<boolean> {
    try {
      const config = getSunoConfig();
      
      // Hacer una llamada de prueba
      const response = await fetch(`${config.BASE_URL}/test`, {
        method: 'GET',
        headers: config.HEADERS,
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error probando conexión:', error);
      return false;
    }
  }

  /**
   * 📊 OBTENER ESTADO DEL SERVICIO
   */
  getServiceStatus() {
    const clientStats = clientManager.getClientStats();
    const tokenStatus = tokenManager.getTokenStatus();
    const clientHealth = clientManager.getClientHealth();

    return {
      client: {
        id: clientStats?.id,
        generationCount: clientStats?.generationCount,
        maxGenerations: clientStats?.maxGenerations,
        remainingGenerations: clientStats?.remainingGenerations,
        health: clientHealth
      },
      token: {
        isValid: tokenStatus?.isValid,
        isExpired: tokenStatus?.isExpired,
        usageCount: tokenStatus?.usageCount,
        lastUsed: tokenStatus?.lastUsed
      },
      service: {
        canGenerate: clientManager.canGenerate(),
        connectionTest: 'pending' // Se puede probar con testConnection()
      }
    };
  }

  /**
   * 🔄 CANCELAR GENERACIÓN
   */
  async cancelGeneration(taskId: string): Promise<boolean> {
    try {
      const config = getSunoConfig();
      
      const response = await fetch(`${config.BASE_URL}/cancel/${taskId}`, {
        method: 'POST',
        headers: config.HEADERS,
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error cancelando generación:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const sunoService = new SunoService();

// ⚠️ ADVERTENCIA DE USO
console.warn('🎵 SUNO SERVICE: Servicio de generación musical inicializado');
console.warn('📖 Para más información, consulta: SUNO_INTEGRATION_DOCS.md');
