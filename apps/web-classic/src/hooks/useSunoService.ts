// src/hooks/useSunoService.ts

import { useState, useCallback } from 'react';
import { sunoService, SunoGenerationParams, SunoGenerationResponse, SunoSong } from '../services/sunoService';

export interface UseSunoServiceReturn {
  // Estado
  loading: boolean;
  error: string | null;
  songs: SunoSong[];
  progress: number;
  
  // Métodos
  generateAndWait: (params: SunoGenerationParams) => Promise<SunoGenerationResponse>;
  generate: (params: SunoGenerationParams) => Promise<SunoGenerationResponse>;
  getStatus: (taskId: string) => Promise<SunoGenerationResponse>;
  updateToken: (token: string) => Promise<boolean>;
  clearError: () => void;
  clearSongs: () => void;
}

export function useSunoService(): UseSunoServiceReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<SunoSong[]>([]);
  const [progress, setProgress] = useState(0);

  const generateAndWait = useCallback(async (params: SunoGenerationParams): Promise<SunoGenerationResponse> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      console.log('[useSunoService] Starting generation...', params);
      
      const result = await sunoService.generateAndWait(params, (progressValue) => {
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

  const generate = useCallback(async (params: SunoGenerationParams): Promise<SunoGenerationResponse> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      console.log('[useSunoService] Starting generation...', params);
      
      const result = await sunoService.generate(params);
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error generando música';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (taskId: string): Promise<SunoGenerationResponse> => {
    try {
      console.log('[useSunoService] Checking status...', taskId);
      
      const result = await sunoService.getStatus(taskId);
      
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
      console.log('[useSunoService] Updating token...');
      
      const success = await sunoService.updateToken(token);
      
      if (success) {
        setError(null);
      }
      
      return success;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error actualizando token';
      setError(errorMessage);
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

  return {
    // Estado
    loading,
    error,
    songs,
    progress,
    
    // Métodos
    generateAndWait,
    generate,
    getStatus,
    updateToken,
    clearError,
    clearSongs
  };
}