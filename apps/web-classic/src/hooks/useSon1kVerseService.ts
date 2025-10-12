// src/hooks/useSon1kVerseService.ts

import { useState, useCallback } from 'react';
import { 
  Son1kVerseService, 
  SunoGenerateRequest, 
  PixelAssistantRequest,
  QwenLyricsRequest 
} from '../services/son1kVerseService';

export interface UseSon1kVerseServiceReturn {
  // Estado
  loading: boolean;
  error: string | null;
  result: any;
  
  // Servicios
  music: {
    generate: (params: SunoGenerateRequest) => Promise<any>;
    checkHealth: () => Promise<boolean>;
  };
  pixel: {
    interact: (params: PixelAssistantRequest) => Promise<any>;
  };
  lyrics: {
    generate: (params: QwenLyricsRequest) => Promise<any>;
    translate: (text: string, source?: string, target?: string) => Promise<any>;
  };
  prompts: {
    optimize: (prompt: string, context?: string) => Promise<any>;
    generateSmart: (prompt: string, context?: string) => Promise<any>;
  };
  sanctuary: {
    sendMessage: (message: string, userId?: string) => Promise<any>;
  };
  nova: {
    generateContent: (prompt: string, platform?: string) => Promise<any>;
  };
  analysis: {
    analyzeAudio: (audioUrl: string) => Promise<any>;
  };
  
  // Utilidades
  checkAllServices: () => Promise<any>;
  clearError: () => void;
  clearResult: () => void;
}

export function useSon1kVerseService(): UseSon1kVerseServiceReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleServiceCall = useCallback(async <T>(
    serviceCall: () => Promise<T>,
    setResultData?: (data: T) => void
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await serviceCall();
      
      if (setResultData) {
        setResultData(response);
      }
      
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error en el servicio';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const music = {
    generate: useCallback(async (params: SunoGenerateRequest) => {
      return handleServiceCall(
        () => Son1kVerseService.music.generateMusic(params),
        (data) => setResult(data)
      );
    }, [handleServiceCall]),

    checkHealth: useCallback(async () => {
      const response = await Son1kVerseService.music.checkHealth();
      return response.success && response.data?.connected;
    }, [])
  };

  const pixel = {
    interact: useCallback(async (params: PixelAssistantRequest) => {
      return handleServiceCall(
        () => Son1kVerseService.pixel.interact(params),
        (data) => setResult(data)
      );
    }, [handleServiceCall])
  };

  const lyrics = {
    generate: useCallback(async (params: QwenLyricsRequest) => {
      return handleServiceCall(
        () => Son1kVerseService.lyrics.generateLyrics(params),
        (data) => setResult(data)
      );
    }, [handleServiceCall]),

    translate: useCallback(async (text: string, source = 'es', target = 'en') => {
      return handleServiceCall(
        () => Son1kVerseService.lyrics.translateForSuno(text, source, target),
        (data) => setResult(data)
      );
    }, [handleServiceCall])
  };

  const prompts = {
    optimize: useCallback(async (prompt: string, context = 'music') => {
      return handleServiceCall(
        () => Son1kVerseService.prompts.optimizePrompt(prompt, context),
        (data) => setResult(data)
      );
    }, [handleServiceCall]),

    generateSmart: useCallback(async (prompt: string, context = 'music') => {
      return handleServiceCall(
        () => Son1kVerseService.prompts.generateSmartPrompts(prompt, context),
        (data) => setResult(data)
      );
    }, [handleServiceCall])
  };

  const sanctuary = {
    sendMessage: useCallback(async (message: string, userId?: string) => {
      return handleServiceCall(
        () => Son1kVerseService.sanctuary.sendMessage(message, userId),
        (data) => setResult(data)
      );
    }, [handleServiceCall])
  };

  const nova = {
    generateContent: useCallback(async (prompt: string, platform = 'instagram') => {
      return handleServiceCall(
        () => Son1kVerseService.nova.generateSocialContent(prompt, platform),
        (data) => setResult(data)
      );
    }, [handleServiceCall])
  };

  const analysis = {
    analyzeAudio: useCallback(async (audioUrl: string) => {
      return handleServiceCall(
        () => Son1kVerseService.analysis.analyzeAudio(audioUrl),
        (data) => setResult(data)
      );
    }, [handleServiceCall])
  };

  const checkAllServices = useCallback(async () => {
    return handleServiceCall(
      () => Son1kVerseService.checkAllServices(),
      (data) => setResult(data)
    );
  }, [handleServiceCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    // Estado
    loading,
    error,
    result,
    
    // Servicios
    music,
    pixel,
    lyrics,
    prompts,
    sanctuary,
    nova,
    analysis,
    
    // Utilidades
    checkAllServices,
    clearError,
    clearResult
  };
}
