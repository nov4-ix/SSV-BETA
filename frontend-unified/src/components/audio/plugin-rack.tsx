import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Settings, 
  Zap, 
  Volume2, 
  Sliders, 
  Waveform,
  Play,
  Pause,
  RotateCcw,
  Save,
  Download
} from 'lucide-react';

// 🎵 PLUGINS ÉPICOS DEL SON1KVERSE - VERSIÓN MEJORADA 🎵

export interface PluginParameter {
  id: string;
  name: string;
  type: 'float' | 'enum' | 'boolean';
  min?: number;
  max?: number;
  defaultValue: any;
  currentValue: any;
  unit?: string;
  description: string;
  options?: Array<{ value: string; label: string }>;
}

export interface PluginPreset {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  category: string;
  author: string;
}

export interface SonicPlugin {
  id: string;
  name: string;
  category: 'eq' | 'compressor' | 'reverb' | 'delay' | 'distortion' | 'modulation' | 'mastering' | 'synth' | 'filter';
  description: string;
  icon: string;
  symbol: string; // Nuevo: símbolo específico del plugin
  isActive: boolean;
  parameters: PluginParameter[];
  presets: PluginPreset[];
  version: string;
  author: string;
  color: string;
  wavesCompatible?: boolean;
  wavesPluginId?: string;
}

