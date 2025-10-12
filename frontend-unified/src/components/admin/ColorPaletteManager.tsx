import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCcw, Palette } from 'lucide-react';

interface ColorPalette {
  bg: string;
  panel: string;
  card: string;
  ink: string;
  text: string;
  muted: string;
  neon: string;
  pink: string;
  gold: string;
  purple: string;
  cyan: string;
  status: {
    online: string;
    offline: string;
  };
}

interface ColorPaletteManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onPaletteChange: (palette: ColorPalette) => void;
}

export function ColorPaletteManager({ isOpen, onClose, onPaletteChange }: ColorPaletteManagerProps) {
  const [palette, setPalette] = useState<ColorPalette>({
    bg: "#1A1A2E",
    panel: "#16213E", 
    card: "#0F3460",
    ink: "#333344",
    text: "#FFFFFF",
    muted: "#888888",
    neon: "#66FF66",
    pink: "#ff1744",
    gold: "#ffd700",
    purple: "#9c27b0",
    cyan: "#00bcd4",
    status: {
      online: "#4caf50",
      offline: "#f44336"
    }
  });

  const [presets] = useState([
    {
      name: "Son1kvers3 Original",
      colors: {
        bg: "#1A1A2E",
        panel: "#16213E",
        card: "#0F3460", 
        ink: "#333344",
        text: "#FFFFFF",
        muted: "#888888",
        neon: "#66FF66",
        pink: "#ff1744",
        gold: "#ffd700",
        purple: "#9c27b0",
        cyan: "#00bcd4",
        status: {
          online: "#4caf50",
          offline: "#f44336"
        }
      }
    },
    {
      name: "Dark Cyberpunk",
      colors: {
        bg: "#0a0a0a",
        panel: "#111111",
        card: "#1a1a1a",
        ink: "#333333",
        text: "#ffffff",
        muted: "#a0a0a0",
        neon: "#ff6b35",
        pink: "#ff1744",
        gold: "#ffd700",
        purple: "#9c27b0",
        cyan: "#00bcd4",
        status: {
          online: "#4caf50",
          offline: "#f44336"
        }
      }
    },
    {
      name: "Neon Purple",
      colors: {
        bg: "#1a0a2e",
        panel: "#16213e",
        card: "#0f3460",
        ink: "#4a148c",
        text: "#ffffff",
        muted: "#e1bee7",
        neon: "#e91e63",
        pink: "#ff1744",
        gold: "#ffd700",
        purple: "#9c27b0",
        cyan: "#00bcd4",
        status: {
          online: "#4caf50",
          offline: "#f44336"
        }
      }
    },
    {
      name: "Ocean Blue",
      colors: {
        bg: "#0a1929",
        panel: "#132f4c",
        card: "#1e4976",
        ink: "#2d5a87",
        text: "#ffffff",
        muted: "#a8c8ec",
        neon: "#00bcd4",
        pink: "#ff1744",
        gold: "#ffd700",
        purple: "#9c27b0",
        cyan: "#00bcd4",
        status: {
          online: "#4caf50",
          offline: "#f44336"
        }
      }
    }
  ]);

  // Cargar paleta guardada
  useEffect(() => {
    const savedPalette = localStorage.getItem('son1kvers3_palette');
    if (savedPalette) {
      try {
        setPalette(JSON.parse(savedPalette));
      } catch (error) {
        console.error('Error loading saved palette:', error);
      }
    }
  }, []);

  // Guardar paleta
  const savePalette = () => {
    localStorage.setItem('son1kvers3_palette', JSON.stringify(palette));
    onPaletteChange(palette);
  };

  // Aplicar preset
  const applyPreset = (preset: any) => {
    setPalette(preset.colors);
    localStorage.setItem('son1kvers3_palette', JSON.stringify(preset.colors));
    onPaletteChange(preset.colors);
  };

  // Actualizar color
  const updateColor = (key: string, value: string, isStatus = false) => {
    if (isStatus) {
      setPalette(prev => ({
        ...prev,
        status: {
          ...prev.status,
          [key]: value
        }
      }));
    } else {
      setPalette(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Resetear a valores por defecto
  const resetPalette = () => {
    const defaultPalette = presets[0].colors;
    setPalette(defaultPalette);
    localStorage.setItem('son1kvers3_palette', JSON.stringify(defaultPalette));
    onPaletteChange(defaultPalette);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Gestión de Colores</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Presets */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Presets Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {presets.map((preset, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => applyPreset(preset)}
                className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-cyan-400 transition-colors text-left"
              >
                <div className="flex gap-2 mb-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.bg }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.neon }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.pink }} />
                </div>
                <h4 className="text-white font-medium">{preset.name}</h4>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Editor de Colores */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Editor Personalizado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colores principales */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-white">Colores Principales</h4>
              {Object.entries(palette).filter(([key]) => key !== 'status').map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm text-gray-300 min-w-[80px] capitalize">
                    {key}:
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-10 h-10 border border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Colores de estado */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-white">Colores de Estado</h4>
              {Object.entries(palette.status).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm text-gray-300 min-w-[80px] capitalize">
                    {key}:
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateColor(key, e.target.value, true)}
                    className="w-10 h-10 border border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateColor(key, e.target.value, true)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Vista Previa</h3>
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: palette.bg,
              borderColor: palette.ink,
              color: palette.text
            }}
          >
            <div 
              className="p-4 rounded mb-4"
              style={{ backgroundColor: palette.panel }}
            >
              <h4 className="font-semibold mb-2">Panel de Ejemplo</h4>
              <p style={{ color: palette.muted }}>Texto secundario con color muted</p>
            </div>
            
            <div className="flex gap-4">
              <button 
                className="px-4 py-2 rounded font-medium"
                style={{ 
                  backgroundColor: palette.neon,
                  color: palette.bg,
                  boxShadow: `0 0 20px ${palette.neon}40`
                }}
              >
                Botón Neon
              </button>
              <button 
                className="px-4 py-2 rounded font-medium"
                style={{ 
                  backgroundColor: palette.pink,
                  color: palette.text
                }}
              >
                Botón Rosa
              </button>
              <div 
                className="px-4 py-2 rounded"
                style={{ 
                  backgroundColor: palette.card,
                  border: `1px solid ${palette.ink}`
                }}
              >
                Card Ejemplo
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={resetPalette}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Resetear
          </button>
          <button
            onClick={savePalette}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
