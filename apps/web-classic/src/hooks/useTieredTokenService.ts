import { useState, useCallback, useEffect } from 'react';
import { tieredTokenService } from '../services/tieredTokenService';

interface MusicGenerationParams {
  prompt: string;
  style?: string;
  title?: string;
  customMode?: boolean;
  instrumental?: boolean;
  lyrics?: string;
  gender?: string;
}

export function useTieredTokenService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [musicData, setMusicData] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Verificar estado del token al cargar
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const currentStatus = await tieredTokenService.getStatus();
        setStatus(currentStatus);
      } catch (error) {
        console.error('Error verificando estado:', error);
      }
    };

    checkStatus();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateMusic = useCallback(async (params: MusicGenerationParams) => {
    setIsLoading(true);
    setError(null);
    setMusicData(null);

    try {
      console.log('🎵 Iniciando generación de música...', params);
      
      const result = await tieredTokenService.generateMusic(params);
      
      if (result.success) {
        setMusicData(result.data);
        console.log('✅ Música generada exitosamente');
        
        // Actualizar status después de generar
        const newStatus = await tieredTokenService.getStatus();
        setStatus(newStatus);
        
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

  const upgradeToPremium = useCallback(async (email: string) => {
    setIsUpgrading(true);
    setError(null);

    try {
      console.log('⬆️ Iniciando upgrade a premium...', email);
      
      const success = await tieredTokenService.upgradeToPremium(email);
      
      if (success) {
        console.log('✅ Upgrade a premium exitoso');
        
        // Actualizar status después del upgrade
        const newStatus = await tieredTokenService.getStatus();
        setStatus(newStatus);
        
        return true;
      } else {
        throw new Error('Error upgrading to premium');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error upgrading to premium';
      setError(errorMessage);
      console.error('❌ Error upgrading to premium:', err);
      return false;
    } finally {
      setIsUpgrading(false);
    }
  }, []);

  const logout = useCallback(() => {
    tieredTokenService.logout();
    setStatus(null);
    setMusicData(null);
    setError(null);
    console.log('👋 Usuario deslogueado');
  }, []);

  const getUpgradeMessage = useCallback(() => {
    if (!status) return '';
    
    if (status.tier === 'free') {
      const remaining = status.hourlyLimit - status.hourlyUsage;
      return `Tienes ${remaining} generaciones restantes esta hora. Upgrade a premium para 100 generaciones/hora.`;
    }
    
    return `Premium activo: ${status.hourlyUsage}/${status.hourlyLimit} generaciones usadas esta hora.`;
  }, [status]);

  const getStatusColor = useCallback(() => {
    if (!status) return 'gray';
    
    if (status.tier === 'premium') return 'green';
    if (status.canGenerate) return 'blue';
    return 'red';
  }, [status]);

  return {
    generateMusic,
    upgradeToPremium,
    logout,
    isLoading,
    isUpgrading,
    error,
    musicData,
    status,
    hasValidToken: status?.hasToken && !status?.isExpired,
    canGenerate: status?.canGenerate || false,
    tier: status?.tier || 'free',
    hourlyUsage: status?.hourlyUsage || 0,
    hourlyLimit: status?.hourlyLimit || 0,
    upgradeMessage: getUpgradeMessage(),
    statusColor: getStatusColor()
  };
}