// 🎵 PLUGINS ÉPICOS DEL SON1KVERSE 🎵
export const SONIC_PLUGINS: SonicPlugin[] = [
  // === EQUALIZADORES ===
  {
    id: 'nexus-spectrum',
    name: 'Nexus Spectrum',
    symbol: '🌀',
    category: 'eq',
    description: 'Equalizador espectral avanzado con tecnología de resonancia cuántica',
    icon: '🌀',
    isActive: false,
    version: '2.0.0',
    author: 'Son1kVerse Labs',
    color: '#00FFE7',
    wavesCompatible: true,
    wavesPluginId: 'waves-h-eq',
    parameters: [
      {
        id: 'quantum_resonance',
        name: 'Quantum Resonance',
        type: 'float',
        min: 0,
        max: 100,
        defaultValue: 50,
        currentValue: 50,
        unit: '%',
        description: 'Intensidad de la resonancia cuántica'
      },
      {
        id: 'spectral_shift',
        name: 'Spectral Shift',
        type: 'float',
        min: -20,
        max: 20,
        defaultValue: 0,
        currentValue: 0,
        unit: 'dB',
        description: 'Desplazamiento espectral'
      },
      {
        id: 'dimensional_focus',
        name: 'Dimensional Focus',
        type: 'enum',
        defaultValue: 'balanced',
        currentValue: 'balanced',
        options: [
          { value: 'balanced', label: 'Balanced' },
          { value: 'dimensional', label: 'Dimensional' },
          { value: 'quantum', label: 'Quantum' },
          { value: 'nexus', label: 'Nexus' }
        ],
        description: 'Modo de enfoque dimensional'
      }
    ],
    presets: [
      {
        id: 'quantum_boost',
        name: 'Quantum Boost',
        description: 'Boost cuántico para frecuencias altas',
        parameters: { quantum_resonance: 75, spectral_shift: 3, dimensional_focus: 'quantum' },
        category: 'boost',
        author: 'Son1kVerse'
      }
    ]
  },

  // === REVERB ===
  {
    id: 'phantom-reverb',
    name: 'Phantom Reverb',
    symbol: '👻',
    category: 'reverb',
    description: 'Reverb fantasma con algoritmos de espacio dimensional',
    icon: '👻',
    isActive: false,
    version: '2.0.0',
    author: 'Son1kVerse Labs',
    color: '#B84DFF',
    parameters: [
      {
        id: 'phantom_space',
        name: 'Phantom Space',
        type: 'float',
        min: 0,
        max: 100,
        defaultValue: 50,
        currentValue: 50,
        unit: '%',
        description: 'Tamaño del espacio fantasma'
      },
      {
        id: 'dimensional_decay',
        name: 'Dimensional Decay',
        type: 'float',
        min: 0,
        max: 10,
        defaultValue: 2.5,
        currentValue: 2.5,
        unit: 's',
        description: 'Decaimiento dimensional'
      }
    ],
    presets: [
      {
        id: 'cathedral_phantom',
        name: 'Cathedral Phantom',
        description: 'Reverb de catedral fantasma',
        parameters: { phantom_space: 85, dimensional_decay: 4.2 },
        category: 'cathedral',
        author: 'Son1kVerse'
      }
    ]
  },

  // === DELAY ===
  {
    id: 'nexus-delay',
    name: 'Nexus Delay',
    symbol: '⏰',
    category: 'delay',
    description: 'Delay temporal con manipulación del espacio-tiempo',
    icon: '⏰',
    isActive: false,
    version: '2.0.0',
    author: 'Son1kVerse Labs',
    color: '#9AF7EE',
    parameters: [
      {
        id: 'time_manipulation',
        name: 'Time Manipulation',
        type: 'float',
        min: 50,
        max: 2000,
        defaultValue: 300,
        currentValue: 300,
        unit: 'ms',
        description: 'Manipulación temporal'
      },
      {
        id: 'nexus_feedback',
        name: 'Nexus Feedback',
        type: 'float',
        min: 0,
        max: 100,
        defaultValue: 30,
        currentValue: 30,
        unit: '%',
        description: 'Feedback del Nexus'
      }
    ],
    presets: [
      {
        id: 'quantum_slap',
        name: 'Quantum Slap',
        description: 'Slapback cuántico clásico',
        parameters: { time_manipulation: 120, nexus_feedback: 15 },
        category: 'slap',
        author: 'Son1kVerse'
      }
    ]
  },

  // === DISTORSIONES ===
  {
    id: 'quantum-distortion',
    name: 'Quantum Distortion',
    symbol: '⚡',
    category: 'distortion',
    description: 'Distorsión cuántica con algoritmos de ruptura dimensional',
    icon: '⚡',
    isActive: false,
    version: '2.0.0',
    author: 'Son1kVerse Labs',
    color: '#FFD93D',
    parameters: [
      {
        id: 'quantum_drive',
        name: 'Quantum Drive',
        type: 'float',
        min: 0,
        max: 100,
        defaultValue: 25,
        currentValue: 25,
        unit: '%',
        description: 'Drive cuántico'
      },
      {
        id: 'dimensional_crush',
        name: 'Dimensional Crush',
        type: 'float',
        min: 0,
        max: 100,
        defaultValue: 0,
        currentValue: 0,
        unit: '%',
        description: 'Aplastamiento dimensional'
      }
    ],
    presets: [
      {
        id: 'cyber_crunch',
        name: 'Cyber Crunch',
        description: 'Crunch cyberpunk clásico',
        parameters: { quantum_drive: 65, dimensional_crush: 20 },
        category: 'crunch',
        author: 'Son1kVerse'
      }
    ]
  },

  // === SYNTHS ===
  {
    id: 'nexus-synthesizer',
    name: 'Nexus Synthesizer',
    symbol: '🎹',
    category: 'synth',
    description: 'Sintetizador Nexus con osciladores cuánticos',
    icon: '🎹',
    isActive: false,
    version: '2.0.0',
    author: 'Son1kVerse Labs',
    color: '#FF6B6B',
    parameters: [
      {
        id: 'quantum_oscillator',
        name: 'Quantum Oscillator',
        type: 'enum',
        defaultValue: 'sine',
        currentValue: 'sine',
        options: [
          { value: 'sine', label: 'Sine Wave' },
          { value: 'saw', label: 'Saw Wave' },
          { value: 'square', label: 'Square Wave' },
          { value: 'quantum', label: 'Quantum Wave' }
        ],
        description: 'Tipo de oscilador cuántico'
      },
      {
        id: 'nexus_frequency',
        name: 'Nexus Frequency',
        type: 'float',
        min: 20,
        max: 20000,
        defaultValue: 440,
        currentValue: 440,
        unit: 'Hz',
        description: 'Frecuencia del Nexus'
      }
    ],
    presets: [
      {
        id: 'cyber_lead',
        name: 'Cyber Lead',
        description: 'Lead sintético cyberpunk',
        parameters: { quantum_oscillator: 'saw', nexus_frequency: 880 },
        category: 'lead',
        author: 'Son1kVerse'
      }
    ]
  },

  // === FILTROS ===
  {
    id: 'dimensional-filter',
    name: 'Dimensional Filter',
    symbol: '🌊',
    category: 'filter',
    description: 'Filtro dimensional con resonancia espacial',
    icon: '🌊',
    isActive: false,
    version: '2.0.0',
    author: 'Son1kVerse Labs',
    color: '#4ECDC4',
    parameters: [
      {
        id: 'dimensional_cutoff',
        name: 'Dimensional Cutoff',
        type: 'float',
        min: 20,
        max: 20000,
        defaultValue: 1000,
        currentValue: 1000,
        unit: 'Hz',
        description: 'Cutoff dimensional'
      },
      {
        id: 'spatial_resonance',
        name: 'Spatial Resonance',
        type: 'float',
        min: 0,
        max: 100,
        defaultValue: 30,
        currentValue: 30,
        unit: '%',
        description: 'Resonancia espacial'
      }
    ],
    presets: [
      {
        id: 'space_sweep',
        name: 'Space Sweep',
        description: 'Sweep espacial automático',
        parameters: { dimensional_cutoff: 500, spatial_resonance: 60 },
        category: 'sweep',
        author: 'Son1kVerse'
      }
    ]
  }
];

