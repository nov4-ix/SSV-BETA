import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  Zap, 
  Settings, 
  Music, 
  Mic,
  Play,
  Pause,
  RotateCcw,
  Save,
  Download,
  Wand2,
  Sparkles,
  Flame,
  Heart,
  Skull,
  Star,
  Moon,
  Sun
} from 'lucide-react';

// 🎛️ GHOST STUDIO CON KNOBS DE CONTROL DE PROMPT PARA SUNO 🎛️

interface PromptKnob {
  id: string;
  name: string;
  label: string;
  icon: React.ComponentType<any>;
  min: number;
  max: number;
  defaultValue: number;
  currentValue: number;
  color: string;
  description: string;
  promptMapping: (value: number) => string;
  isGhostStudioOnly?: boolean;
}

interface TrackAnalysis {
  bpm: number;
  genre: string;
  instrumentation: string[];
  style: string;
  mood: string;
  energy: number;
  complexity: number;
}

interface GhostStudioWithKnobsProps {
  onTrackProcessed?: (trackId: string, processedAudio: string) => void;
  onPromptGenerated?: (prompt: string, knobs: Record<string, number>) => void;
}

export function GhostStudioWithKnobs({ 
  onTrackProcessed,
  onPromptGenerated 
}: GhostStudioWithKnobsProps) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(120);
  const [trackAnalysis, setTrackAnalysis] = useState<TrackAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  
  // 🎛️ KNOBS DE CONTROL DE PROMPT 🎛️
  const [knobs, setKnobs] = useState<PromptKnob[]>([
    {
      id: 'expressivity',
      name: 'Expresividad',
      label: 'EXPR',
      icon: Heart,
      min: 0,
      max: 100,
      defaultValue: 50,
      currentValue: 50,
      color: '#FF6B6B',
      description: 'Controla el estado emocional de la interpretación',
      promptMapping: (value: number) => {
        if (value < 10) return 'extremely sad, melancholic, heartbroken';
        if (value < 20) return 'sad, melancholic, introspective';
        if (value < 30) return 'melancholic, nostalgic, contemplative';
        if (value < 40) return 'calm, peaceful, serene';
        if (value < 50) return 'neutral, balanced, moderate';
        if (value < 60) return 'uplifting, positive, cheerful';
        if (value < 70) return 'happy, joyful, energetic';
        if (value < 80) return 'excited, enthusiastic, vibrant';
        if (value < 90) return 'intense, passionate, dramatic';
        return 'frenetic, chaotic, overwhelming';
      },
    },
    {
      id: 'weirdness',
      name: 'Rareza',
      label: 'WEIRD',
      icon: Skull,
      min: 0,
      max: 100,
      defaultValue: 20,
      currentValue: 20,
      color: '#9B59B6',
      description: 'Qué tan desapegado será el arreglo de la canción original',
      promptMapping: (value: number) => {
        if (value < 20) return 'faithful to original, traditional arrangement';
        if (value < 40) return 'slight variation, subtle reinterpretation';
        if (value < 60) return 'creative reinterpretation, modern twist';
        if (value < 80) return 'experimental arrangement, avant-garde approach';
        return 'completely deconstructed, abstract interpretation';
      },
      isGhostStudioOnly: true,
    },
    {
      id: 'grunge',
      name: 'Grunge',
      label: 'GRUNGE',
      icon: Flame,
      min: 0,
      max: 100,
      defaultValue: 30,
      currentValue: 30,
      color: '#E74C3C',
      description: 'Energía y distorsión de la canción',
      promptMapping: (value: number) => {
        if (value < 20) return 'clean, polished, pristine sound';
        if (value < 40) return 'slight distortion, warm overdrive';
        if (value < 60) return 'moderate distortion, gritty texture';
        if (value < 80) return 'heavy distortion, aggressive tone';
        return 'extreme distortion, chaotic noise, wall of sound';
      },
    },
    {
      id: 'complexity',
      name: 'Complejidad',
      label: 'COMPLEX',
      icon: Star,
      min: 0,
      max: 100,
      defaultValue: 60,
      currentValue: 60,
      color: '#F39C12',
      description: 'Complejidad musical y arreglos',
      promptMapping: (value: number) => {
        if (value < 20) return 'simple, minimal, stripped down';
        if (value < 40) return 'moderate complexity, standard arrangement';
        if (value < 60) return 'complex, layered, sophisticated';
        if (value < 80) return 'highly complex, intricate arrangements';
        return 'extremely complex, orchestral, maximalist';
      },
    },
    {
      id: 'tempo',
      name: 'Tempo',
      label: 'TEMPO',
      icon: Zap,
      min: 60,
      max: 200,
      defaultValue: 120,
      currentValue: 120,
      color: '#3498DB',
      description: 'Velocidad y ritmo de la canción',
      promptMapping: (value: number) => {
        if (value < 80) return 'slow tempo, ballad-like, relaxed';
        if (value < 100) return 'moderate tempo, steady rhythm';
        if (value < 120) return 'upbeat tempo, energetic rhythm';
        if (value < 140) return 'fast tempo, driving rhythm';
        return 'very fast tempo, frenetic rhythm';
      },
    },
    {
      id: 'atmosphere',
      name: 'Atmósfera',
      label: 'ATMOS',
      icon: Moon,
      min: 0,
      max: 100,
      defaultValue: 50,
      currentValue: 50,
      color: '#8E44AD',
      description: 'Ambiente y textura sonora',
      promptMapping: (value: number) => {
        if (value < 20) return 'bright, sunny, optimistic atmosphere';
        if (value < 40) return 'warm, cozy, intimate atmosphere';
        if (value < 60) return 'neutral, balanced atmosphere';
        if (value < 80) return 'dark, mysterious, atmospheric';
        return 'haunting, ethereal, otherworldly atmosphere';
      },
    },
  ]);

  // 🎵 ANÁLISIS DE PISTA 🎵
  const analyzeTrack = useCallback(async (trackId: string) => {
    setIsAnalyzing(true);
    
    try {
      // Simular análisis de pista
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis: TrackAnalysis = {
        bpm: Math.floor(Math.random() * 60) + 80, // 80-140 BPM
        genre: ['electronic', 'rock', 'pop', 'jazz', 'classical'][Math.floor(Math.random() * 5)],
        instrumentation: ['guitar', 'piano', 'drums', 'bass', 'synth'],
        style: ['modern', 'vintage', 'experimental', 'minimalist'][Math.floor(Math.random() * 4)],
        mood: ['happy', 'sad', 'energetic', 'calm'][Math.floor(Math.random() * 4)],
        energy: Math.floor(Math.random() * 100),
        complexity: Math.floor(Math.random() * 100)
      };
      
      setTrackAnalysis(analysis);
      
      // Actualizar knobs basado en análisis
      setKnobs(prev => prev.map(knob => {
        if (knob.id === 'tempo') {
          return { ...knob, currentValue: analysis.bpm };
        }
        if (knob.id === 'complexity') {
          return { ...knob, currentValue: analysis.complexity };
        }
        return knob;
      }));
      
    } catch (error) {
      console.error('Error analyzing track:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 🎛️ ACTUALIZAR KNOB 🎛️
  const updateKnob = useCallback((knobId: string, value: number) => {
    setKnobs(prev => prev.map(knob => 
      knob.id === knobId ? { ...knob, currentValue: value } : knob
    ));
  }, []);

  // 🎯 GENERAR PROMPT COMPLETO 🎯
  const generatePrompt = useCallback(() => {
    const basePrompt = trackAnalysis ? 
      `Based on the original track analysis: ${trackAnalysis.genre} style, ${trackAnalysis.bpm} BPM, ${trackAnalysis.mood} mood. ` :
      'Create a new musical composition. ';
    
    const knobPrompts = knobs.map(knob => knob.promptMapping(knob.currentValue));
    const fullPrompt = basePrompt + knobPrompts.join(', ') + '. Professional studio quality, enhanced production.';
    
    setGeneratedPrompt(fullPrompt);
    onPromptGenerated?.(fullPrompt, knobs.reduce((acc, knob) => ({ ...acc, [knob.id]: knob.currentValue }), {}));
    
    return fullPrompt;
  }, [knobs, trackAnalysis, onPromptGenerated]);

  // 🎛️ RENDERIZAR KNOB 🎛️
  const renderKnob = (knob: PromptKnob) => {
    const IconComponent = knob.icon;
    const percentage = ((knob.currentValue - knob.min) / (knob.max - knob.min)) * 100;
    
    return (
      <motion.div
        key={knob.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5" style={{ color: knob.color }} />
            <span className="font-semibold text-white">{knob.name}</span>
          </div>
          <span className="text-sm text-gray-400">{knob.currentValue}</span>
        </div>
        
        <div className="mb-3">
          <input
            type="range"
            min={knob.min}
            max={knob.max}
            value={knob.currentValue}
            onChange={(e) => updateKnob(knob.id, Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${knob.color} 0%, ${knob.color} ${percentage}%, #374151 ${percentage}%, #374151 100%)`
            }}
          />
        </div>
        
        <div className="text-xs text-gray-400 mb-2">{knob.description}</div>
        
        <div className="text-xs text-gray-500 bg-gray-800/50 rounded p-2">
          <strong>Prompt:</strong> {knob.promptMapping(knob.currentValue)}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="ghost-studio-with-knobs bg-black text-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-b border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              👻 Ghost Studio + Knobs
            </h1>
            <div className="text-sm text-gray-300">
              Control Directo de Prompt para Suno AI
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {trackAnalysis && (
              <div className="text-sm text-gray-300">
                <span className="text-cyan-400">BPM:</span> {trackAnalysis.bpm} | 
                <span className="text-purple-400"> Genre:</span> {trackAnalysis.genre} |
                <span className="text-green-400"> Energy:</span> {trackAnalysis.energy}%
              </div>
            )}
            
            <button
              onClick={generatePrompt}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all"
            >
              <Wand2 className="w-4 h-4 inline mr-2" />
              Generar Prompt
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Knobs Panel */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Control Knobs para Suno AI
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {knobs.map(renderKnob)}
            </div>
            
            {/* Generated Prompt Display */}
            {generatedPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-gray-900/50 border border-gray-700 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Prompt Generado para Suno AI
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300">
                  {generatedPrompt}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                  >
                    Copiar Prompt
                  </button>
                  <button
                    onClick={() => {
                      // Aquí se enviaría el prompt a Suno AI
                      console.log('Sending to Suno AI:', generatedPrompt);
                    }}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
                  >
                    Enviar a Suno
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Track Analysis & Controls */}
          <div className="space-y-6">
            {/* Track Analysis */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Análisis de Pista
              </h3>
              
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-400">Analizando pista...</p>
                </div>
              ) : trackAnalysis ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">BPM:</span>
                    <span className="text-white">{trackAnalysis.bpm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Género:</span>
                    <span className="text-white capitalize">{trackAnalysis.genre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estilo:</span>
                    <span className="text-white capitalize">{trackAnalysis.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mood:</span>
                    <span className="text-white capitalize">{trackAnalysis.mood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Energía:</span>
                    <span className="text-white">{trackAnalysis.energy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Complejidad:</span>
                    <span className="text-white">{trackAnalysis.complexity}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Music className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>Selecciona una pista para analizar</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Acciones Rápidas</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => selectedTrackId && analyzeTrack(selectedTrackId)}
                  disabled={!selectedTrackId || isAnalyzing}
                  className="w-full px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Analizar Pista
                </button>
                
                <button
                  onClick={() => setKnobs(prev => prev.map(knob => ({ ...knob, currentValue: knob.defaultValue })))}
                  className="w-full px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/30 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Reset Knobs
                </button>
                
                <button
                  onClick={() => {
                    const prompt = generatePrompt();
                    console.log('Generated prompt:', prompt);
                  }}
                  className="w-full px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/30 transition-colors"
                >
                  <Wand2 className="w-4 h-4 inline mr-2" />
                  Generar Prompt
                </button>
              </div>
            </div>

            {/* Knob Values Summary */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Valores Actuales</h3>
              
              <div className="space-y-2">
                {knobs.map(knob => (
                  <div key={knob.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">{knob.label}:</span>
                    <span className="text-white">{knob.currentValue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
