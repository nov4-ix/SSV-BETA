import { useState, useCallback, useEffect } from 'react';
import { sharedTokenService } from '../services/sharedTokenService';

interface MusicGenerationParams {
  prompt: string;
  style?: string;
  title?: string;
  customMode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
}

export function useSharedTokenService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [musicData, setMusicData] = useState<any>(null);
  const [tokenStatus, setTokenStatus] = useState<any>(null);

  // Verificar estado del token al cargar
  useEffect(() => {
    const checkTokenStatus = async () => {
      try {
        const status = await sharedTokenService.getStatus();
        setTokenStatus(status);
      } catch (error) {
        console.error('Error verificando estado del token:', error);
      }
    };

    checkTokenStatus();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkTokenStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateMusic = useCallback(async (params: MusicGenerationParams) => {
    setIsLoading(true);
    setError(null);
    setMusicData(null);

    try {
      console.log('🎵 Iniciando generación de música...', params);
      
      const result = await sharedTokenService.generateMusic(params);
      
      if (result.success) {
        setMusicData(result.data);
        console.log('✅ Música generada exitosamente');
        return result.data;
      } else {
        throw new Error(result.error || 'Error generando música');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error generando música';
      setError(errorMessage);
      console.error('❌ Error generando música:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const success = await sharedTokenService.forceRefresh();
      
      if (success) {
        const status = await sharedTokenService.getStatus();
        setTokenStatus(status);
        console.log('✅ Token refrescado exitosamente');
        return true;
      } else {
        throw new Error('Error refrescando token');
      }
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      setError('Error refrescando token');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sharedTokenService.logout();
    setTokenStatus(null);
    setMusicData(null);
    setError(null);
    console.log('👋 Usuario deslogueado');
  }, []);

  return {
    generateMusic,
    refreshToken,
    logout,
    isLoading,
    error,
    musicData,
    tokenStatus,
    hasValidToken: tokenStatus?.hasToken && !tokenStatus?.isExpired
  };
}

