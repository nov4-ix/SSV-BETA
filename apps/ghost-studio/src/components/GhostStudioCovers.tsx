/**
 * 🎛️ GHOST STUDIO - Suno Covers Integration
 * 
 * Interfaz para crear covers profesionales usando Suno Covers
 * Flujo: Maqueta → Análisis → Prompt → Suno Covers → Arreglo Profesional
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackAnalysis {
  bpm: number;
  key: string;
  genre: string[];
  energy: number;
  mood: string;
  tempo: 'slow' | 'medium' | 'fast';
  complexity: 'simple' | 'moderate' | 'complex';
}

interface ArrangementParams {
  expressiveness: number; // 0-100
  trash: number;          // 0-100 (raw/garage sound)
  garage: number;        // 0-100 (lo-fi/underground)
  rarity: number;        // 0-100 (unique/unusual elements)
}

interface CoverRequest {
  originalTrack: File;
  analysis: TrackAnalysis;
  userPrompt: string;
  arrangementParams: ArrangementParams;
  generatedPrompt: string;
}

export const GhostStudio: React.FC = () => {
  const [originalTrack, setOriginalTrack] = useState<File | null>(null);
  const [recordedTrack, setRecordedTrack] = useState<Blob | null>(null);
  const [analysis, setAnalysis] = useState<TrackAnalysis | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [arrangementParams, setArrangementParams] = useState<ArrangementParams>({
    expressiveness: 50,
    trash: 20,
    garage: 30,
    rarity: 40
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeMode, setActiveMode] = useState<'upload' | 'record'>('upload');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [coverResult, setCoverResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Función para analizar tanto archivos como grabaciones
  const analyzeTrack = async (audioSource: File | Blob) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Simular análisis de audio (en producción usarías Web Audio API o backend)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAnalysis: TrackAnalysis = {
        bpm: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
        key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)] + 
             ['', 'm'][Math.floor(Math.random() * 2)] + 
             ['', '#', 'b'][Math.floor(Math.random() * 3)],
        genre: ['Pop', 'Rock', 'Electronic', 'Hip-Hop', 'Jazz', 'Folk'].slice(0, Math.floor(Math.random() * 3) + 1),
        energy: Math.floor(Math.random() * 40) + 60, // 60-100
        mood: ['Happy', 'Melancholic', 'Energetic', 'Calm', 'Aggressive'][Math.floor(Math.random() * 5)],
        tempo: ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)] as any,
        complexity: ['simple', 'moderate', 'complex'][Math.floor(Math.random() * 3)] as any
      };

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Error analizando la pista');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función para iniciar grabación
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const chunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedTrack(blob);
        analyzeTrack(blob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Error accediendo al micrófono. Verifica los permisos.');
    }
  };

  // Función para detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Generar prompt en inglés basado en análisis y parámetros
  const generateEnglishPrompt = (analysis: TrackAnalysis, userPrompt: string, params: ArrangementParams): string => {
    const { bpm, key, genre, energy, mood, tempo, complexity } = analysis;
    const { expressiveness, trash, garage, rarity } = params;

    // Base prompt con análisis técnico
    let prompt = `Create a professional cover arrangement of this track with the following characteristics:\n\n`;
    
    prompt += `**Original Analysis:**\n`;
    prompt += `- BPM: ${bpm}\n`;
    prompt += `- Key: ${key}\n`;
    prompt += `- Genre: ${genre.join(', ')}\n`;
    prompt += `- Energy Level: ${energy}/100\n`;
    prompt += `- Mood: ${mood}\n`;
    prompt += `- Tempo: ${tempo}\n`;
    prompt += `- Complexity: ${complexity}\n\n`;

    // Parámetros de arreglo
    prompt += `**Arrangement Parameters:**\n`;
    prompt += `- Expressiveness: ${expressiveness}/100 (${expressiveness > 70 ? 'highly expressive' : expressiveness > 40 ? 'moderately expressive' : 'subtle'})\n`;
    prompt += `- Raw/Garage Sound: ${trash}/100 (${trash > 70 ? 'very raw and gritty' : trash > 40 ? 'somewhat raw' : 'clean production'})\n`;
    prompt += `- Lo-fi/Underground: ${garage}/100 (${garage > 70 ? 'heavy lo-fi aesthetic' : garage > 40 ? 'some lo-fi elements' : 'polished sound'})\n`;
    prompt += `- Uniqueness: ${rarity}/100 (${rarity > 70 ? 'very unique and experimental' : rarity > 40 ? 'somewhat unique' : 'conventional approach'})\n\n`;

    // Prompt del usuario traducido/adaptado
    if (userPrompt.trim()) {
      prompt += `**User Request:**\n`;
      prompt += `${userPrompt}\n\n`;
    }

    // Instrucciones específicas para Suno Covers
    prompt += `**Instructions for Suno Covers:**\n`;
    prompt += `- Maintain the original melody and chord progression\n`;
    prompt += `- Apply the arrangement parameters to create a professional cover\n`;
    prompt += `- Ensure high audio quality and professional production\n`;
    prompt += `- Keep the essence of the original while adding the requested style\n`;

    return prompt;
  };

  // Generar cover con Suno Covers
  const generateCover = async () => {
    const audioSource = originalTrack || recordedTrack;
    if (!audioSource || !analysis) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Generar prompt en inglés
      const englishPrompt = generateEnglishPrompt(analysis, userPrompt, arrangementParams);
      setGeneratedPrompt(englishPrompt);

      // Simular llamada a Suno Covers API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock result
      const mockResult = {
        id: `cover_${Date.now()}`,
        title: `Cover - ${originalTrack.name}`,
        audioUrl: 'https://example.com/cover.mp3',
        duration: 180,
        style: 'Professional Cover',
        createdAt: new Date().toISOString()
      };

      setCoverResult(mockResult);
    } catch (err) {
      setError('Error generando cover');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalTrack(file);
      setRecordedTrack(null); // Limpiar grabación anterior
      analyzeTrack(file);
    }
  };

  return (
    <div className="ghost-studio">
      <div className="ghost-header">
        <h1>🎛️ Ghost Studio - Suno Covers</h1>
        <p>Sube una maqueta y crea un arreglo profesional con IA</p>
      </div>

      <div className="ghost-content">
        {/* Paso 1: Subir o Grabar Maqueta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="upload-section"
        >
          <h2>📁 Paso 1: Subir o Grabar Maqueta</h2>
          
          {/* Selector de modo */}
          <div className="mode-selector">
            <button
              className={`mode-btn ${activeMode === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveMode('upload')}
            >
              📁 Subir Archivo
            </button>
            <button
              className={`mode-btn ${activeMode === 'record' ? 'active' : ''}`}
              onClick={() => setActiveMode('record')}
            >
              🎤 Grabar Maqueta
            </button>
          </div>

          {/* Área de subida */}
          {activeMode === 'upload' && (
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="upload-btn"
                disabled={isAnalyzing}
              >
                {originalTrack ? `📁 ${originalTrack.name}` : '📁 Seleccionar archivo de audio'}
              </button>
            </div>
          )}

          {/* Área de grabación */}
          {activeMode === 'record' && (
            <div className="record-area">
              <div className="record-controls">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`record-btn ${isRecording ? 'recording' : ''}`}
                  disabled={isAnalyzing}
                >
                  {isRecording ? '⏹️ Detener Grabación' : '🔴 Iniciar Grabación'}
                </button>
              </div>
              
              {recordedTrack && (
                <div className="recorded-track">
                  <p>✅ Maqueta grabada exitosamente</p>
                  <audio controls className="audio-preview">
                    <source src={URL.createObjectURL(recordedTrack)} type="audio/wav" />
                    Tu navegador no soporta audio.
                  </audio>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Indicador de grabación */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="recording-indicator"
            >
              <div className="recording-pulse">
                <div className="pulse-dot"></div>
                <span>🎤 Grabando maqueta...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Análisis de la Pista */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="analysis-loading"
            >
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Analizando pista...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultados del Análisis */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="analysis-results"
            >
              <h2>📊 Análisis de la Pista</h2>
              <div className="analysis-grid">
                <div className="analysis-card">
                  <div className="analysis-label">BPM</div>
                  <div className="analysis-value">{analysis.bpm}</div>
                </div>
                <div className="analysis-card">
                  <div className="analysis-label">Tonalidad</div>
                  <div className="analysis-value">{analysis.key}</div>
                </div>
                <div className="analysis-card">
                  <div className="analysis-label">Género</div>
                  <div className="analysis-value">{analysis.genre.join(', ')}</div>
                </div>
                <div className="analysis-card">
                  <div className="analysis-label">Energía</div>
                  <div className="analysis-value">{analysis.energy}/100</div>
                </div>
                <div className="analysis-card">
                  <div className="analysis-label">Ánimo</div>
                  <div className="analysis-value">{analysis.mood}</div>
                </div>
                <div className="analysis-card">
                  <div className="analysis-label">Complejidad</div>
                  <div className="analysis-value">{analysis.complexity}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paso 2: Prompt del Usuario */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prompt-section"
            >
              <h2>✍️ Paso 2: Describe el Arreglo</h2>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Ej: Quiero un arreglo más electrónico con sintetizadores, mantener la melodía original pero con un drop épico en el coro..."
                className="prompt-textarea"
                rows={4}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paso 3: Parámetros de Arreglo */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="params-section"
            >
              <h2>🎚️ Paso 3: Parámetros de Arreglo</h2>
              <div className="params-grid">
                <div className="param-control">
                  <label className="param-label">
                    🎭 Expresividad ({arrangementParams.expressiveness})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={arrangementParams.expressiveness}
                    onChange={(e) => setArrangementParams(prev => ({
                      ...prev,
                      expressiveness: parseInt(e.target.value)
                    }))}
                    className="param-slider"
                  />
                  <div className="param-description">
                    Qué tan expresivo y emocional será el arreglo
                  </div>
                </div>

                <div className="param-control">
                  <label className="param-label">
                    🔥 Trash ({arrangementParams.trash})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={arrangementParams.trash}
                    onChange={(e) => setArrangementParams(prev => ({
                      ...prev,
                      trash: parseInt(e.target.value)
                    }))}
                    className="param-slider"
                  />
                  <div className="param-description">
                    Sonido crudo, garage y agresivo
                  </div>
                </div>

                <div className="param-control">
                  <label className="param-label">
                    🏠 Garage ({arrangementParams.garage})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={arrangementParams.garage}
                    onChange={(e) => setArrangementParams(prev => ({
                      ...prev,
                      garage: parseInt(e.target.value)
                    }))}
                    className="param-slider"
                  />
                  <div className="param-description">
                    Estética lo-fi y underground
                  </div>
                </div>

                <div className="param-control">
                  <label className="param-label">
                    ✨ Rareza ({arrangementParams.rarity})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={arrangementParams.rarity}
                    onChange={(e) => setArrangementParams(prev => ({
                      ...prev,
                      rarity: parseInt(e.target.value)
                    }))}
                    className="param-slider"
                  />
                  <div className="param-description">
                    Elementos únicos y experimentales
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón de Generación */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="generate-section"
            >
              <button
                onClick={generateCover}
                disabled={isGenerating}
                className="generate-btn"
              >
                {isGenerating ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Generando arreglo profesional...</span>
                  </div>
                ) : (
                  '🎵 Generar Arreglo Profesional'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt Generado */}
        <AnimatePresence>
          {generatedPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="generated-prompt"
            >
              <h2>📝 Prompt Generado para Suno Covers</h2>
              <div className="prompt-content">
                <pre>{generatedPrompt}</pre>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                className="copy-btn"
              >
                📋 Copiar Prompt
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultado del Cover */}
        <AnimatePresence>
          {coverResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cover-result"
            >
              <h2>🎵 Arreglo Profesional Generado</h2>
              <div className="result-content">
                <h3>{coverResult.title}</h3>
                <p>Duración: {coverResult.duration}s</p>
                <p>Estilo: {coverResult.style}</p>
                <audio controls className="audio-player">
                  <source src={coverResult.audioUrl} type="audio/mpeg" />
                  Tu navegador no soporta audio.
                </audio>
                <div className="result-actions">
                  <a
                    href={coverResult.audioUrl}
                    download={`${coverResult.title}.mp3`}
                    className="download-btn"
                  >
                    📥 Descargar
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="error-message"
            >
              <p>❌ {error}</p>
              <button onClick={() => setError(null)}>Cerrar</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
