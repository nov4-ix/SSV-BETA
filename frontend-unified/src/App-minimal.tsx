import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Users, 
  Zap, 
  Settings, 
  BarChart3, 
  Play,
  Volume2,
  VolumeX,
  Palette
} from 'lucide-react';

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

function ColorPaletteManager({ isOpen, onClose, onPaletteChange }: any) {
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
    }
  ]);

  const savePalette = () => {
    localStorage.setItem('son1kvers3_palette', JSON.stringify(palette));
    onPaletteChange(palette);
  };

  const applyPreset = (preset: any) => {
    setPalette(preset.colors);
    localStorage.setItem('son1kvers3_palette', JSON.stringify(preset.colors));
    onPaletteChange(preset.colors);
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Gestión de Colores</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="text-gray-400">×</span>
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Presets Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Editor Personalizado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={savePalette}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'colors'>('dashboard');
  const [showColorPalette, setShowColorPalette] = useState(false);

  const modules = [
    {
      id: 'studio',
      name: 'Ghost Studio',
      description: 'Producción musical con Suno AI',
      icon: Music,
      color: '#00FFE7',
      stats: '1247 generaciones',
    },
    {
      id: 'users',
      name: 'Sanctuary Social',
      description: 'Red social colaborativa',
      icon: Users,
      color: '#B84DFF',
      stats: '89 usuarios activos',
    },
    {
      id: 'automation',
      name: 'Nova Post Pilot',
      description: 'Automatización de redes sociales',
      icon: Zap,
      color: '#9AF7EE',
      stats: '12 posts programados',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Métricas y estadísticas',
      icon: BarChart3,
      color: '#FFD93D',
      stats: '98.5% uptime',
    },
    {
      id: 'colors',
      name: 'Color Palette',
      description: 'Gestión de colores del sistema',
      icon: Palette,
      color: '#FF6B9D',
      stats: 'Personalización visual',
    },
  ];

  const handleModuleClick = (moduleId: string) => {
    if (moduleId === 'colors') {
      setShowColorPalette(true);
    }
  };

  const handlePaletteChange = (newPalette: any) => {
    console.log('Nueva paleta aplicada:', newPalette);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-cyan-400">Son1kvers3 Admin</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-300">online</span>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-cyan-400 mb-8">Panel de Administración</h2>
          <p className="text-gray-300 mb-6">Bienvenido al panel de administración unificado</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <motion.div
                key={module.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleModuleClick(module.id)}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-gray-600 transition-colors group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${module.color}20` }}
                  >
                    <module.icon 
                      className="w-6 h-6" 
                      style={{ color: module.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-400">{module.stats}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{module.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <ColorPaletteManager 
        isOpen={showColorPalette}
        onClose={() => setShowColorPalette(false)}
        onPaletteChange={handlePaletteChange}
      />
    </div>
  );
}

export default App;

