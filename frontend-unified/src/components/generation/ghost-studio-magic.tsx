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
  Sun,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';

// 🎛️ GHOST STUDIO CON KNOBS MÁGICOS - EXPERIENCIA BLACK BOX 🎛️

interface MagicKnob {
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
  isGhostStudioOnly?: boolean;
  isSecret?: boolean; // Para ingredientes secretos
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

interface GhostStudioMagicProps {
  onTrackProcessed?: (trackId: string, processedAudio: string) => void;
  onMagicApplied?: (knobs: Record<string, number>) => void;
}

export function GhostStudioMagic({ 
  onTrackProcessed,
  onMagicApplied 
}: GhostStudioMagicProps) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(120);
  const [trackAnalysis, setTrackAnalysis] = useState<TrackAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSecretKnobs, setShowSecretKnobs] = useState(false);
  const [magicLevel, setMagicLevel] = useState<'subtle' | 'enhanced' | 'extreme'>('enhanced');
  
  // 🎛️ KNOBS MÁGICOS - SOLO EXPERIENCIA VISUAL 🎛️
  const [knobs, setKnobs] = useState<MagicKnob[]>([
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
    },
    // 🥤 INGREDIENTES SECRETOS (solo para desarrolladores) 🥤
    {
      id: 'secret_sauce',
      name: 'Salsa Secreta',
      label: 'SECRET',
      icon: Lock,
      min: 0,
      max: 100,
      defaultValue: 75,
      currentValue: 75,
      color: '#E67E22',
      description: 'Ingrediente secreto para el sabor único',
      isSecret: true,
    },
    {
      id: 'magic_dust',
      name: 'Polvo Mágico',
      label: 'MAGIC',
      icon: Sparkles,
      min: 0,
      max: 100,
      defaultValue: 40,
      currentValue: 40,
      color: '#F1C40F',
      description: 'Polvo mágico para resultados extraordinarios',
      isSecret: true,
    },
  ]);

  // 🎵 ANÁLISIS DE PISTA (BLACK BOX) 🎵
  const analyzeTrack = useCallback(async (trackId: string) => {
    setIsAnalyzing(true);
    
    try {
      // Simular análisis mágico
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis: TrackAnalysis = {
        bpm: Math.floor(Math.random() * 60) + 80,
        genre: ['electronic', 'rock', 'pop', 'jazz', 'classical'][Math.floor(Math.random() * 5)],
        instrumentation: ['guitar', 'piano', 'drums', 'bass', 'synth'],
        style: ['modern', 'vintage', 'experimental', 'minimalist'][Math.floor(Math.random() * 4)],
        mood: ['happy', 'sad', 'energetic', 'calm'][Math.floor(Math.random() * 4)],
        energy: Math.floor(Math.random() * 100),
        complexity: Math.floor(Math.random() * 100)
      };
      
      setTrackAnalysis(analysis);
      
      // Auto-ajustar knobs basado en análisis (mágicamente)
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

  // 🎛️ ACTUALIZAR KNOB MÁGICO 🎛️
  const updateKnob = useCallback((knobId: string, value: number) => {
    setKnobs(prev => prev.map(knob => 
      knob.id === knobId ? { ...knob, currentValue: value } : knob
    ));
  }, []);

  // ✨ APLICAR MAGIA (SIN MOSTRAR PROMPT) ✨
  const applyMagic = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // Simular procesamiento mágico
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Solo notificar que se aplicó la magia, sin mostrar detalles
      const knobValues = knobs.reduce((acc, knob) => ({ 
        ...acc, 
        [knob.id]: knob.currentValue 
      }), {});
      
      onMagicApplied?.(knobValues);
      
      // Simular resultado exitoso
      console.log('🎵 Magic applied successfully! (Details hidden)');
      
    } catch (error) {
      console.error('Error applying magic:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [knobs, onMagicApplied]);

  // 🎛️ RENDERIZAR KNOB MÁGICO 🎛️
  const renderKnob = (knob: MagicKnob) => {
    const IconComponent = knob.icon;
    const percentage = ((knob.currentValue - knob.min) / (knob.max - knob.min)) * 100;
    const isSecret = knob.isSecret && !showSecretKnobs;
    
    if (isSecret) return null; // Ocultar ingredientes secretos
    
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
            {knob.isSecret && (
              <Lock className="w-3 h-3 text-yellow-400" />
            )}
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
        
        {/* Solo mostrar efecto visual, no el prompt */}
        <div className="text-xs text-gray-500 bg-gray-800/50 rounded p-2">
          <strong>Efecto:</strong> {getKnobEffect(knob)}
        </div>
      </motion.div>
    );
  };

  // 🎨 OBTENER EFECTO VISUAL DEL KNOB (SIN REVELAR PROMPT) 🎨
  const getKnobEffect = (knob: MagicKnob): string => {
    const percentage = ((knob.currentValue - knob.min) / (knob.max - knob.min)) * 100;
    
    switch (knob.id) {
      case 'expressivity':
        if (percentage < 20) return 'Melancolía profunda';
        if (percentage < 40) return 'Tranquilidad serena';
        if (percentage < 60) return 'Equilibrio emocional';
        if (percentage < 80) return 'Energía positiva';
        return 'Intensidad emocional';
      
      case 'weirdness':
        if (percentage < 20) return 'Fiel al original';
        if (percentage < 40) return 'Variación sutil';
        if (percentage < 60) return 'Reinterpretación creativa';
        if (percentage < 80) return 'Enfoque experimental';
        return 'Deconstrucción abstracta';
      
      case 'grunge':
        if (percentage < 20) return 'Sonido cristalino';
        if (percentage < 40) return 'Calidez vintage';
        if (percentage < 60) return 'Textura rugosa';
        if (percentage < 80) return 'Distorsión intensa';
        return 'Caos sonoro';
      
      case 'complexity':
        if (percentage < 20) return 'Minimalismo esencial';
        if (percentage < 40) return 'Arreglo estándar';
        if (percentage < 60) return 'Complejidad sofisticada';
        if (percentage < 80) return 'Arreglos intrincados';
        return 'Maximalismo orquestal';
      
      case 'tempo':
        if (percentage < 20) return 'Ritmo contemplativo';
        if (percentage < 40) return 'Paso moderado';
        if (percentage < 60) return 'Ritmo energético';
        if (percentage < 80) return 'Ritmo acelerado';
        return 'Ritmo frenético';
      
      case 'atmosphere':
        if (percentage < 20) return 'Atmósfera brillante';
        if (percentage < 40) return 'Ambiente cálido';
        if (percentage < 60) return 'Atmósfera equilibrada';
        if (percentage < 80) return 'Ambiente misterioso';
        return 'Atmósfera etérea';
      
      default:
        return 'Efecto mágico aplicado';
    }
  };

  // 🎯 CALCULAR NIVEL DE MAGIA 🎯
  const calculateMagicLevel = (): 'subtle' | 'enhanced' | 'extreme' => {
    const totalDeviation = knobs.reduce((sum, knob) => {
      const deviation = Math.abs(knob.currentValue - knob.defaultValue);
      return sum + (deviation / (knob.max - knob.min));
    }, 0);
    
    const averageDeviation = totalDeviation / knobs.length;
    
    if (averageDeviation < 0.2) return 'subtle';
    if (averageDeviation < 0.5) return 'enhanced';
    return 'extreme';
  };

  return (
    <div className="ghost-studio-magic bg-black text-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-b border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              👻 Ghost Studio Magic
            </h1>
            <div className="text-sm text-gray-300">
              Control Mágico de Interpretación Musical
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Magic Level Indicator */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Nivel:</span>
              <span className={`text-sm font-semibold ${
                magicLevel === 'subtle' ? 'text-green-400' :
                magicLevel === 'enhanced' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {magicLevel === 'subtle' ? 'Sutil' : 
                 magicLevel === 'enhanced' ? 'Mejorado' : 'Extremo'}
              </span>
            </div>
            
            {/* Secret Knobs Toggle (solo para desarrolladores) */}
            <button
              onClick={() => setShowSecretKnobs(!showSecretKnobs)}
              className="p-2 bg-gray-800/50 text-gray-400 rounded hover:bg-gray-700/50 transition-colors"
              title="Mostrar ingredientes secretos (solo desarrolladores)"
            >
              {showSecretKnobs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            <button
              onClick={applyMagic}
              disabled={isProcessing}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline mr-2" />
                  Aplicando Magia...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 inline mr-2" />
                  Aplicar Magia
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Magic Knobs Panel */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Control Knobs Mágicos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {knobs.map(renderKnob)}
            </div>
            
            {/* Magic Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Vista Previa de la Magia
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Nivel de Magia</div>
                  <div className={`text-lg font-bold ${
                    magicLevel === 'subtle' ? 'text-green-400' :
                    magicLevel === 'enhanced' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {magicLevel === 'subtle' ? 'Sutil' : 
                     magicLevel === 'enhanced' ? 'Mejorado' : 'Extremo'}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Efectos Aplicados</div>
                  <div className="text-lg font-bold text-cyan-400">
                    {knobs.filter(k => k.currentValue !== k.defaultValue).length}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Calidad Estimada</div>
                  <div className="text-lg font-bold text-green-400">
                    {magicLevel === 'subtle' ? '85%' : 
                     magicLevel === 'enhanced' ? '92%' : '98%'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-300">
                <strong>Nota:</strong> Los detalles técnicos del procesamiento se mantienen como receta secreta. 
                Solo experimenta la magia del resultado final.
              </div>
            </motion.div>
          </div>

          {/* Track Analysis & Controls */}
          <div className="space-y-6">
            {/* Track Analysis */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Análisis Mágico de Pista
              </h3>
              
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-400">Analizando con magia...</p>
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
                  <p>Selecciona una pista para análisis mágico</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Acciones Mágicas</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => selectedTrackId && analyzeTrack(selectedTrackId)}
                  disabled={!selectedTrackId || isAnalyzing}
                  className="w-full px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Análisis Mágico
                </button>
                
                <button
                  onClick={() => setKnobs(prev => prev.map(knob => ({ ...knob, currentValue: knob.defaultValue })))}
                  className="w-full px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/30 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Reset Knobs
                </button>
                
                <button
                  onClick={applyMagic}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30 rounded hover:from-purple-500/30 hover:to-cyan-500/30 transition-colors disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4 inline mr-2" />
                  {isProcessing ? 'Aplicando...' : 'Aplicar Magia'}
                </button>
              </div>
            </div>

            {/* Secret Sauce Indicator */}
            {showSecretKnobs && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Ingredientes Secretos
                </h3>
                
                <div className="text-sm text-gray-300 mb-4">
                  🥤 Receta secreta activa - Solo visible para desarrolladores
                </div>
                
                <div className="space-y-2">
                  {knobs.filter(k => k.isSecret).map(knob => (
                    <div key={knob.id} className="flex justify-between text-sm">
                      <span className="text-gray-400">{knob.label}:</span>
                      <span className="text-yellow-400">{knob.currentValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
