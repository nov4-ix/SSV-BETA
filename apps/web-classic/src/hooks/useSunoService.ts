/**
 * 🎵 HOOK DE REACT PARA SERVICIO DE GENERACIÓN MUSICAL
 * 
 * Hook personalizado para manejar la generación musical con Son1kVerse AI
 * 
 * ⚠️ NO MODIFICAR SIN LEER SUNO_INTEGRATION_DOCS.md
 */

import { useState, useCallback, useEffect } from 'react';
import { sunoService } from '../services/sunoService';
import { clientManager } from '../services/clientManager';
import { tokenManager } from '../services/tokenManager';
import { SunoGenerationRequest, SunoGenerationResponse } from '../services/sunoService';

export interface UseSunoServiceReturn {
  // Estado
  isGenerating: boolean;
  isConnected: boolean;
  error: string | null;
  lastGeneration: SunoGenerationResponse | null;
  
  // Métodos
  generateMusic: (request: SunoGenerationRequest) => Promise<SunoGenerationResponse>;
  testConnection: () => Promise<boolean>;
  cancelGeneration: (taskId: string) => Promise<boolean>;
  
  // Información del servicio
  serviceStatus: any;
  clientStats: any;
}

export const useSunoService = (): UseSunoServiceReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneration, setLastGeneration] = useState<SunoGenerationResponse | null>(null);
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  // Inicializar servicio
  useEffect(() => {
    initializeService();
  }, []);

  // Actualizar estado del servicio periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      updateServiceStatus();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  /**
   * 🚀 INICIALIZAR SERVICIO
   */
  const initializeService = useCallback(async () => {
    try {
      setError(null);
      
      // Probar conexión
      const connected = await sunoService.testConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError('No se pudo conectar con el servicio de IA musical');
      }
      
      // Actualizar estado del servicio
      updateServiceStatus();
      
    } catch (err) {
      console.error('Error inicializando servicio:', err);
      setError('Error inicializando servicio de IA musical');
      setIsConnected(false);
    }
  }, []);

  /**
   * 📊 ACTUALIZAR ESTADO DEL SERVICIO
   */
  const updateServiceStatus = useCallback(() => {
    try {
      const status = sunoService.getServiceStatus();
      setServiceStatus(status);
    } catch (err) {
      console.error('Error actualizando estado del servicio:', err);
    }
  }, []);

  /**
   * 🎵 GENERAR MÚSICA
   */
  const generateMusic = useCallback(async (request: SunoGenerationRequest): Promise<SunoGenerationResponse> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Verificar que el servicio esté conectado
      if (!isConnected) {
        throw new Error('Servicio de IA musical no conectado');
      }
      
      // Verificar que el cliente pueda generar
      if (!clientManager.canGenerate()) {
        throw new Error('Límite de generaciones del cliente alcanzado');
      }
      
      // Generar música
      const response = await sunoService.generateMusic(request);
      
      // Guardar última generación
      setLastGeneration(response);
      
      return response;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Error generando música';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [isConnected]);

  /**
   * 🧪 PROBAR CONEXIÓN
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const connected = await sunoService.testConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError('No se pudo conectar con el servicio de IA musical');
      }
      
      return connected;
    } catch (err) {
      console.error('Error probando conexión:', err);
      setError('Error probando conexión');
      setIsConnected(false);
      return false;
    }
  }, []);

  /**
   * ❌ CANCELAR GENERACIÓN
   */
  const cancelGeneration = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      setError(null);
      const cancelled = await sunoService.cancelGeneration(taskId);
      
      if (!cancelled) {
        setError('No se pudo cancelar la generación');
      }
      
      return cancelled;
    } catch (err) {
      console.error('Error cancelando generación:', err);
      setError('Error cancelando generación');
      return false;
    }
  }, []);

  // Obtener estadísticas del cliente
  const clientStats = clientManager.getClientStats();

  return {
    // Estado
    isGenerating,
    isConnected,
    error,
    lastGeneration,
    
    // Métodos
    generateMusic,
    testConnection,
    cancelGeneration,
    
    // Información del servicio
    serviceStatus,
    clientStats
  };
};

// ⚠️ ADVERTENCIA DE USO
console.warn('🎵 USE SUNO SERVICE: Hook de generación musical inicializado');
console.warn('📖 Para más información, consulta: SUNO_INTEGRATION_DOCS.md');
