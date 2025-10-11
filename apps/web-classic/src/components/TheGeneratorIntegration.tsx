/**
 * 🎛️ INTEGRACIÓN THE GENERATOR CON PERILLAS LITERARIAS
 * 
 * Componente que integra generación de letras y prompts inteligentes
 */

import React, { useState } from 'react';
import PixelCharacterized from './PixelCharacterized';

interface TheGeneratorIntegrationProps {
  userId?: string;
  sessionId?: string;
  onLyricsGenerated?: (lyrics: any) => void;
  onPromptGenerated?: (prompt: string) => void;
}

export function TheGeneratorIntegration({ 
  userId, 
  sessionId, 
  onLyricsGenerated,
  onPromptGenerated 
}: TheGeneratorIntegrationProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('pop');
  const [genre, setGenre] = useState('mainstream');
  const [mood, setMood] = useState('energetic');
  const [structure, setStructure] = useState('verse-chorus');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [lyrics, setLyrics] = useState<any>(null);
  const [generatorPrompt, setGeneratorPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 📝 PERILLAS LITERARIAS
  const [literaryKnobs, setLiteraryKnobs] = useState({
    narrativeDepth: 70,
    emotionalIntensity: 80,
    poeticComplexity: 60,
    metaphorUsage: 70,
    rhymeDensity: 80,
    storyArc: 75,
    characterDevelopment: 65,
    thematicConsistency: 85
  });

  // 🎛️ GENERAR LETRAS CON ESTRUCTURA SÓLIDA
  const generateStructuredLyrics = async () => {
    if (!prompt.trim()) {
      setError('Por favor, escribe un prompt para generar letras');
      return;
    }

    setIsGeneratingLyrics(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/structured-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          literaryKnobs,
          structure: {
            type: structure
          },
          style,
          genre,
          mood,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const lyricsData = await response.json();
      setLyrics(lyricsData);

      if (onLyricsGenerated) {
        onLyricsGenerated(lyricsData);
      }
    } catch (error) {
      console.error('Error generating lyrics:', error);
      setError('Error al generar letras. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  // 🎛️ GENERAR PROMPT INTELIGENTE PARA THE GENERATOR
  const generateIntelligentPrompt = async () => {
    if (!prompt.trim()) {
      setError('Por favor, escribe un prompt para generar sugerencias');
      return;
    }

    setIsGeneratingPrompt(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/generator-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          genre,
          mood,
          creativityLevel: 'moderate',
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const promptData = await response.json();
      setGeneratorPrompt(promptData.enhancedPrompt);

      if (onPromptGenerated) {
        onPromptGenerated(promptData.enhancedPrompt);
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      setError('Error al generar el prompt. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // 🎛️ ACTUALIZAR PERILLA LITERARIA
  const updateLiteraryKnob = (knob: string, value: number) => {
    setLiteraryKnobs(prev => ({
      ...prev,
      [knob]: value
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* 🎛️ PANEL PRINCIPAL */}
      <div className="lg:col-span-2 space-y-6">
        {/* PROMPT Y CONFIGURACIÓN */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🎛️ The Generator</h3>
          
          <div className="space-y-4">
            {/* PROMPT */}
            <div>
              <label className="block text-sm font-medium mb-2">💭 Prompt Musical</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe la canción que quieres crear..."
                className="w-full h-24 bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* CONFIGURACIÓN BÁSICA */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">🎨 Estilo</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="electronic">Electrónico</option>
                  <option value="acoustic">Acústico</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="jazz">Jazz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">🎭 Género</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="mainstream">Mainstream</option>
                  <option value="alternative">Alternative</option>
                  <option value="indie">Indie</option>
                  <option value="underground">Underground</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">😊 Ánimo</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="energetic">Energético</option>
                  <option value="melancholic">Melancólico</option>
                  <option value="hopeful">Esperanzado</option>
                  <option value="rebellious">Rebelde</option>
                  <option value="romantic">Romántico</option>
                  <option value="mysterious">Misterioso</option>
                </select>
              </div>
            </div>

            {/* ESTRUCTURA */}
            <div>
              <label className="block text-sm font-medium mb-2">🏗️ Estructura</label>
              <select
                value={structure}
                onChange={(e) => setStructure(e.target.value)}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="verse-chorus">Verso → Coro</option>
                <option value="verse-prechorus-chorus">Verso → Pre-Coro → Coro</option>
                <option value="verse-chorus-bridge">Verso → Coro → Puente</option>
                <option value="intro-verse-chorus-bridge">Intro → Verso → Coro → Puente</option>
              </select>
            </div>
          </div>
        </div>

        {/* PERILLAS LITERARIAS */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📝 Perillas Literarias</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(literaryKnobs).map(([knob, value]) => (
              <div key={knob} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 capitalize">
                    {knob.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-blue-400 font-bold">{value}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => updateLiteraryKnob(knob, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOTONES DE GENERACIÓN */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={generateStructuredLyrics}
            disabled={isGeneratingLyrics || !prompt.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isGeneratingLyrics ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generando letras...</span>
              </div>
            ) : (
              '📝 Generar Letras'
            )}
          </button>

          <button
            onClick={generateIntelligentPrompt}
            disabled={isGeneratingPrompt || !prompt.trim()}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isGeneratingPrompt ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generando prompt...</span>
              </div>
            ) : (
              '🧠 Prompt Inteligente'
            )}
          </button>
        </div>

        {/* RESULTADOS */}
        {lyrics && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📝 Letras Generadas</h3>
            
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
                {lyrics.lyrics}
              </pre>
            </div>

            {/* ANÁLISIS LITERARIO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Profundidad Narrativa</div>
                <div className="text-lg font-bold text-blue-400">{lyrics.literaryAnalysis.narrativeDepth}/100</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Intensidad Emocional</div>
                <div className="text-lg font-bold text-red-400">{lyrics.literaryAnalysis.emotionalIntensity}/100</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Complejidad Poética</div>
                <div className="text-lg font-bold text-purple-400">{lyrics.literaryAnalysis.poeticComplexity}/100</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Densidad de Rimas</div>
                <div className="text-lg font-bold text-green-400">{lyrics.literaryAnalysis.rhymeDensity}/100</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(lyrics.lyrics)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                📋 Copiar Letras
              </button>
              <button
                onClick={() => setLyrics(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>
        )}

        {/* PROMPT GENERADO */}
        {generatorPrompt && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🎛️ Prompt Inteligente Generado</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <p className="text-white leading-relaxed">{generatorPrompt}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(generatorPrompt)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                📋 Copiar
              </button>
              <button
                onClick={() => setGeneratorPrompt('')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* 🤖 PIXEL CHARACTERIZED */}
      <div className="lg:col-span-1">
        <PixelCharacterized
          userId={userId}
          sessionId={sessionId}
          tool="the-generator"
          position="embedded"
          onSuggestionClick={(suggestion) => {
            if (suggestion.includes('letras') || suggestion.includes('generar')) {
              generateStructuredLyrics();
            } else if (suggestion.includes('prompt') || suggestion.includes('arreglo')) {
              generateIntelligentPrompt();
            }
          }}
        />
      </div>
    </div>
  );
}

export default TheGeneratorIntegration;
