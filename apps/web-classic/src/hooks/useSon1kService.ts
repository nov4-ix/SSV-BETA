// src/hooks/useSon1kService.ts

import { useState, useCallback, useEffect } from 'react';
import { son1kService, Son1kGenerationParams, Son1kGenerationResponse, Son1kSong } from '../services/son1kService';

export interface UseSon1kServiceReturn {
  // Estado
  loading: boolean;
  error: string | null;
  songs: Son1kSong[];
  progress: number;
  backendHealthy: boolean;
  
  // Métodos
  generateAndWait: (params: Son1kGenerationParams) => Promise<Son1kGenerationResponse>;
  generate: (params: Son1kGenerationParams) => Promise<Son1kGenerationResponse>;
  getStatus: (taskId: string) => Promise<Son1kGenerationResponse>;
  updateToken: (token: string) => Promise<boolean>;
  quickGenerate: (prompt: string, style?: string) => Promise<Son1kSong[]>;
  checkHealth: () => Promise<boolean>;
  clearError: () => void;
  clearSongs: () => void;
  getSongInfo: (song: Son1kSong) => any;
}

export function useSon1kService(): UseSon1kServiceReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<Son1kSong[]>([]);
  const [progress, setProgress] = useState(0);
  const [backendHealthy, setBackendHealthy] = useState(false);

  // Verificar salud del backend al montar el hook
  useEffect(() => {
    checkHealth();
  }, []);

  const generateAndWait = useCallback(async (params: Son1kGenerationParams): Promise<Son1kGenerationResponse> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      console.log('[useSon1kService] 🎵 Iniciando generación...', params);
      
      const result = await son1kService.generateAndWait(params, (progressValue) => {
        setProgress(progressValue);
      });
      
      if (result.success && result.data.songs) {
        setSongs(result.data.songs);
        setProgress(100);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error generando música';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generate = useCallback(async (params: Son1kGenerationParams): Promise<Son1kGenerationResponse> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      console.log('[useSon1kService] 🎵 Iniciando generación...', params);
      
      const result = await son1kService.generate(params);
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error generando música';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (taskId: string): Promise<Son1kGenerationResponse> => {
    try {
      console.log('[useSon1kService] 🔍 Verificando estado...', taskId);
      
      const result = await son1kService.getStatus(taskId);
      
      if (result.success && result.data.songs) {
        setSongs(result.data.songs);
        setProgress(100);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error verificando estado';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      console.log('[useSon1kService] 🔑 Actualizando token...');
      
      const success = await son1kService.updateToken(token);
      
      if (success) {
        setError(null);
        // Verificar salud después de actualizar token
        await checkHealth();
      }
      
      return success;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error actualizando token';
      setError(errorMessage);
      return false;
    }
  }, []);

  const quickGenerate = useCallback(async (prompt: string, style: string = 'pop'): Promise<Son1kSong[]> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      console.log('[useSon1kService] ⚡ Generación rápida...', { prompt, style });
      
      const result = await son1kService.quickGenerate(prompt, style);
      
      setSongs(result);
      setProgress(100);
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error en generación rápida';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[useSon1kService] 🏥 Verificando salud del backend...');
      
      const healthy = await son1kService.checkHealth();
      setBackendHealthy(healthy);
      
      if (!healthy) {
        setError('Backend no disponible');
      } else {
        setError(null);
      }
      
      return healthy;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error verificando salud del backend';
      setError(errorMessage);
      setBackendHealthy(false);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSongs = useCallback(() => {
    setSongs([]);
    setProgress(0);
  }, []);

  const getSongInfo = useCallback((song: Son1kSong) => {
    return son1kService.getSongInfo(song);
  }, []);

  return {
    // Estado
    loading,
    error,
    songs,
    progress,
    backendHealthy,
    
    // Métodos
    generateAndWait,
    generate,
    getStatus,
    updateToken,
    quickGenerate,
    checkHealth,
    clearError,
    clearSongs,
    getSongInfo
  };
}
