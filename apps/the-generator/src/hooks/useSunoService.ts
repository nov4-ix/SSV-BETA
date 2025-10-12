/**
 * 🎵 SUNO SERVICE HOOK - INTEGRACIÓN CON SUNO
 * 
 * Hook para manejar la generación de música con Suno
 */

import { useState, useCallback } from 'react';
import { optimizePromptForSuno, SUNO_CONFIG } from '../config/sunoConfig';

interface SunoGenerationRequest {
  prompt: string;
  style?: string;
  title?: string;
  instrumental?: boolean;
  lyrics?: string;
  gender?: 'male' | 'female' | 'mixed';
}

interface SunoGenerationResponse {
  taskId: string;
  audioUrl?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export function useSunoService() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMusic = useCallback(async (request: SunoGenerationRequest): Promise<SunoGenerationResponse> => {
    setIsGenerating(true);
    setError(null);

    try {
      // 🚀 LLAMAR A LA FUNCIÓN DE NETLIFY PARA GENERACIÓN CON SUNO
      const response = await fetch('/.netlify/functions/suno-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: optimizePromptForSuno(request.prompt, request.style, request.gender, request.instrumental),
          style: request.style || 'pop',
          title: request.title || 'Generated Track',
          instrumental: request.instrumental || false,
          lyrics: request.lyrics,
          gender: request.gender || 'mixed',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          taskId: data.taskId,
          status: 'completed',
          audioUrl: data.audioUrl,
        };
      } else {
        throw new Error(data.error || 'Error generando música');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error generating music with Suno:', err);
      
      return {
        taskId: '',
        status: 'failed',
        error: errorMessage,
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/.netlify/functions/suno-health', {
        method: 'GET',
      });
      
      setIsConnected(response.ok);
      return response.ok;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  }, []);

  return {
    isGenerating,
    isConnected,
    error,
    generateMusic,
    checkConnection,
  };
}
