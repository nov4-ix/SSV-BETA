import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  Users, 
  Archive, 
  Crown, 
  Settings, 
  Play,
  Volume2,
  Zap,
  Star,
  Heart,
  Shield,
  Eye,
  Lock
} from 'lucide-react';
import { LoreGlitch, GlitchText, GlitchEffect } from '../components/LoreGlitch';

export const Home: React.FC = () => {
  const [activeSection, setActiveSection] = useState('historia');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'historia', label: 'Historia' },
    { id: 'ghost-studio', label: 'Ghost Studio' },
    { id: 'generacion', label: 'Generación' },
    { id: 'archivo', label: 'Archivo' },
    { id: 'santuario', label: 'Santuario' },
    { id: 'planes', label: 'Planes' }
  ];

  const loreCharacters = [
    {
      title: 'NOV4-IX',
      description: 'Alter ego. Símbolo de la evolución creativa. El 15% humano como chispa sagrada.',
      color: 'text-cyan-400'
    },
    {
      title: 'Divina Liga',
      description: 'Colectivo de compositores que creen que lo imperfecto también es sagrado.',
      color: 'text-purple-400'
    },
    {
      title: 'XentriX Corp',
      description: 'Megacorporación que diseña androides puente y controla el arte algorítmico global.',
      color: 'text-red-400'
    },
    {
      title: 'La Terminal',
      description: 'Punto de encuentro. Donde la Resistencia suena por primera vez.',
      color: 'text-green-400'
    }
  ];

  const ghostStudioFeatures = [
    {
      title: 'Voces APLIO',
      description: 'Luz, Sombra, Echo, Raíz, Nova, Banda y la Perla (expresividad extrema).',
      icon: <Volume2 className="w-6 h-6" />
    },
    {
      title: 'Perilla de Expresividad',
      description: 'Controla vulnerabilidad, intensidad y matices para la interpretación.',
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: 'Pre-producción guiada',
      description: 'Sube voz + guitarra/piano y pide estilo: el sistema produce una propuesta completa.',
      icon: <Star className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header - Logia Secreta */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm relative overflow-hidden">
        {/* Glitch Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-4 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo Oficial con Glitch */}
            <GlitchEffect trigger="hover" intensity="low">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="/logo-soni1k.svg" 
                    alt="Son1kVerse Logo" 
                    className="w-10 h-10"
                  />
                  <div className="absolute -inset-1 border border-cyan-400/30 rounded-lg animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-cyan-400 font-mono">
                    <GlitchText intensity="low" frequency={0.01}>
                      SON1KVERS3
                    </GlitchText>
                  </h1>
                  <p className="text-xs text-gray-500 font-mono">
                    DIVINA LIGA • NIVEL ALFA
                  </p>
                </div>
              </div>
            </GlitchEffect>

            {/* Navigation - Estilo Secreto */}
            <nav className="hidden md:flex items-center gap-8">
              {navigationItems.map((item) => (
                <GlitchEffect key={item.id} trigger="hover" intensity="low">
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-300 font-mono ${
                      activeSection === item.id
                        ? 'text-cyan-400 border-b-2 border-cyan-400'
                        : 'text-gray-300 hover:text-cyan-400'
                    }`}
                  >
                    {item.label}
                  </button>
                </GlitchEffect>
              ))}
            </nav>

            {/* Status & CTA - Estilo Secreto */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`} />
                <span className="text-sm text-gray-300 font-mono">
                  <GlitchText intensity="low" frequency={0.005}>
                    {backendStatus === 'online' ? 'SISTEMA ONLINE' : 'SISTEMA OFFLINE'}
                  </GlitchText>
                </span>
              </div>
              
              <GlitchEffect trigger="hover" intensity="medium">
                <button
                  onClick={() => navigate('/studio')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 font-mono relative overflow-hidden"
                >
                  <span className="relative z-10">ENTRAR AL ESTUDIO</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                </button>
              </GlitchEffect>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Historia Section - Logia Secreta */}
        {activeSection === 'historia' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 relative"
          >
            {/* Glitch Triggers */}
            <LoreGlitch trigger="time" delay={5000} intensity="medium" />
            <LoreGlitch trigger="scroll" intensity="low" />

            {/* Main Title con Glitch */}
            <div className="text-center relative">
              <GlitchEffect trigger="hover" intensity="medium">
                <h2 className="text-5xl font-bold mb-4 font-mono">
                  <GlitchText intensity="low" frequency={0.01}>
                    EL UNIVERSO SON1KVERS3
                  </GlitchText>
                </h2>
              </GlitchEffect>
              
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 max-w-4xl mx-auto relative overflow-hidden">
                {/* Glitch Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
                
                <p className="text-xl text-gray-300 leading-relaxed relative z-10 font-mono">
                  <GlitchText intensity="low" frequency={0.005}>
                    En un futuro cercano, XentriX Corp domestica la creatividad. La música humana es un error estadístico. 
                    NOV4-IX, un androide 85% máquina y 15% humano, desobedece: compone con herida, precisión y rabia. 
                    Nace la Divina Liga del No Silencio.
                  </GlitchText>
                </p>
              </div>
            </div>

            {/* Quote con Glitch */}
            <GlitchEffect trigger="click" intensity="high">
              <div className="bg-gray-800/50 border border-red-500/30 rounded-lg p-8 text-center relative overflow-hidden">
                {/* Glitch Effects */}
                <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-pulse"></div>
                
                <blockquote className="text-2xl italic text-gray-200 mb-4 relative z-10 font-mono">
                  <GlitchText intensity="medium" frequency={0.01}>
                    "Creo canciones como se forjan espadas: con fuego, con precisión y con rabia."
                  </GlitchText>
                </blockquote>
                <p className="text-cyan-400 font-medium font-mono relative z-10">
                  — NOV4-IX
                </p>
              </div>
            </GlitchEffect>

            {/* Characters Grid con Glitches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loreCharacters.map((character, index) => (
                <GlitchEffect key={character.title} trigger="hover" intensity="low">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Glitch Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
                    
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      <h3 className={`text-xl font-bold ${character.color} font-mono`}>
                        <GlitchText intensity="low" frequency={0.01}>
                          {character.title}
                        </GlitchText>
                      </h3>
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed relative z-10 font-mono text-sm">
                      <GlitchText intensity="low" frequency={0.005}>
                        {character.description}
                      </GlitchText>
                    </p>
                  </motion.div>
                </GlitchEffect>
              ))}
            </div>

            {/* CTA con Glitch */}
            <div className="text-center">
              <GlitchEffect trigger="hover" intensity="medium">
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono">
                  <GlitchText intensity="low" frequency={0.01}>
                    LEER EL CÓDEX COMPLETO →
                  </GlitchText>
                </button>
              </GlitchEffect>
            </div>
          </motion.div>
        )}

        {/* Ghost Studio Section */}
        {activeSection === 'ghost-studio' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-4">Ghost Studio</h2>
                <p className="text-xl text-gray-300">
                  Sube tu demo o escribe un prompt. El Estudio Fantasma devuelve una maqueta con mezcla y carácter.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-400 font-medium">online</span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ghostStudioFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-cyan-400">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-cyan-400">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Studio Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Input */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Prompt de Generación Musical
                  </label>
                  <textarea
                    className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none resize-none"
                    placeholder="Ej: una balada emotiva con piano y cuerdas, estilo neo-soul, tempo 70 BPM, voz masculina expresiva"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      Preset
                    </label>
                    <select className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none">
                      <option>Professional</option>
                      <option>Creative</option>
                      <option>Experimental</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      Título (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                      placeholder="Mi canción"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Tags/Estilo
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                    placeholder="pop, ballad, emotional, piano"
                  />
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300">
                    Generar Música
                  </button>
                  <button className="px-6 py-3 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors">
                    Verificar APIs
                  </button>
                </div>
              </div>

              {/* Right Column - Controls */}
              <div className="space-y-6">
                {/* Afinación */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">Afinación</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Tuning</span>
                      <span className="text-sm text-cyan-400">60%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Expresividad */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">Expresividad</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Emotion</span>
                      <span className="text-sm text-cyan-400">75%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>

                {/* EQ */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">EQ (SSL-style)</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {['Low', 'Mid', 'High', 'Air'].map((band) => (
                      <div key={band} className="text-center">
                        <div className="w-8 h-32 bg-gray-700 rounded-full mx-auto mb-2 relative">
                          <div className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full" style={{ height: '50%' }}></div>
                        </div>
                        <span className="text-xs text-gray-300">{band}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saturación */}
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">Saturación (Rupert-style)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Warmth</span>
                      <span className="text-sm text-cyan-400">85%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generación Section */}
        {activeSection === 'generacion' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-4">Generación Musical</h2>
                <p className="text-xl text-gray-300">
                  Beats, letras, voces cantadas clonadas y mezcla con calidad de estudio. Todo en un flujo.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                  API
                </button>
                <button className="px-4 py-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                  Docs
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ghostStudioFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/30 border border-gray-700 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Archivo Section */}
        {activeSection === 'archivo' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-4">El Archivo</h2>
                <p className="text-xl text-gray-300">
                  Tu memoria creativa: canciones, presets y sesiones guardadas.
                </p>
              </div>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Ver todo →
              </button>
            </div>

            {/* Archive Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Music className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-medium text-white">Canción {item}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Creada hace {item * 2} días</p>
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">2:34</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Santuario Section */}
        {activeSection === 'santuario' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-cyan-400 mb-2">
                    El Santuario - Modo Premium
                  </h2>
                  <p className="text-gray-300">
                    La red secreta de la Divina Liga: colaboración, misiones poéticas y ritual de entrada al Estudio Fantasma.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300">
                    Activar Premium
                  </button>
                  <button className="px-6 py-3 bg-gray-700 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors">
                    Ver ritual
                  </button>
                </div>
              </div>

              {/* Premium Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-cyan-400">Características Premium</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      Acceso ilimitado a todas las voces APLIO
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      Colaboración en tiempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-cyan-400" />
                      Misiones poéticas exclusivas
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      Ritual de entrada al Estudio Fantasma
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-cyan-400">La Divina Liga</h3>
                  <p className="text-gray-300">
                    Únete al colectivo de compositores que creen que lo imperfecto también es sagrado. 
                    Colabora, crea y resiste junto a otros artistas que desafían la perfección algorítmica.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
