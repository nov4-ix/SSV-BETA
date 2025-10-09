import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '../components/effects/matrix-rain';
import { NexusScene } from '../components/effects/nexus-scene';
import { GhostStudio } from './ghost-studio';
import { 
  Music, 
  Users, 
  Zap, 
  Settings, 
  BarChart3, 
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

interface DashboardStats {
  totalGenerations: number;
  activeUsers: number;
  systemStatus: 'online' | 'maintenance' | 'offline';
  recentActivity: Array<{
    id: string;
    type: 'generation' | 'user' | 'system';
    message: string;
    timestamp: string;
  }>;
}

export function UnifiedDashboard() {
  const [activeView, setActiveView] = useState<'nexus' | 'studio' | 'dashboard'>('nexus');
  const [matrixIntensity, setMatrixIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [ambientSound, setAmbientSound] = useState(false);
  const navigate = useNavigate();

  // Mock stats - in real app, this would come from API
  const [stats] = useState<DashboardStats>({
    totalGenerations: 1247,
    activeUsers: 89,
    systemStatus: 'online',
    recentActivity: [
      {
        id: '1',
        type: 'generation',
        message: 'Nueva generación completada: "Cyberpunk Dreams"',
        timestamp: '2 min ago',
      },
      {
        id: '2',
        type: 'user',
        message: 'Usuario @neon_music se unió a la plataforma',
        timestamp: '5 min ago',
      },
      {
        id: '3',
        type: 'generation',
        message: 'Generación fallida: "Ambient Forest" - reintentando',
        timestamp: '8 min ago',
      },
    ],
  });

  const modules = [
    {
      id: 'studio',
      name: 'Ghost Studio',
      description: 'Producción musical con Suno AI',
      icon: Music,
      color: '#00FFE7',
      stats: `${stats.totalGenerations} generaciones`,
    },
    {
      id: 'users',
      name: 'Sanctuary Social',
      description: 'Red social colaborativa',
      icon: Users,
      color: '#B84DFF',
      stats: `${stats.activeUsers} usuarios activos`,
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
  ];

  const handleModuleClick = (moduleId: string) => {
    switch (moduleId) {
      case 'studio':
        setActiveView('studio');
        break;
      case 'users':
        navigate('/sanctuary');
        break;
      case 'automation':
        navigate('/nova-pilot');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      default:
        break;
    }
  };

  const toggleAmbientSound = () => {
    setAmbientSound(!ambientSound);
    // In real app, this would control actual ambient audio
  };

  return (
    <div className="unified-dashboard min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <MatrixRain intensity={matrixIntensity} />
      
      {/* Ambient Sound Overlay */}
      {ambientSound && (
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none z-0" />
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b border-gray-800"
        >
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-cyan-400">Son1kvers3</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stats.systemStatus === 'online' ? 'bg-green-500' : 
                stats.systemStatus === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-300 capitalize">{stats.systemStatus}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Controls */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleAmbientSound}
              className={`p-2 border rounded-lg transition-colors ${
                ambientSound 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
              }`}
            >
              <Play className="w-5 h-5" />
            </button>

            {/* Matrix Intensity Control */}
            <select
              value={matrixIntensity}
              onChange={(e) => setMatrixIntensity(e.target.value as 'low' | 'medium' | 'high')}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="low">Matrix: Low</option>
              <option value="medium">Matrix: Medium</option>
              <option value="high">Matrix: High</option>
            </select>

            <button
              onClick={() => navigate('/settings')}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {activeView === 'nexus' && (
            <motion.div
              key="nexus"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <NexusScene 
                onIconClick={(icon, index) => {
                  if (icon.module === 'music-generation') {
                    setActiveView('studio');
                  } else {
                    navigate(icon.url);
                  }
                }}
              />
            </motion.div>
          )}

          {activeView === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <GhostStudio />
            </motion.div>
          )}

          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="p-6"
            >
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-cyan-400 mb-8">Dashboard Principal</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Generaciones Totales</h3>
                    <p className="text-3xl font-bold text-white">{stats.totalGenerations.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-1">+12% este mes</p>
                  </div>
                  
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">Usuarios Activos</h3>
                    <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
                    <p className="text-sm text-gray-400 mt-1">En línea ahora</p>
                  </div>
                  
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Estado del Sistema</h3>
                    <p className="text-3xl font-bold text-white capitalize">{stats.systemStatus}</p>
                    <p className="text-sm text-gray-400 mt-1">98.5% uptime</p>
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                {/* Recent Activity */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-4">Actividad Reciente</h3>
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'generation' ? 'bg-cyan-500' :
                          activity.type === 'user' ? 'bg-purple-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white">{activity.message}</p>
                          <p className="text-sm text-gray-400">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 p-4"
        >
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setActiveView('nexus')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'nexus' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Nexus
            </button>
            <button
              onClick={() => setActiveView('studio')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'studio' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'dashboard' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Dashboard
            </button>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
