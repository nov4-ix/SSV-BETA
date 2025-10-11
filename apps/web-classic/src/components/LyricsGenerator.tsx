/**
 * 🎵 COMPONENTE GENERADOR DE LETRAS
 * 
 * Genera letras con coherencia narrativa usando Qwen 2
 */

import React, { useState, useEffect } from 'react';
import { qwenService, LyricsRequest, LyricsResponse } from '../services/qwenService';

interface LyricsGeneratorProps {
  userId?: string;
  onLyricsGenerated?: (lyrics: LyricsResponse) => void;
  onTranslateToEnglish?: (lyrics: string) => void;
}

export function LyricsGenerator({ 
  userId, 
  onLyricsGenerated, 
  onTranslateToEnglish 
}: LyricsGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('rock');
  const [genre, setGenre] = useState('alternative');
  const [mood, setMood] = useState('energetic');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // 🎵 GENERAR LETRAS
  const generateLyrics = async () => {
    if (!prompt.trim()) {
      setError('Por favor, escribe un prompt para generar letras');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: LyricsRequest = {
        prompt,
        style,
        genre,
        mood,
        language,
        length,
        userId
      };

      const response = await qwenService.generateLyrics(request);
      setLyrics(response);
      
      if (onLyricsGenerated) {
        onLyricsGenerated(response);
      }
    } catch (error) {
      console.error('Error generating lyrics:', error);
      setError('Error al generar letras. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 🌐 TRADUCIR A INGLÉS
  const translateToEnglish = async () => {
    if (!lyrics?.lyrics) return;

    setIsTranslating(true);
    setError(null);

    try {
      const response = await qwenService.translateText({
        text: lyrics.lyrics,
        sourceLanguage: 'es',
        targetLanguage: 'en',
        context: 'music',
        preserveFormatting: true
      });

      if (onTranslateToEnglish) {
        onTranslateToEnglish(response.translatedText);
      }
    } catch (error) {
      console.error('Error translating lyrics:', error);
      setError('Error al traducir letras. Inténtalo de nuevo.');
    } finally {
      setIsTranslating(false);
    }
  };

  // 🎯 PROMPTS PREDEFINIDOS
  const predefinedPrompts = [
    'Una canción sobre la resistencia y la lucha por la libertad',
    'Una balada sobre el amor perdido y la nostalgia',
    'Una canción de esperanza para tiempos difíciles',
    'Una canción sobre la tecnología y el futuro',
    'Una canción sobre la naturaleza y la conexión espiritual',
    'Una canción sobre la creatividad y la inspiración'
  ];

  // 🎨 ESTILOS MUSICALES
  const musicalStyles = [
    { value: 'rock', label: '🎸 Rock', description: 'Energía y rebeldía' },
    { value: 'pop', label: '🎤 Pop', description: 'Catchy y comercial' },
    { value: 'electronic', label: '🎛️ Electrónico', description: 'Futurista y sintético' },
    { value: 'acoustic', label: '🎵 Acústico', description: 'Íntimo y orgánico' },
    { value: 'hip-hop', label: '🎤 Hip-Hop', description: 'Rítmico y urbano' },
    { value: 'jazz', label: '🎷 Jazz', description: 'Improvisado y sofisticado' },
    { value: 'blues', label: '🎸 Blues', description: 'Emocional y profundo' },
    { value: 'reggae', label: '🌴 Reggae', description: 'Relajado y espiritual' }
  ];

  // 🎭 GÉNEROS MUSICALES
  const musicalGenres = [
    { value: 'alternative', label: 'Alternative', description: 'Indie y experimental' },
    { value: 'indie', label: 'Indie', description: 'Independiente y auténtico' },
    { value: 'mainstream', label: 'Mainstream', description: 'Popular y comercial' },
    { value: 'underground', label: 'Underground', description: 'Subterráneo y rebelde' },
    { value: 'experimental', label: 'Experimental', description: 'Innovador y vanguardista' },
    { value: 'classic', label: 'Clásico', description: 'Atemporal y elegante' }
  ];

  // 😊 ESTADOS DE ÁNIMO
  const moods = [
    { value: 'energetic', label: '⚡ Energético', description: 'Alto nivel de energía' },
    { value: 'melancholic', label: '😢 Melancólico', description: 'Tristeza y nostalgia' },
    { value: 'hopeful', label: '🌟 Esperanzado', description: 'Optimismo y fe' },
    { value: 'rebellious', label: '🔥 Rebelde', description: 'Desafío y resistencia' },
    { value: 'romantic', label: '💕 Romántico', description: 'Amor y pasión' },
    { value: 'mysterious', label: '🌙 Misterioso', description: 'Intriga y misterio' },
    { value: 'peaceful', label: '🕊️ Pacífico', description: 'Tranquilidad y calma' },
    { value: 'dramatic', label: '🎭 Dramático', description: 'Intensidad emocional' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">🎵 Generador de Letras</h2>
        <p className="text-gray-400">
          Crea letras con coherencia narrativa usando IA. Pixel te ayudará a darle vida a tus ideas musicales.
        </p>
      </div>

      {/* 🎯 CONFIGURACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* PROMPT */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">💭 Prompt Principal</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe la canción que quieres crear..."
              className="w-full h-24 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* PROMPTS PREDEFINIDOS */}
          <div>
            <label className="block text-sm font-medium mb-2">🎯 Prompts Sugeridos</label>
            <div className="grid grid-cols-1 gap-2">
              {predefinedPrompts.map((predefinedPrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(predefinedPrompt)}
                  className="text-left bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  {predefinedPrompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONFIGURACIONES */}
        <div className="space-y-4">
          {/* ESTILO */}
          <div>
            <label className="block text-sm font-medium mb-2">🎨 Estilo Musical</label>
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

          {/* GÉNERO */}
          <div>
            <label className="block text-sm font-medium mb-2">🎭 Género</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {musicalGenres.map((musicalGenre) => (
                <option key={musicalGenre.value} value={musicalGenre.value}>
                  {musicalGenre.label} - {musicalGenre.description}
                </option>
              ))}
            </select>
          </div>

          {/* ESTADO DE ÁNIMO */}
          <div>
            <label className="block text-sm font-medium mb-2">😊 Estado de Ánimo</label>
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

          {/* IDIOMA Y LONGITUD */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">🌐 Idioma</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="es">🇪🇸 Español</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">📏 Longitud</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'long')}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="short">Corta (1-2 min)</option>
                <option value="medium">Media (3-4 min)</option>
                <option value="long">Larga (5+ min)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 🎵 BOTÓN DE GENERACIÓN */}
      <div className="text-center mb-8">
        <button
          onClick={generateLyrics}
          disabled={isGenerating || !prompt.trim()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generando letras...</span>
            </div>
          ) : (
            '🎵 Generar Letras'
          )}
        </button>
      </div>

      {/* ❌ ERROR */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 🎵 RESULTADO */}
      {lyrics && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">🎵 Letras Generadas</h3>
            <div className="flex space-x-2">
              {language === 'es' && (
                <button
                  onClick={translateToEnglish}
                  disabled={isTranslating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {isTranslating ? '🌐 Traduciendo...' : '🌐 Traducir a Inglés'}
                </button>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(lyrics.lyrics)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                📋 Copiar
              </button>
            </div>
          </div>

          {/* LETRAS */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
              {lyrics.lyrics}
            </pre>
          </div>

          {/* METADATOS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">Estructura</div>
              <div className="font-bold">
                {lyrics.structure.verses} versos, {lyrics.structure.chorus} coros
                {lyrics.structure.bridge && `, ${lyrics.structure.bridge} puente`}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">Palabras</div>
              <div className="font-bold">{lyrics.metadata.wordCount}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">Coherencia</div>
              <div className="font-bold">{Math.round(lyrics.metadata.coherence * 100)}%</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">Creatividad</div>
              <div className="font-bold">{Math.round(lyrics.metadata.creativity * 100)}%</div>
            </div>
          </div>

          {/* SUGERENCIAS */}
          {lyrics.suggestions && lyrics.suggestions.length > 0 && (
            <div>
              <h4 className="font-bold mb-2">💡 Sugerencias de Mejora</h4>
              <ul className="space-y-1">
                {lyrics.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LyricsGenerator;