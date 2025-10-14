import React, { useState, useEffect, useRef } from 'react';

interface NexusVisualProps {
  className?: string;
}

interface FallingElement {
  id: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  char: string;
  fontSize: number;
}

const NexusVisual({ className = '' }: NexusVisualProps) {
  const [fallingElements, setFallingElements] = useState<FallingElement[]>([]);
  const [pulsePhase, setPulsePhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Componentes del Son1kVerse
  const components = [
    { id: 'alvae', name: 'ALVAE', color: '#00FFE7', position: 'top-left' },
    { id: 'ghost-studio', name: 'GHOST STUDIO', color: '#00FFE7', position: 'mid-left' },
    { id: 'codex', name: 'CODEX', color: '#00FFE7', position: 'bottom-left' },
    { id: 'resistencia', name: 'Resistencia', color: '#FF00FF', position: 'top-right' },
    { id: 'clone-station', name: 'CLONE STATION', color: '#FF00FF', position: 'mid-right' },
    { id: 'son1kverse', name: 'Son1kVers3', color: '#00FFE7', position: 'bottom-right-1' },
    { id: 'la-liga', name: 'LA LIGA', color: '#FF00FF', position: 'bottom-right-2' }
  ];

  // Caracteres para la lluvia Matrix
  const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

  // Crear elementos cayendo tipo Matrix
  const createFallingElement = (): FallingElement => {
    const colors = ['#00FFE7', '#FF00FF', '#00BFFF', '#FF1493'];
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * window.innerWidth,
      y: -50,
      speed: 1 + Math.random() * 3,
      size: 8 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.4 + Math.random() * 0.6,
      rotation: Math.random() * 360,
      char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
      fontSize: 14 + Math.random() * 8
    };
  };

  // Animación de elementos cayendo
  useEffect(() => {
    const animate = () => {
      setFallingElements(prev => {
        // Mover elementos existentes
        const moved = prev.map(element => ({
          ...element,
          y: element.y + element.speed,
          rotation: element.rotation + 0.5,
          opacity: Math.max(0, element.opacity - 0.002) // Desvanecimiento gradual
        })).filter(element => element.y < window.innerHeight + 100 && element.opacity > 0.1);

        // Agregar nuevos elementos más frecuentemente
        const newElements = Math.random() < 0.4 ? [createFallingElement()] : [];
        
        return [...moved, ...newElements];
      });

      // Pulso del círculo central
      setPulsePhase(prev => (prev + 0.03) % (Math.PI * 2));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Dibujar elementos cayendo en canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawFallingElements = () => {
      // Limpiar canvas con fondo semi-transparente para efecto de trail
      ctx.fillStyle = 'rgba(10, 12, 16, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      fallingElements.forEach(element => {
        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.globalAlpha = element.opacity;
        ctx.fillStyle = element.color;
        ctx.font = `${element.fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Dibujar carácter
        ctx.fillText(element.char, 0, 0);
        
        // Efecto de glow
        ctx.shadowColor = element.color;
        ctx.shadowBlur = 10;
        ctx.fillText(element.char, 0, 0);
        
        ctx.restore();
      });
    };

    const interval = setInterval(drawFallingElements, 16);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [fallingElements]);

  const getComponentPosition = (position: string) => {
    const positions = {
      'top-left': 'top-4 left-4',
      'mid-left': 'top-1/2 left-4 transform -translate-y-1/2',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'mid-right': 'top-1/2 right-4 transform -translate-y-1/2',
      'bottom-right-1': 'bottom-16 right-4',
      'bottom-right-2': 'bottom-4 right-4'
    };
    return positions[position as keyof typeof positions] || '';
  };

  return (
    <div className={`nexus-visual ${className}`}>
      {/* Canvas para elementos cayendo */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'transparent' }}
      />

      {/* Fondo con efectos */}
      <div className="absolute inset-0 bg-black bg-opacity-90">
        {/* Líneas de energía */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
              style={{
                left: `${(i * 100) % window.innerWidth}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Logo central como marca de agua */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        {/* Círculo púrpura translúcido */}
        <div
          className="w-[400px] h-[400px] rounded-full relative"
          style={{
            background: 'radial-gradient(circle, rgba(156,39,176,0.15) 0%, rgba(156,39,176,0.08) 50%, transparent 80%)',
            border: '2px solid rgba(156,39,176,0.3)',
            boxShadow: `
              0 0 80px rgba(156,39,176,0.4),
              0 0 160px rgba(156,39,176,0.2),
              inset 0 0 60px rgba(156,39,176,0.1)
            `,
            transform: `scale(${1 + Math.sin(pulsePhase) * 0.03})`,
            animation: 'logo-pulse 4s ease-in-out infinite alternate'
          }}
        >
          {/* Rayo central */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="opacity-60"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(156,39,176,0.8))',
                animation: 'lightning-glow 2s ease-in-out infinite alternate'
              }}
            >
              <path
                d="M60 20 L40 60 L50 60 L35 100 L65 60 L55 60 Z"
                fill="rgba(156,39,176,0.8)"
                stroke="rgba(156,39,176,0.6)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Efectos de energía sutiles */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-px bg-gradient-to-b from-transparent via-purple-400 to-transparent opacity-20"
                style={{
                  height: `${20 + Math.random() * 40}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  animation: 'energy-line 3s ease-in-out infinite alternate'
                }}
              />
            ))}
          </div>

          {/* Partículas orbitales sutiles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-40"
              style={{
                left: `${50 + Math.cos((i * 45) * Math.PI / 180) * 35}%`,
                top: `${50 + Math.sin((i * 45) * Math.PI / 180) * 35}%`,
                animation: `orbit-subtle-${i} 6s linear infinite`,
                animationDelay: `${i * 0.5}s`,
                boxShadow: '0 0 8px rgba(156,39,176,0.6)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Título NEXUS */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30">
        <h1
          className="text-6xl font-bold text-cyan-400 text-center"
          style={{
            textShadow: `
              0 0 10px rgba(0,255,231,0.8),
              0 0 20px rgba(0,255,231,0.6),
              0 0 30px rgba(0,255,231,0.4)
            `,
            animation: 'text-glow 2s ease-in-out infinite alternate'
          }}
        >
          NEXUS
        </h1>
      </div>

      {/* Componentes alrededor */}
      {components.map((component) => (
        <div
          key={component.id}
          className={`absolute z-20 ${getComponentPosition(component.position)}`}
        >
          {component.position.includes('right') && component.position !== 'bottom-right-1' ? (
            // Componentes en cajas (derecha)
            <div
              className="px-4 py-2 border border-dashed rounded"
              style={{
                borderColor: component.color,
                color: component.color,
                boxShadow: `0 0 10px ${component.color}40`,
                animation: 'component-glow 3s ease-in-out infinite alternate'
              }}
            >
              {component.name}
            </div>
          ) : (
            // Componentes como texto (izquierda y algunos de derecha)
            <div
              className="text-lg font-semibold"
              style={{
                color: component.color,
                textShadow: `0 0 10px ${component.color}80`,
                animation: 'text-glow 2s ease-in-out infinite alternate'
              }}
            >
              {component.name}
            </div>
          )}
        </div>
      ))}

      {/* Paneles inferiores */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-8">
        {[
          { icon: '💎', label: 'GHOST STUDIO', color: '#00FFE7' },
          { icon: '👤', label: 'CODEX', color: '#00FFE7' },
          { icon: '📄', label: 'CLONE STATION', color: '#FF00FF' },
          { icon: '📖', label: 'LA LIGA', color: '#FF00FF' }
        ].map((panel, index) => (
          <div
            key={index}
            className="px-6 py-4 border border-dashed rounded-lg bg-black bg-opacity-50 backdrop-blur-sm"
            style={{
              borderColor: panel.color,
              boxShadow: `0 0 20px ${panel.color}40`,
              animation: 'panel-glow 4s ease-in-out infinite alternate',
              animationDelay: `${index * 0.5}s`
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{panel.icon}</div>
              <div
                className="text-sm font-semibold"
                style={{ color: panel.color }}
              >
                {panel.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estilos CSS */}
      <style>{`
        @keyframes logo-pulse {
          0% { 
            box-shadow: 
              0 0 80px rgba(156,39,176,0.4),
              0 0 160px rgba(156,39,176,0.2),
              inset 0 0 60px rgba(156,39,176,0.1);
            opacity: 0.6;
          }
          100% { 
            box-shadow: 
              0 0 120px rgba(156,39,176,0.6),
              0 0 240px rgba(156,39,176,0.3),
              inset 0 0 90px rgba(156,39,176,0.15);
            opacity: 0.8;
          }
        }

        @keyframes lightning-glow {
          0% { 
            filter: drop-shadow(0 0 20px rgba(156,39,176,0.8));
            opacity: 0.6;
          }
          100% { 
            filter: drop-shadow(0 0 30px rgba(156,39,176,1));
            opacity: 0.9;
          }
        }

        @keyframes energy-line {
          0% { opacity: 0.1; transform: rotate(0deg) scaleY(0.3); }
          50% { opacity: 0.3; transform: rotate(180deg) scaleY(1); }
          100% { opacity: 0.1; transform: rotate(360deg) scaleY(0.3); }
        }

        @keyframes text-glow {
          0% { text-shadow: 0 0 10px rgba(0,255,231,0.8), 0 0 20px rgba(0,255,231,0.6), 0 0 30px rgba(0,255,231,0.4); }
          100% { text-shadow: 0 0 20px rgba(0,255,231,1), 0 0 40px rgba(0,255,231,0.8), 0 0 60px rgba(0,255,231,0.6); }
        }

        @keyframes energy-flow {
          0% { opacity: 0.4; transform: translateX(-50%) scaleY(0.3); }
          50% { opacity: 1; transform: translateX(-50%) scaleY(1.5); }
          100% { opacity: 0.4; transform: translateX(-50%) scaleY(0.3); }
        }

        @keyframes glitch-line {
          0% { opacity: 0.2; transform: rotate(0deg) scaleY(0.5); }
          50% { opacity: 0.8; transform: rotate(180deg) scaleY(1.2); }
          100% { opacity: 0.2; transform: rotate(360deg) scaleY(0.5); }
        }

        @keyframes component-glow {
          0% { box-shadow: 0 0 10px rgba(0,255,231,0.4); }
          100% { box-shadow: 0 0 20px rgba(0,255,231,0.8), 0 0 30px rgba(0,255,231,0.4); }
        }

        @keyframes panel-glow {
          0% { box-shadow: 0 0 20px rgba(0,255,231,0.4); }
          100% { box-shadow: 0 0 40px rgba(0,255,231,0.8), 0 0 60px rgba(0,255,231,0.4); }
        }

        /* Animaciones orbitales sutiles para las partículas del logo */
        ${Array.from({ length: 8 }).map((_, i) => `
          @keyframes orbit-subtle-${i} {
            0% { transform: rotate(${i * 45}deg) translateX(140px) rotate(-${i * 45}deg); }
            100% { transform: rotate(${i * 45 + 360}deg) translateX(140px) rotate(-${i * 45 + 360}deg); }
          }
        `).join('')}

        .nexus-visual {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.98) 100%);
        }

        /* Efectos de líneas horizontales de fondo */
        .nexus-visual::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(90deg, transparent 0%, rgba(0,255,231,0.1) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(255,0,255,0.05) 50%, transparent 100%);
          background-size: 200px 2px, 2px 200px;
          animation: scan-lines 10s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes scan-lines {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}

export default NexusVisual;
