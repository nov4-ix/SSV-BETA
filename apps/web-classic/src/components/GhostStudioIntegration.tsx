/**
 * 🎵 INTEGRACIÓN GHOST STUDIO CON ANÁLISIS DE AUDIO
 * 
 * Componente que integra análisis de pistas y prompts inteligentes
 */

import React, { useState, useRef } from 'react';
import PixelCharacterized from './PixelCharacterized';

interface GhostStudioIntegrationProps {
  userId?: string;
  sessionId?: string;
  onAnalysisComplete?: (analysis: any) => void;
  onPromptGenerated?: (prompt: string) => void;
}

export function GhostStudioIntegration({ 
  userId, 
  sessionId, 
  onAnalysisComplete,
  onPromptGenerated 
}: GhostStudioIntegrationProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [arrangementPrompt, setArrangementPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🎵 ANALIZAR PISTA DE AUDIO
  const analyzeAudio = async () => {
    if (!audioFile) {
      setError('Por favor, selecciona un archivo de audio');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convertir archivo a base64
      const base64 = await fileToBase64(audioFile);

      const response = await fetch('/netlify/functions/analyze-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioFile: base64,
          fileName: audioFile.name,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const analysisData = await response.json();
      setAnalysis(analysisData);

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData);
      }
    } catch (error) {
      console.error('Error analyzing audio:', error);
      setError('Error al analizar la pista. Inténtalo de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 🎼 GENERAR PROMPT DE ARREGLO
  const generateArrangementPrompt = async () => {
    if (!analysis) {
      setError('Primero analiza una pista de audio');
      return;
    }

    setIsGeneratingPrompt(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/arrangement-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioAnalysis: analysis,
          creativityLevel: 'moderate',
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const promptData = await response.json();
      setArrangementPrompt(promptData.enhancedPrompt);

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

  // 🔄 CONVERTIR ARCHIVO A BASE64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remover el prefijo data:audio/...
      };
      reader.onerror = error => reject(error);
    });
  };

  // 📁 MANEJAR SELECCIÓN DE ARCHIVO
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* 🎵 PANEL PRINCIPAL */}
      <div className="lg:col-span-2 space-y-6">
        {/* SUBIR ARCHIVO */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🎵 Análisis de Pista</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Seleccionar archivo de audio</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors"
              >
                {audioFile ? audioFile.name : '📁 Seleccionar archivo de audio'}
              </button>
            </div>

            {audioFile && (
              <div className="flex space-x-2">
                <button
                  onClick={analyzeAudio}
                  disabled={isAnalyzing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analizando...</span>
                    </div>
                  ) : (
                    '🔍 Analizar Pista'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RESULTADOS DEL ANÁLISIS */}
        {analysis && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📊 Resultados del Análisis</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">BPM</div>
                <div className="text-2xl font-bold text-blue-400">{analysis.bpm}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Tonalidad</div>
                <div className="text-lg font-bold text-green-400">{analysis.key}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Energía</div>
                <div className="text-lg font-bold text-yellow-400">{analysis.energy}/100</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-sm text-gray-400">Ánimo</div>
                <div className="text-lg font-bold text-purple-400 capitalize">{analysis.mood}</div>
              </div>
            </div>

            {/* GÉNEROS DETECTADOS */}
            <div className="mb-6">
              <h4 className="font-bold mb-2">🎭 Géneros Detectados</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.genres.map((genre: any, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name} ({Math.round(genre.confidence * 100)}%)
                  </span>
                ))}
              </div>
            </div>

            {/* SUGERENCIAS */}
            {analysis.suggestions && (
              <div className="mb-6">
                <h4 className="font-bold mb-2">💡 Sugerencias</h4>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* BOTÓN DE PROMPT INTELIGENTE */}
            <button
              onClick={generateArrangementPrompt}
              disabled={isGeneratingPrompt}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isGeneratingPrompt ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generando prompt inteligente...</span>
                </div>
              ) : (
                '🧠 Generar Prompt Inteligente'
              )}
            </button>
          </div>
        )}

        {/* PROMPT GENERADO */}
        {arrangementPrompt && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🎼 Prompt de Arreglo Generado</h3>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <p className="text-white leading-relaxed">{arrangementPrompt}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(arrangementPrompt)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                📋 Copiar
              </button>
              <button
                onClick={() => setArrangementPrompt('')}
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
          tool="ghost-studio"
          position="embedded"
          onSuggestionClick={(suggestion) => {
            if (suggestion.includes('analizar') || suggestion.includes('BPM')) {
              analyzeAudio();
            } else if (suggestion.includes('prompt') || suggestion.includes('arreglo')) {
              generateArrangementPrompt();
            }
          }}
        />
      </div>
    </div>
  );
}

export default GhostStudioIntegration;
