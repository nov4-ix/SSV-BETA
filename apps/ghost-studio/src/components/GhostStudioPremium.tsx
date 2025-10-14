/**
 * 🌌 GHOST STUDIO - CORAZÓN DE SON1KVERS3
 * 
 * Interfaz Premium para la Democratización Musical
 * La herramienta más poderosa para crear música profesional
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackAnalysis {
  bpm: number;
  key: string;
  genre: string[];
  energy: number;
  mood: string;
  tempo: 'slow' | 'medium' | 'fast';
  complexity: 'simple' | 'moderate' | 'complex';
  harmonicComplexity: number;
  dynamicRange: number;
  spectralCentroid: number;
}

interface ArrangementParams {
  expressiveness: number;
  trash: number;
  garage: number;
  rarity: number;
  vintage: number;
  modern: number;
  experimental: number;
}

interface CoverRequest {
  originalTrack: File | Blob;
  analysis: TrackAnalysis;
  userPrompt: string;
  arrangementParams: ArrangementParams;
  generatedPrompt: string;
  stylePresets: string[];
}

export const GhostStudioPremium: React.FC = () => {
  const [originalTrack, setOriginalTrack] = useState<File | null>(null);
  const [recordedTrack, setRecordedTrack] = useState<Blob | null>(null);
  const [analysis, setAnalysis] = useState<TrackAnalysis | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [arrangementParams, setArrangementParams] = useState<ArrangementParams>({
    expressiveness: 50,
    trash: 20,
    garage: 30,
    rarity: 40,
    vintage: 25,
    modern: 75,
    experimental: 35
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeMode, setActiveMode] = useState<'upload' | 'record' | 'daw'>('upload');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [coverResult, setCoverResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Presets de estilo profesionales
  const stylePresets = {
    'Electronic Master': { expressiveness: 80, trash: 10, garage: 20, rarity: 60, vintage: 30, modern: 90, experimental: 70 },
    'Rock Anthem': { expressiveness: 90, trash: 40, garage: 60, rarity: 30, vintage: 50, modern: 70, experimental: 20 },
    'Hip-Hop Beat': { expressiveness: 70, trash: 30, garage: 50, rarity: 50, vintage: 40, modern: 80, experimental: 40 },
    'Jazz Fusion': { expressiveness: 85, trash: 15, garage: 25, rarity: 75, vintage: 60, modern: 60, experimental: 80 },
    'Ambient Soundscape': { expressiveness: 60, trash: 5, garage: 10, rarity: 85, vintage: 70, modern: 50, experimental: 90 },
    'Pop Hit': { expressiveness: 75, trash: 15, garage: 20, rarity: 25, vintage: 30, modern: 85, experimental: 15 },
    'Experimental': { expressiveness: 95, trash: 70, garage: 80, rarity: 95, vintage: 40, modern: 60, experimental: 100 }
  };

  // Analizar la pista con análisis avanzado
  const analyzeTrack = async (audioSource: File | Blob) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Simular análisis avanzado de audio
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockAnalysis: TrackAnalysis = {
        bpm: Math.floor(Math.random() * 60) + 80,
        key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)] + 
             ['', 'm'][Math.floor(Math.random() * 2)] + 
             ['', '#', 'b'][Math.floor(Math.random() * 3)],
        genre: ['Pop', 'Rock', 'Electronic', 'Hip-Hop', 'Jazz', 'Folk', 'Ambient'].slice(0, Math.floor(Math.random() * 3) + 1),
        energy: Math.floor(Math.random() * 40) + 60,
        mood: ['Happy', 'Melancholic', 'Energetic', 'Calm', 'Aggressive', 'Mysterious', 'Romantic'][Math.floor(Math.random() * 7)],
        tempo: ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)] as any,
        complexity: ['simple', 'moderate', 'complex'][Math.floor(Math.random() * 3)] as any,
        harmonicComplexity: Math.floor(Math.random() * 100),
        dynamicRange: Math.floor(Math.random() * 100),
        spectralCentroid: Math.floor(Math.random() * 100)
      };

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Error analizando la pista');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Función para iniciar grabación profesional
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2
        } 
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Generar prompt profesional para Suno Covers
  const generateEnglishPrompt = (analysis: TrackAnalysis, userPrompt: string, params: ArrangementParams): string => {
    const { bpm, key, genre, energy, mood, tempo, complexity, harmonicComplexity, dynamicRange, spectralCentroid } = analysis;
    const { expressiveness, trash, garage, rarity, vintage, modern, experimental } = params;

    let prompt = `🎵 PROFESSIONAL COVER ARRANGEMENT REQUEST 🎵\n\n`;
    
    prompt += `📊 ORIGINAL TRACK ANALYSIS:\n`;
    prompt += `• BPM: ${bpm} (${tempo} tempo)\n`;
    prompt += `• Key Signature: ${key}\n`;
    prompt += `• Genre Classification: ${genre.join(', ')}\n`;
    prompt += `• Energy Level: ${energy}/100\n`;
    prompt += `• Emotional Mood: ${mood}\n`;
    prompt += `• Musical Complexity: ${complexity}\n`;
    prompt += `• Harmonic Complexity: ${harmonicComplexity}/100\n`;
    prompt += `• Dynamic Range: ${dynamicRange}/100\n`;
    prompt += `• Spectral Centroid: ${spectralCentroid}/100\n\n`;

    prompt += `🎚️ ARRANGEMENT PARAMETERS:\n`;
    prompt += `• Expressiveness: ${expressiveness}/100 (${expressiveness > 70 ? 'highly expressive and emotional' : expressiveness > 40 ? 'moderately expressive' : 'subtle and restrained'})\n`;
    prompt += `• Raw/Gritty Sound: ${trash}/100 (${trash > 70 ? 'very raw, distorted, and aggressive' : trash > 40 ? 'somewhat raw and edgy' : 'clean and polished production'})\n`;
    prompt += `• Lo-fi/Underground: ${garage}/100 (${garage > 70 ? 'heavy lo-fi aesthetic with vintage character' : garage > 40 ? 'some lo-fi elements' : 'high-fidelity production'})\n`;
    prompt += `• Uniqueness Factor: ${rarity}/100 (${rarity > 70 ? 'very unique and experimental approach' : rarity > 40 ? 'somewhat unique elements' : 'conventional and accessible'})\n`;
    prompt += `• Vintage Character: ${vintage}/100 (${vintage > 70 ? 'strong vintage/retro elements' : vintage > 40 ? 'some vintage touches' : 'modern production'})\n`;
    prompt += `• Modern Production: ${modern}/100 (${modern > 70 ? 'cutting-edge modern sound' : modern > 40 ? 'contemporary production' : 'classic approach'})\n`;
    prompt += `• Experimental Elements: ${experimental}/100 (${experimental > 70 ? 'highly experimental and avant-garde' : experimental > 40 ? 'some experimental touches' : 'traditional approach'})\n\n`;

    if (userPrompt.trim()) {
      prompt += `✍️ USER CREATIVE DIRECTION:\n`;
      prompt += `"${userPrompt}"\n\n`;
    }

    prompt += `🎯 PROFESSIONAL INSTRUCTIONS FOR SUNO COVERS:\n`;
    prompt += `• Maintain the original melody and chord progression integrity\n`;
    prompt += `• Apply the arrangement parameters to create a professional cover\n`;
    prompt += `• Ensure high audio quality and professional production standards\n`;
    prompt += `• Keep the essence of the original while adding the requested style\n`;
    prompt += `• Balance creativity with commercial viability\n`;
    prompt += `• Optimize for streaming platforms and radio play\n`;
    prompt += `• Include proper dynamics and mastering considerations\n\n`;

    prompt += `🎼 TECHNICAL SPECIFICATIONS:\n`;
    prompt += `• Target BPM: ${bpm} (±5 BPM acceptable)\n`;
    prompt += `• Key: ${key} (modulation acceptable for artistic effect)\n`;
    prompt += `• Duration: 2:30-3:30 minutes (radio-friendly length)\n`;
    prompt += `• Format: High-quality stereo mix\n`;
    prompt += `• Dynamic Range: ${dynamicRange > 70 ? 'Wide dynamic range with punch' : 'Compressed for radio play'}\n`;

    return prompt;
  };

  // Generar cover profesional
  const generateCover = async () => {
    const audioSource = originalTrack || recordedTrack;
    if (!audioSource || !analysis) return;

    setIsGenerating(true);
    setError(null);

    try {
      const englishPrompt = generateEnglishPrompt(analysis, userPrompt, arrangementParams);
      setGeneratedPrompt(englishPrompt);

      // Simular llamada a Suno Covers API
      await new Promise(resolve => setTimeout(resolve, 5000));

      const mockResult = {
        id: `cover_${Date.now()}`,
        title: `Professional Cover - ${originalTrack?.name || 'Recorded Track'}`,
        audioUrl: 'https://example.com/professional-cover.mp3',
        duration: 210,
        style: 'Professional Cover',
        quality: 'Studio Quality',
        createdAt: new Date().toISOString(),
        downloadUrl: 'https://example.com/download/cover.mp3',
        waveformUrl: 'https://example.com/waveform.png'
      };

      setCoverResult(mockResult);
    } catch (err) {
      setError('Error generando cover profesional');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalTrack(file);
      setRecordedTrack(null);
      analyzeTrack(file);
    }
  };

  const applyPreset = (presetName: string) => {
    const preset = stylePresets[presetName as keyof typeof stylePresets];
    if (preset) {
      setArrangementParams(preset);
      setSelectedPreset(presetName);
    }
  };

  return (
    <div className="ghost-studio-premium">
      {/* Header Épico */}
      <div className="premium-header">
        <div className="header-content">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="title-section"
          >
            <h1 className="main-title">
              <span className="title-text">GHOST STUDIO</span>
              <span className="title-subtitle">DEMOCRATIZACIÓN MUSICAL</span>
            </h1>
            <p className="header-description">
              La herramienta más poderosa para crear música profesional
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="status-indicators"
          >
            <div className="status-item">
              <div className="status-dot active"></div>
              <span>IA Activa</span>
            </div>
            <div className="status-item">
              <div className="status-dot active"></div>
              <span>IA Musical</span>
            </div>
            <div className="status-item">
              <div className="status-dot active"></div>
              <span>Análisis Avanzado</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="premium-content">
        {/* Selector de Modo Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mode-selector-premium"
        >
          <h2>Selecciona tu Método de Creación</h2>
          <div className="mode-cards">
            <div 
              className={`mode-card ${activeMode === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveMode('upload')}
            >
              <h3>Subir Demo</h3>
              <p>Importa tu canción existente para crear un arreglo profesional</p>
            </div>
            
            <div 
              className={`mode-card ${activeMode === 'record' ? 'active' : ''}`}
              onClick={() => setActiveMode('record')}
            >
              <h3>Grabar Directamente</h3>
              <p>Graba tu demo en tiempo real con calidad profesional</p>
            </div>
            
            <div 
              className={`mode-card ${activeMode === 'daw' ? 'active' : ''}`}
              onClick={() => setActiveMode('daw')}
            >
              <h3>Mini DAW</h3>
              <p>Usa nuestro DAW integrado para crear desde cero</p>
            </div>
          </div>
        </motion.div>

        {/* Área de Trabajo Principal */}
        <div className="work-area">
          {/* Modo Subir */}
          {activeMode === 'upload' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="upload-section-premium"
            >
              <div className="upload-area-premium">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="upload-zone">
                  <h3>Arrastra tu demo aquí</h3>
                  <p>o haz clic para seleccionar</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-btn-premium"
                    disabled={isAnalyzing}
                  >
                    {originalTrack ? originalTrack.name : 'Seleccionar Archivo'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Modo Grabar */}
          {activeMode === 'record' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="record-section-premium"
            >
              <div className="record-area-premium">
                <div className="record-controls-premium">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`record-btn-premium ${isRecording ? 'recording' : ''}`}
                    disabled={isAnalyzing}
                  >
                    <span>{isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}</span>
                  </button>
                  
                  {isRecording && (
                    <div className="recording-timer">
                      <div className="timer-dot"></div>
                      <span>Grabando...</span>
                    </div>
                  )}
                </div>
                
                {recordedTrack && (
                  <div className="recorded-track-premium">
                    <h4>Demo Grabada</h4>
                    <audio controls className="audio-preview-premium">
                      <source src={URL.createObjectURL(recordedTrack)} type="audio/webm" />
                    </audio>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Modo DAW */}
          {activeMode === 'daw' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="daw-section-premium"
            >
              <div className="daw-placeholder">
                <h3>Mini DAW Integrado</h3>
                <p>Próximamente: DAW completo con loops, samples y efectos</p>
                <button className="coming-soon-btn">Próximamente</button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Indicador de Grabación Global */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="recording-indicator-premium"
            >
              <div className="recording-pulse-premium">
                <div className="pulse-ring"></div>
                <div className="pulse-dot-premium"></div>
                      <span>Grabando demo profesional...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Análisis Avanzado */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="analysis-loading-premium"
            >
              <div className="analysis-spinner">
                <div className="spinner-premium"></div>
                <div className="analysis-text">
                  <h3>Análisis Profesional en Progreso</h3>
                  <p>Analizando BPM, tonalidad, género, energía y complejidad armónica...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultados del Análisis Avanzado */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="analysis-results-premium"
            >
              <div className="analysis-header">
                <h2>Análisis Profesional Completo</h2>
                <button 
                  className="advanced-toggle"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Ocultar Detalles' : 'Ver Detalles Avanzados'}
                </button>
              </div>
              
              <div className="analysis-grid-premium">
                <div className="analysis-card-premium">
                  <div className="card-content">
                    <div className="card-label">BPM</div>
                    <div className="card-value">{analysis.bpm}</div>
                    <div className="card-subtitle">{analysis.tempo}</div>
                  </div>
                </div>
                
                <div className="analysis-card-premium">
                  <div className="card-content">
                    <div className="card-label">Tonalidad</div>
                    <div className="card-value">{analysis.key}</div>
                    <div className="card-subtitle">Armonía</div>
                  </div>
                </div>
                
                <div className="analysis-card-premium">
                  <div className="card-content">
                    <div className="card-label">Género</div>
                    <div className="card-value">{analysis.genre.join(', ')}</div>
                    <div className="card-subtitle">Clasificación</div>
                  </div>
                </div>
                
                <div className="analysis-card-premium">
                  <div className="card-content">
                    <div className="card-label">Energía</div>
                    <div className="card-value">{analysis.energy}/100</div>
                    <div className="card-subtitle">{analysis.mood}</div>
                  </div>
                </div>
                
                {showAdvanced && (
                  <>
                    <div className="analysis-card-premium">
                      <div className="card-content">
                        <div className="card-label">Complejidad Armónica</div>
                        <div className="card-value">{analysis.harmonicComplexity}/100</div>
                        <div className="card-subtitle">{analysis.complexity}</div>
                      </div>
                    </div>
                    
                    <div className="analysis-card-premium">
                      <div className="card-content">
                        <div className="card-label">Rango Dinámico</div>
                        <div className="card-value">{analysis.dynamicRange}/100</div>
                        <div className="card-subtitle">Dinámicas</div>
                      </div>
                    </div>
                    
                    <div className="analysis-card-premium">
                      <div className="card-content">
                        <div className="card-label">Centroide Espectral</div>
                        <div className="card-value">{analysis.spectralCentroid}/100</div>
                        <div className="card-subtitle">Timbre</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt Creativo */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prompt-section-premium"
            >
              <h2>Dirección Creativa</h2>
              <div className="prompt-area-premium">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Describe tu visión creativa: 'Quiero un arreglo más electrónico con sintetizadores vintage, mantener la melodía original pero con un drop épico en el coro, añadir elementos de trap y hacer que suene futurista...'"
                  className="prompt-textarea-premium"
                  rows={4}
                />
                <div className="prompt-hints">
                  <span className="hint">Tip: Sé específico sobre instrumentos, estilos, emociones y efectos</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Presets de Estilo Profesionales */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="presets-section-premium"
            >
              <h2>Presets de Estilo Profesionales</h2>
              <div className="presets-grid">
                {Object.keys(stylePresets).map((presetName) => (
                  <button
                    key={presetName}
                    onClick={() => applyPreset(presetName)}
                    className={`preset-btn ${selectedPreset === presetName ? 'selected' : ''}`}
                  >
                    <div className="preset-name">{presetName}</div>
                    <div className="preset-description">
                      {presetName === 'Electronic Master' && 'Sintetizadores épicos y drops poderosos'}
                      {presetName === 'Rock Anthem' && 'Guitarras distorsionadas y batería poderosa'}
                      {presetName === 'Hip-Hop Beat' && '808s profundos y ritmos urbanos'}
                      {presetName === 'Jazz Fusion' && 'Armonías complejas y improvisación'}
                      {presetName === 'Ambient Soundscape' && 'Atmósferas etéreas y texturas'}
                      {presetName === 'Pop Hit' && 'Melodías pegajosas y producción pulida'}
                      {presetName === 'Experimental' && 'Sonidos únicos y estructuras innovadoras'}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parámetros Avanzados */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="params-section-premium"
            >
              <h2>Parámetros de Arreglo Avanzados</h2>
              <div className="params-grid-premium">
                {Object.entries(arrangementParams).map(([key, value]) => (
                  <div key={key} className="param-control-premium">
                    <div className="param-header">
                      <label className="param-label-premium">
                        {key === 'expressiveness' && 'Expresividad'}
                        {key === 'trash' && 'Sonido Crudo'}
                        {key === 'garage' && 'Lo-fi/Underground'}
                        {key === 'rarity' && 'Uniqueness'}
                        {key === 'vintage' && 'Vintage Character'}
                        {key === 'modern' && 'Modern Production'}
                        {key === 'experimental' && 'Experimental'}
                      </label>
                      <span className="param-value">{value}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => setArrangementParams(prev => ({
                        ...prev,
                        [key]: parseInt(e.target.value)
                      }))}
                      className="param-slider-premium"
                    />
                    <div className="param-description-premium">
                      {key === 'expressiveness' && 'Qué tan expresivo y emocional será el arreglo'}
                      {key === 'trash' && 'Sonido crudo, distorsionado y agresivo'}
                      {key === 'garage' && 'Estética lo-fi, underground y vintage'}
                      {key === 'rarity' && 'Elementos únicos y experimentales'}
                      {key === 'vintage' && 'Carácter retro y nostálgico'}
                      {key === 'modern' && 'Producción contemporánea y fresca'}
                      {key === 'experimental' && 'Enfoque avant-garde e innovador'}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón de Generación Épico */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="generate-section-premium"
            >
              <button
                onClick={generateCover}
                disabled={isGenerating}
                className="generate-btn-premium"
              >
                {isGenerating ? (
                  <div className="generating-content">
                    <div className="generating-spinner"></div>
                    <div className="generating-text">
                      <span className="generating-title">Generando Arreglo Profesional</span>
                      <span className="generating-subtitle">Creando arreglo de calidad estudio...</span>
                    </div>
                  </div>
                ) : (
                  <div className="generate-content">
                    <span className="generate-text">Generar Arreglo Profesional</span>
                    <span className="generate-subtitle">Con IA Musical</span>
                  </div>
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
              className="generated-prompt-premium"
            >
              <h2>Prompt Profesional Generado</h2>
              <div className="prompt-content-premium">
                <pre>{generatedPrompt}</pre>
              </div>
              <div className="prompt-actions-premium">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                  className="copy-btn-premium"
                >
                  Copiar Prompt
                </button>
                <button
                  onClick={() => setGeneratedPrompt('')}
                  className="clear-btn-premium"
                >
                  Limpiar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultado del Cover Profesional */}
        <AnimatePresence>
          {coverResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cover-result-premium"
            >
              <div className="result-header">
                <h2>Arreglo Profesional Generado</h2>
                <div className="quality-badge">Studio Quality</div>
              </div>
              
              <div className="result-content-premium">
                <div className="result-info">
                  <h3>{coverResult.title}</h3>
                  <div className="result-meta">
                    <span className="meta-item">Duración: {coverResult.duration}s</span>
                    <span className="meta-item">Estilo: {coverResult.style}</span>
                    <span className="meta-item">Calidad: {coverResult.quality}</span>
                  </div>
                </div>
                
                <div className="audio-player-premium">
                  <audio controls>
                    <source src={coverResult.audioUrl} type="audio/mpeg" />
                  </audio>
                </div>
                
                <div className="result-actions-premium">
                  <a
                    href={coverResult.downloadUrl}
                    download={`${coverResult.title}.mp3`}
                    className="download-btn-premium"
                  >
                    Descargar MP3
                  </a>
                  <button className="share-btn-premium">
                    Compartir
                  </button>
                  <button className="remix-btn-premium">
                    Remix
                  </button>
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
              className="error-message-premium"
            >
              <div className="error-content">
                <div className="error-text">
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
                <button onClick={() => setError(null)} className="error-close">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
