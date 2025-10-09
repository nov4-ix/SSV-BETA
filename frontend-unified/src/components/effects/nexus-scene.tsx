import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface NexusIcon {
  symbol: string;
  label: string;
  description: string;
  color: string;
  status: 'online' | 'offline' | 'operational';
  url: string;
  module: string;
}

interface NexusSceneProps {
  onIconClick?: (icon: NexusIcon, index: number) => void;
  enableAnimations?: boolean;
}

export function NexusScene({ onIconClick, enableAnimations = true }: NexusSceneProps) {
  const [activeIcon, setActiveIcon] = useState<number | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const navigate = useNavigate();

  // Updated icons with real backend integration
  const icons: NexusIcon[] = [
    {
      symbol: '🎵',
      label: 'Ghost Studio',
      description: 'Producción musical con Suno AI',
      color: '#00FFE7',
      status: 'online',
      url: '/studio',
      module: 'music-generation',
    },
    {
      symbol: '🎭',
      label: 'Clone Station',
      description: 'Clonación de voz y datasets',
      color: '#B84DFF',
      status: 'online',
      url: '/clone-station',
      module: 'voice-cloning',
    },
    {
      symbol: '🚀',
      label: 'Nova Post Pilot',
      description: 'Automatización de redes sociales',
      color: '#9AF7EE',
      status: 'online',
      url: '/nova-pilot',
      module: 'social-automation',
    },
    {
      symbol: '🏛️',
      label: 'Sanctuary Social',
      description: 'Red social colaborativa',
      color: '#00FFE7',
      status: 'online',
      url: '/sanctuary',
      module: 'social-network',
    },
    {
      symbol: '🏠',
      label: 'Dashboard',
      description: 'Panel principal',
      color: '#B84DFF',
      status: 'online',
      url: '/dashboard',
      module: 'dashboard',
    },
    {
      symbol: '⚙️',
      label: 'System Core',
      description: 'Configuración del sistema',
      color: '#9AF7EE',
      status: 'operational',
      url: '/settings',
      module: 'settings',
    },
  ];

  // Pulse animation
  useEffect(() => {
    if (!enableAnimations) return;

    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [enableAnimations]);

  // Calculate icon positions around the circle
  const iconPositions = icons.map((icon, index) => {
    const angle = (index * 60) * (Math.PI / 180); // 60 degrees between each icon
    const radius = 120; // Circle radius
    const pulseOffset = enableAnimations ? Math.sin(pulsePhase + index) * 2 : 0;

    return {
      ...icon,
      x: Math.cos(angle) * (radius + pulseOffset),
      y: Math.sin(angle) * (radius + pulseOffset),
      angle: angle,
      isActive: activeIcon === index,
    };
  });

  const handleIconClick = (icon: NexusIcon, index: number) => {
    setActiveIcon(activeIcon === index ? null : index);

    // Real navigation with React Router
    if (icon.url) {
      navigate(icon.url);
    }

    if (onIconClick) {
      onIconClick(icon, index);
    }
  };

  return (
    <div className="nexus-scene relative w-full h-screen overflow-hidden bg-black">
      {/* Ring with glitch effects */}
      <div className="ring-container absolute inset-0 flex items-center justify-center">
        <motion.div
          className="ring w-80 h-80 border-2 border-purple-500 rounded-full"
          animate={enableAnimations ? {
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {enableAnimations && (
          <motion.div
            className="ring-pulse absolute w-80 h-80 border border-purple-400 rounded-full"
            style={{
              transform: `scale(${1 + Math.sin(pulsePhase) * 0.05})`,
              opacity: 0.3 + Math.sin(pulsePhase) * 0.2,
            }}
          />
        )}
      </div>

      {/* Centered content */}
      <div className="nexus-center absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.h1
          className="nexus-title text-4xl font-bold text-cyan-400 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          NEXUS ACTIVADO
        </motion.h1>
        <motion.p
          className="nexus-sub text-lg text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          ¡Bienvenido a la Resistencia!
        </motion.p>

        {activeIcon !== null && (
          <motion.div
            className="icon-info text-center max-w-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: iconPositions[activeIcon]?.color }}
            >
              {iconPositions[activeIcon]?.label}
            </h3>
            <p className="text-gray-300 mb-4">
              {iconPositions[activeIcon]?.description}
            </p>
            <span className="status-indicator inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              Status: {iconPositions[activeIcon]?.status}
            </span>
          </motion.div>
        )}
      </div>

      {/* Icons around the ring */}
      <div className="icons-container absolute inset-0">
        {iconPositions.map((icon, index) => (
          <motion.div
            key={index}
            className={`nexus-icon absolute cursor-pointer group ${
              icon.isActive ? 'active' : ''
            }`}
            style={{
              left: `calc(50% + ${icon.x}px)`,
              top: `calc(50% + ${icon.y}px)`,
              transform: 'translate(-50%, -50%)',
              '--icon-color': icon.color,
            } as React.CSSProperties}
            title={`${icon.label} - ${icon.description}`}
            onClick={() => handleIconClick(icon, index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="relative">
              <span className="icon-symbol text-4xl block group-hover:scale-110 transition-transform duration-300">
                {icon.symbol}
              </span>
              <div
                className="icon-glow absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                style={{
                  backgroundColor: icon.color,
                  filter: 'blur(10px)',
                }}
              />
              <div
                className={`status-dot absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  icon.status === 'online'
                    ? 'bg-green-500'
                    : icon.status === 'operational'
                    ? 'bg-blue-500'
                    : 'bg-red-500'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