interface PluginRackProps {
  onPluginToggle?: (plugin: SonicPlugin) => void;
  onParameterChange?: (pluginId: string, parameterId: string, value: any) => void;
  onPresetLoad?: (pluginId: string, preset: PluginPreset) => void;
}

export function PluginRack({ 
  onPluginToggle, 
  onParameterChange, 
  onPresetLoad 
}: PluginRackProps) {
  const [activePlugin, setActivePlugin] = useState<SonicPlugin | null>(null);
  const [plugins, setPlugins] = useState<SonicPlugin[]>(SONIC_PLUGINS);

  const handlePluginToggle = (plugin: SonicPlugin) => {
    const updatedPlugins = plugins.map(p => 
      p.id === plugin.id ? { ...p, isActive: !p.isActive } : p
    );
    setPlugins(updatedPlugins);
    onPluginToggle?.(plugin);
  };

  const handleParameterChange = (pluginId: string, parameterId: string, value: any) => {
    const updatedPlugins = plugins.map(plugin => {
      if (plugin.id === pluginId) {
        const updatedParameters = plugin.parameters.map(param =>
          param.id === parameterId ? { ...param, currentValue: value } : param
        );
        return { ...plugin, parameters: updatedParameters };
      }
      return plugin;
    });
    setPlugins(updatedPlugins);
    onParameterChange?.(pluginId, parameterId, value);
  };

  const handlePresetLoad = (pluginId: string, preset: PluginPreset) => {
    const updatedPlugins = plugins.map(plugin => {
      if (plugin.id === pluginId) {
        const updatedParameters = plugin.parameters.map(param => ({
          ...param,
          currentValue: preset.parameters[param.id] ?? param.defaultValue
        }));
        return { ...plugin, parameters: updatedParameters };
      }
      return plugin;
    });
    setPlugins(updatedPlugins);
    onPresetLoad?.(pluginId, preset);
  };

  const activePlugins = plugins.filter(p => p.isActive);
  const inactivePlugins = plugins.filter(p => !p.isActive);

  return (
    <div className="plugin-rack min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">🎚️ Plugin Rack</h1>
          <p className="text-gray-300">
            Plugins épicos del universo Son1kVerse - Tecnología cuántica para audio profesional
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Plugins */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Plugins Activos ({activePlugins.length})
            </h2>
            
            {activePlugins.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No hay plugins activos</p>
                <p className="text-sm text-gray-500 mt-2">Activa algunos plugins para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePlugins.map((plugin) => (
                  <motion.div
                    key={plugin.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="text-3xl p-3 rounded-lg"
                          style={{ backgroundColor: `${plugin.color}20` }}
                        >
                          {plugin.symbol}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{plugin.name}</h3>
                          <p className="text-sm text-gray-400">{plugin.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">v{plugin.version}</span>
                            <span className="text-xs text-gray-500">by {plugin.author}</span>
                            {plugin.wavesCompatible && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                Waves Compatible
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActivePlugin(plugin)}
                          className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePluginToggle(plugin)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Parameters */}
                    <div className="grid grid-cols-2 gap-4">
                      {plugin.parameters.slice(0, 2).map((param) => (
                        <div key={param.id}>
                          <label className="block text-sm font-medium text-cyan-400 mb-2">
                            {param.name}
                          </label>
                          {param.type === 'float' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                value={param.currentValue}
                                onChange={(e) => handleParameterChange(plugin.id, param.id, Number(e.target.value))}
                                className="flex-1"
                              />
                              <span className="text-sm text-gray-300 w-16">
                                {param.currentValue}{param.unit}
                              </span>
                            </div>
                          ) : param.type === 'enum' ? (
                            <select
                              value={param.currentValue}
                              onChange={(e) => handleParameterChange(plugin.id, param.id, e.target.value)}
                              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                            >
                              {param.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="checkbox"
                              checked={param.currentValue}
                              onChange={(e) => handleParameterChange(plugin.id, param.id, e.target.checked)}
                              className="w-4 h-4"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Plugin Browser */}
          <div>
            <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
              <Sliders className="w-6 h-6" />
              Plugin Browser
            </h2>
            
            <div className="space-y-3">
              {inactivePlugins.map((plugin) => (
                <motion.div
                  key={plugin.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePluginToggle(plugin)}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-600 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="text-2xl p-2 rounded-lg group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${plugin.color}20` }}
                    >
                      {plugin.symbol}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {plugin.name}
                      </h3>
                      <p className="text-xs text-gray-400">{plugin.category}</p>
                      <p className="text-xs text-gray-500 mt-1">{plugin.description}</p>
                    </div>
                    <button className="p-2 bg-green-500/20 text-green-400 rounded-lg group-hover:bg-green-500/30 transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Plugin Detail Modal */}
        <AnimatePresence>
          {activePlugin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setActivePlugin(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className="text-4xl p-4 rounded-lg"
                      style={{ backgroundColor: `${activePlugin.color}20` }}
                    >
                      {activePlugin.symbol}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{activePlugin.name}</h2>
                      <p className="text-gray-400">{activePlugin.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePlugin(null)}
                    className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Parameters */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Parámetros</h3>
                  {activePlugin.parameters.map((param) => (
                    <div key={param.id} className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        {param.name}
                      </label>
                      {param.type === 'float' ? (
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={param.min}
                            max={param.max}
                            value={param.currentValue}
                            onChange={(e) => handleParameterChange(activePlugin.id, param.id, Number(e.target.value))}
                            className="flex-1"
                          />
                          <input
                            type="number"
                            min={param.min}
                            max={param.max}
                            value={param.currentValue}
                            onChange={(e) => handleParameterChange(activePlugin.id, param.id, Number(e.target.value))}
                            className="w-20 p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                          />
                          <span className="text-sm text-gray-400 w-12">{param.unit}</span>
                        </div>
                      ) : param.type === 'enum' ? (
                        <select
                          value={param.currentValue}
                          onChange={(e) => handleParameterChange(activePlugin.id, param.id, e.target.value)}
                          className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                        >
                          {param.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="checkbox"
                          checked={param.currentValue}
                          onChange={(e) => handleParameterChange(activePlugin.id, param.id, e.target.checked)}
                          className="w-5 h-5"
                        />
                      )}
                      <p className="text-xs text-gray-500">{param.description}</p>
                    </div>
                  ))}
                </div>

                {/* Presets */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Presets</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {activePlugin.presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetLoad(activePlugin.id, preset)}
                        className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors text-left"
                      >
                        <h4 className="font-semibold text-white">{preset.name}</h4>
                        <p className="text-xs text-gray-400">{preset.description}</p>
                        <p className="text-xs text-gray-500 mt-1">by {preset.author}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
