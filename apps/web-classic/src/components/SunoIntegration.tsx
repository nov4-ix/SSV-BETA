/**
 * 🎵 COMPONENTE DE INTEGRACIÓN CON SUNO
 * 
 * Integra la generación musical con Suno usando traducción automática
 */

import React, { useState, useEffect } from 'react';
import { qwenService } from '../services/qwenService';

interface SunoIntegrationProps {
  userId?: string;
  onMusicGenerated?: (musicData: any) => void;
  initialPrompt?: string;
}

interface SunoRequest {
  prompt: string;
  style?: string;
  genre?: string;
  mood?: string;
  duration?: number;
  userId?: string;
}

interface SunoResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  metadata?: {
    duration: number;
    style: string;
    genre: string;
    mood: string;
  };
  error?: string;
}

export function SunoIntegration({ 
  userId, 
  onMusicGenerated, 
  initialPrompt = '' 
}: SunoIntegrationProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState('rock');
  const [genre, setGenre] = useState('alternative');
  const [mood, setMood] = useState('energetic');
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedPrompt, setTranslatedPrompt] = useState('');
  const [sunoResponse, setSunoResponse] = useState<SunoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // 🌐 TRADUCIR PROMPT A INGLÉS
  const translatePrompt = async (spanishPrompt: string) => {
    setIsTranslating(true);
    setError(null);

    try {
      const response = await qwenService.translateText({
        text: spanishPrompt,
        sourceLanguage: 'es',
        targetLanguage: 'en',
        context: 'music',
        preserveFormatting: true
      });

      setTranslatedPrompt(response.translatedText);
      return response.translatedText;
    } catch (error) {
      console.error('Error translating prompt:', error);
      setError('Error al traducir el prompt. Inténtalo de nuevo.');
      return spanishPrompt; // Fallback al prompt original
    } finally {
      setIsTranslating(false);
    }
  };

  // 🎵 GENERAR MÚSICA CON SUNO
  const generateMusic = async () => {
    if (!prompt.trim()) {
      setError('Por favor, escribe un prompt para generar música');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSunoResponse(null);

    try {
      // Traducir prompt si está en español
      let finalPrompt = prompt;
      if (isSpanishPrompt(prompt)) {
        finalPrompt = await translatePrompt(prompt);
      }

      const request: SunoRequest = {
        prompt: finalPrompt,
        style,
        genre,
        mood,
        duration,
        userId
      };

      // Simular llamada a Suno (reemplazar con API real)
      const response = await callSunoAPI(request);
      setSunoResponse(response);

      // Iniciar polling si está pendiente
      if (response.status === 'pending' || response.status === 'processing') {
        startPolling(response.taskId);
      }

      if (onMusicGenerated) {
        onMusicGenerated(response);
      }
    } catch (error) {
      console.error('Error generating music:', error);
      setError('Error al generar música. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 🔍 DETECTAR SI EL PROMPT ESTÁ EN ESPAÑOL
  const isSpanishPrompt = (text: string): boolean => {
    const spanishWords = ['una', 'canción', 'música', 'sobre', 'con', 'para', 'que', 'del', 'de', 'la', 'el', 'en', 'es', 'son'];
    const words = text.toLowerCase().split(' ');
    const spanishWordCount = words.filter(word => spanishWords.includes(word)).length;
    return spanishWordCount > 0;
  };

  // 🎵 LLAMAR A LA API DE SUNO (SIMULADA)
  const callSunoAPI = async (request: SunoRequest): Promise<SunoResponse> => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular respuesta de Suno
    return {
      taskId: `suno_${Date.now()}`,
      status: 'pending',
      metadata: {
        duration: request.duration,
        style: request.style,
        genre: request.genre,
        mood: request.mood
      }
    };
  };

  // 🔄 POLLING PARA ESTADO DE GENERACIÓN
  const startPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await checkSunoStatus(taskId);
        setSunoResponse(prev => prev ? { ...prev, ...status } : status);
        
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 3000);
    
    setPollingInterval(interval);
  };

  // 🔍 VERIFICAR ESTADO DE SUNO
  const checkSunoStatus = async (taskId: string): Promise<Partial<SunoResponse>> => {
    // Simular verificación de estado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular progreso aleatorio
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    if (randomStatus === 'completed') {
      return {
        status: 'completed',
        audioUrl: `https://example.com/audio/${taskId}.mp3`
      };
    } else if (randomStatus === 'failed') {
      return {
        status: 'failed',
        error: 'Error en la generación de música'
      };
    }
    
    return { status: randomStatus as any };
  };

  // 🧹 LIMPIAR POLLING
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // 🎯 PROMPTS PREDEFINIDOS
  const predefinedPrompts = [
    'Una canción de rock energética sobre la libertad',
    'Una balada melancólica sobre el amor perdido',
    'Una canción electrónica futurista sobre la tecnología',
    'Una canción de esperanza para tiempos difíciles',
    'Una canción de resistencia contra el sistema',
    'Una canción romántica acústica'
  ];

  // 🎨 ESTILOS MUSICALES
  const musicalStyles = [
    { value: 'rock', label: '🎸 Rock', description: 'Energía y rebeldía' },
    { value: 'pop', label: '🎤 Pop', description: 'Catchy y comercial' },
    { value: 'electronic', label: '🎛️ Electrónico', description: 'Futurista y sintético' },
    { value: 'acoustic', label: '🎵 Acústico', description: 'Íntimo y orgánico' },
    { value: 'hip-hop', label: '🎤 Hip-Hop', description: 'Rítmico y urbano' },
    { value: 'jazz', label: '🎷 Jazz', description: 'Improvisado y sofisticado' }
  ];

  // 🎭 GÉNEROS
  const genres = [
    { value: 'alternative', label: 'Alternative', description: 'Indie y experimental' },
    { value: 'mainstream', label: 'Mainstream', description: 'Popular y comercial' },
    { value: 'underground', label: 'Underground', description: 'Subterráneo y rebelde' },
    { value: 'experimental', label: 'Experimental', description: 'Innovador y vanguardista' }
  ];

  // 😊 ESTADOS DE ÁNIMO
  const moods = [
    { value: 'energetic', label: '⚡ Energético', description: 'Alto nivel de energía' },
    { value: 'melancholic', label: '😢 Melancólico', description: 'Tristeza y nostalgia' },
    { value: 'hopeful', label: '🌟 Esperanzado', description: 'Optimismo y fe' },
    { value: 'rebellious', label: '🔥 Rebelde', description: 'Desafío y resistencia' },
    { value: 'romantic', label: '💕 Romántico', description: 'Amor y pasión' },
    { value: 'mysterious', label: '🌙 Misterioso', description: 'Intriga y misterio' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">🎵 Generador Musical Suno</h2>
        <p className="text-gray-400">
          Genera música con Suno usando traducción automática. Escribe en español y se traducirá automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🎯 CONFIGURACIÓN */}
        <div className="space-y-6">
          {/* PROMPT */}
          <div>
            <label className="block text-sm font-medium mb-2">💭 Prompt Musical</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe la música que quieres crear..."
              className="w-full h-24 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* PROMPT TRADUCIDO */}
          {translatedPrompt && (
            <div>
              <label className="block text-sm font-medium mb-2">🌐 Prompt Traducido</label>
              <div className="bg-gray-800 text-gray-300 px-4 py-3 rounded-lg border border-gray-600">
                {translatedPrompt}
              </div>
            </div>
          )}

          {/* CONFIGURACIONES */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">🎨 Estilo</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {musicalStyles.map((musicalStyle) => (
                  <option key={musicalStyle.value} value={musicalStyle.value}>
                    {musicalStyle.label} - {musicalStyle.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">🎭 Género</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {genres.map((genreOption) => (
                  <option key={genreOption.value} value={genreOption.value}>
                    {genreOption.label} - {genreOption.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">😊 Ánimo</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {moods.map((moodOption) => (
                  <option key={moodOption.value} value={moodOption.value}>
                    {moodOption.label} - {moodOption.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">⏱️ Duración (seg)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value={15}>15 segundos</option>
                <option value={30}>30 segundos</option>
                <option value={60}>1 minuto</option>
                <option value={120}>2 minutos</option>
              </select>
            </div>
          </div>

          {/* PROMPTS PREDEFINIDOS */}
          <div>
            <label className="block text-sm font-medium mb-2">🎯 Ejemplos</label>
            <div className="space-y-2">
              {predefinedPrompts.map((predefinedPrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(predefinedPrompt)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  {predefinedPrompt}
                </button>
              ))}
            </div>
          </div>

          {/* BOTÓN DE GENERACIÓN */}
          <button
            onClick={generateMusic}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generando música...</span>
              </div>
            ) : (
              '🎵 Generar Música'
            )}
          </button>
        </div>

        {/* 🎵 RESULTADO */}
        <div className="space-y-6">
          {/* ERROR */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* ESTADO DE GENERACIÓN */}
          {sunoResponse && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">🎵 Estado de Generación</h3>
                <div className="flex items-center space-x-2">
                  {sunoResponse.status === 'pending' && (
                    <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm">
                      ⏳ Pendiente
                    </span>
                  )}
                  {sunoResponse.status === 'processing' && (
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      🔄 Procesando
                    </span>
                  )}
                  {sunoResponse.status === 'completed' && (
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      ✅ Completado
                    </span>
                  )}
                  {sunoResponse.status === 'failed' && (
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                      ❌ Error
                    </span>
                  )}
                </div>
              </div>

              {/* METADATOS */}
              {sunoResponse.metadata && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Duración</div>
                    <div className="font-bold">{sunoResponse.metadata.duration}s</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Estilo</div>
                    <div className="font-bold">{sunoResponse.metadata.style}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Género</div>
                    <div className="font-bold">{sunoResponse.metadata.genre}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Ánimo</div>
                    <div className="font-bold">{sunoResponse.metadata.mood}</div>
                  </div>
                </div>
              )}

              {/* AUDIO PLAYER */}
              {sunoResponse.status === 'completed' && sunoResponse.audioUrl && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold mb-2">🎵 Música Generada</h4>
                  <audio controls className="w-full">
                    <source src={sunoResponse.audioUrl} type="audio/mpeg" />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => window.open(sunoResponse.audioUrl, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      🔗 Abrir en nueva pestaña
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(sunoResponse.audioUrl || '')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      📋 Copiar URL
                    </button>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {sunoResponse.status === 'failed' && sunoResponse.error && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span>❌</span>
                    <span>{sunoResponse.error}</span>
                  </div>
                </div>
              )}

              {/* PROGRESO */}
              {(sunoResponse.status === 'pending' || sunoResponse.status === 'processing') && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Generando música...</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SunoIntegration;
