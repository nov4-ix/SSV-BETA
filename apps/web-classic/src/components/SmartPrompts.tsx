/**
 * 🧠 COMPONENTE DE PROMPTS INTELIGENTES
 * 
 * Mejora prompts musicales usando Qwen 2
 */

import React, { useState, useEffect } from 'react';
import { qwenService, SmartPromptRequest, SmartPromptResponse } from '../services/qwenService';

interface SmartPromptsProps {
  userId?: string;
  onPromptEnhanced?: (enhancedPrompt: string) => void;
  initialPrompt?: string;
}

export function SmartPrompts({ 
  userId, 
  onPromptEnhanced, 
  initialPrompt = '' 
}: SmartPromptsProps) {
  const [originalPrompt, setOriginalPrompt] = useState(initialPrompt);
  const [context, setContext] = useState<'music' | 'lyrics' | 'general'>('music');
  const [style, setStyle] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<SmartPromptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<SmartPromptResponse[]>([]);

  // 🧠 MEJORAR PROMPT
  const enhancePrompt = async () => {
    if (!originalPrompt.trim()) {
      setError('Por favor, escribe un prompt para mejorar');
      return;
    }

    setIsEnhancing(true);
    setError(null);

    try {
      const request: SmartPromptRequest = {
        originalPrompt,
        context,
        style: style || undefined,
        genre: genre || undefined,
        mood: mood || undefined,
        userId
      };

      const response = await qwenService.generateSmartPrompt(request);
      setEnhancedPrompt(response);
      
      // Agregar al historial
      setPromptHistory(prev => [response, ...prev.slice(0, 4)]);
      
      if (onPromptEnhanced) {
        onPromptEnhanced(response.enhancedPrompt);
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      setError('Error al mejorar el prompt. Inténtalo de nuevo.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // 🎯 PROMPTS DE EJEMPLO
  const examplePrompts = [
    {
      prompt: 'música triste',
      context: 'music' as const,
      description: 'Prompt básico que necesita más detalle'
    },
    {
      prompt: 'canción de amor',
      context: 'lyrics' as const,
      description: 'Prompt genérico para letras'
    },
    {
      prompt: 'beat electrónico',
      context: 'music' as const,
      description: 'Prompt técnico simple'
    },
    {
      prompt: 'balada acústica',
      context: 'general' as const,
      description: 'Prompt de estilo musical'
    }
  ];

  // 🎨 CONTEXTOS
  const contexts = [
    { value: 'music', label: '🎵 Música', description: 'Para generación musical' },
    { value: 'lyrics', label: '📝 Letras', description: 'Para composición lírica' },
    { value: 'general', label: '💬 General', description: 'Para uso general' }
  ];

  // 🎭 ESTILOS MUSICALES
  const musicalStyles = [
    'Rock', 'Pop', 'Electronic', 'Hip-Hop', 'Jazz', 'Blues', 
    'Classical', 'Reggae', 'Folk', 'Country', 'R&B', 'Funk'
  ];

  // 🎨 GÉNEROS
  const genres = [
    'Alternative', 'Indie', 'Mainstream', 'Underground', 
    'Experimental', 'Classic', 'Modern', 'Vintage'
  ];

  // 😊 ESTADOS DE ÁNIMO
  const moods = [
    'Energetic', 'Melancholic', 'Hopeful', 'Rebellious', 
    'Romantic', 'Mysterious', 'Peaceful', 'Dramatic'
  ];

  // 📋 USAR PROMPT DEL HISTORIAL
  const useFromHistory = (prompt: SmartPromptResponse) => {
    setOriginalPrompt(prompt.enhancedPrompt);
    setEnhancedPrompt(null);
  };

  // 📋 COPIAR PROMPT
  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">🧠 Prompts Inteligentes</h2>
        <p className="text-gray-400">
          Mejora tus prompts musicales con IA. Pixel te ayudará a crear descripciones más efectivas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🎯 ENTRADA */}
        <div className="space-y-6">
          {/* PROMPT ORIGINAL */}
          <div>
            <label className="block text-sm font-medium mb-2">💭 Prompt Original</label>
            <textarea
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              placeholder="Escribe tu prompt musical aquí..."
              className="w-full h-32 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* CONFIGURACIÓN */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">🎯 Contexto</label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value as any)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {contexts.map((ctx) => (
                  <option key={ctx.value} value={ctx.value}>
                    {ctx.label} - {ctx.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">🎨 Estilo</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">Cualquiera</option>
                  {musicalStyles.map((musicalStyle) => (
                    <option key={musicalStyle} value={musicalStyle}>
                      {musicalStyle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">🎭 Género</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">Cualquiera</option>
                  {genres.map((genreOption) => (
                    <option key={genreOption} value={genreOption}>
                      {genreOption}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">😊 Ánimo</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">Cualquiera</option>
                  {moods.map((moodOption) => (
                    <option key={moodOption} value={moodOption}>
                      {moodOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PROMPTS DE EJEMPLO */}
          <div>
            <label className="block text-sm font-medium mb-2">🎯 Ejemplos</label>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setOriginalPrompt(example.prompt);
                    setContext(example.context);
                  }}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <div className="font-medium">{example.prompt}</div>
                  <div className="text-xs text-gray-400">{example.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* BOTÓN DE MEJORA */}
          <button
            onClick={enhancePrompt}
            disabled={isEnhancing || !originalPrompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isEnhancing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mejorando prompt...</span>
              </div>
            ) : (
              '🧠 Mejorar Prompt'
            )}
          </button>
        </div>

        {/* 🎯 RESULTADO */}
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

          {/* PROMPT MEJORADO */}
          {enhancedPrompt && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">✨ Prompt Mejorado</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyPrompt(enhancedPrompt.enhancedPrompt)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    📋 Copiar
                  </button>
                  <button
                    onClick={() => setOriginalPrompt(enhancedPrompt.enhancedPrompt)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    🔄 Usar
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <p className="text-white leading-relaxed">
                  {enhancedPrompt.enhancedPrompt}
                </p>
              </div>

              {/* CONFIANZA */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Confianza</span>
                  <span className="text-sm font-bold text-green-400">
                    {Math.round(enhancedPrompt.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${enhancedPrompt.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* MEJORAS */}
              {enhancedPrompt.improvements && enhancedPrompt.improvements.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold mb-2">🔧 Mejoras Aplicadas</h4>
                  <ul className="space-y-1">
                    {enhancedPrompt.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ALTERNATIVAS */}
              {enhancedPrompt.alternatives && enhancedPrompt.alternatives.length > 0 && (
                <div>
                  <h4 className="font-bold mb-2">🔄 Alternativas</h4>
                  <div className="space-y-2">
                    {enhancedPrompt.alternatives.map((alternative, index) => (
                      <button
                        key={index}
                        onClick={() => setOriginalPrompt(alternative)}
                        className="w-full text-left bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        {alternative}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HISTORIAL */}
          {promptHistory.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-bold mb-4">📚 Historial Reciente</h4>
              <div className="space-y-3">
                {promptHistory.map((prompt, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Confianza: {Math.round(prompt.confidence * 100)}%
                      </span>
                      <button
                        onClick={() => useFromHistory(prompt)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Usar
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {prompt.enhancedPrompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SmartPrompts;