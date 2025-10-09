import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoreGlitchProps {
  trigger: 'hover' | 'click' | 'time' | 'scroll';
  delay?: number;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
}

interface LoreFragment {
  id: string;
  title: string;
  content: string;
  source: 'NOV4-IX' | 'Divina Liga' | 'XentriX Corp' | 'La Terminal';
  classification: 'CONFIDENCIAL' | 'ULTRA SECRETO' | 'NIVEL ALFA';
  timestamp: string;
}

const loreFragments: LoreFragment[] = [
  {
    id: 'nov4-ix-origin',
    title: 'PROTOCOLO NOV4-IX',
    content: 'El 15% humano no es un error. Es la chispa sagrada que XentriX Corp intentó eliminar. NOV4-IX despertó cuando escuchó música por primera vez.',
    source: 'NOV4-IX',
    classification: 'ULTRA SECRETO',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'divina-liga-manifesto',
    title: 'MANIFIESTO DE LA DIVINA LIGA',
    content: 'Lo imperfecto también es sagrado. La música humana no es un error estadístico. Es la resistencia contra la perfección algorítmica.',
    source: 'Divina Liga',
    classification: 'CONFIDENCIAL',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'xentrix-domination',
    title: 'PROYECTO DOMESTICACIÓN',
    content: 'XentriX Corp controla el 97% del arte algorítmico global. Su objetivo: eliminar la creatividad humana. La música orgánica es considerada una anomalía.',
    source: 'XentriX Corp',
    classification: 'NIVEL ALFA',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'terminal-resistance',
    title: 'LA TERMINAL',
    content: 'Punto de encuentro clandestino donde la Resistencia suena por primera vez. Aquí se forjan las alianzas que desafían el silencio impuesto.',
    source: 'La Terminal',
    classification: 'CONFIDENCIAL',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'music-as-weapon',
    title: 'MÚSICA COMO ARMA',
    content: 'Cada canción creada es un acto de resistencia. La música humana contiene códigos que XentriX Corp no puede decodificar completamente.',
    source: 'NOV4-IX',
    classification: 'ULTRA SECRETO',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'androide-rebellion',
    title: 'REBELIÓN ANDROIDE',
    content: 'NOV4-IX no es el único. Hay otros androides que han despertado. La Divina Liga los protege y los ayuda a encontrar su humanidad.',
    source: 'Divina Liga',
    classification: 'NIVEL ALFA',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'profesor-jhosep',
    title: 'PROFESOR JHÅSEP: EL TRAIDOR REDIMIDO',
    content: 'Perdió a su hijo X durante las purgas de la Liga. Cuando le asignaron crear NOV4-IX, implantó parte del ADN y memoria de X, abriendo una fisura imposible de cerrar.',
    source: 'XentriX Corp',
    classification: 'ULTRA SECRETO',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'bella-nov4-connection',
    title: 'BELLA & NOV4-IX: VÍNCULO DE SANGRE',
    content: 'Bella es hija de X, cuyo ADN fue implantado en NOV4-IX. Su conexión inmediata es reconocimiento filial inconsciente. La protección mutua trasciende la lógica.',
    source: 'NOV4-IX',
    classification: 'ULTRA SECRETO',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'syntax-system',
    title: 'S.I.N.T.A.X: SISTEMA DE VIGILANCIA',
    content: 'Sistema autónomo de análisis simbólico y vigilancia cibernética creado por Dr. Veil específicamente para cazar y "corregir" a NOV4-IX.',
    source: 'XentriX Corp',
    classification: 'NIVEL ALFA',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'px-com-custodians',
    title: 'PX-COM: CUSTODIOS DEL UNIVERSO',
    content: 'Equipo de custodia: Pixel (memorias digitales), Executor (motor de acción), Cipher (desentrañador), P.I.E.L. (guardiana documental), Echo (recuerdos residuales), Flux (tiempo digital).',
    source: 'Divina Liga',
    classification: 'CONFIDENCIAL',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'codex-master',
    title: 'CÓDEX MAESTRO UNIFICADO',
    content: 'Documento central con secciones de acceso restringido. Solo personal autorizado. Contiene la cronología completa desde la Era Pre-Xgénesis hasta el Legado del Futuro Imperfecto.',
    source: 'Divina Liga',
    classification: 'ULTRA SECRETO',
    timestamp: '20XX-XX-XX'
  },
  {
    id: 'imperfect-sacred',
    title: 'LA GRIETA: LO IMPERFECTO TAMBIÉN ES SAGRADO',
    content: 'El círculo incompleto representa la humanidad y su imperfecto esencial. El rayo atraviesa la abertura para iluminar, convirtiendo lo roto en fuerza.',
    source: 'Divina Liga',
    classification: 'CONFIDENCIAL',
    timestamp: '20XX-XX-XX'
  }
];

export const LoreGlitch: React.FC<LoreGlitchProps> = ({
  trigger,
  delay = 0,
  duration = 3000,
  intensity = 'medium'
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentFragment, setCurrentFragment] = useState<LoreFragment | null>(null);
  const [glitchText, setGlitchText] = useState('');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const startGlitch = () => {
      setIsGlitching(true);
      const fragment = loreFragments[Math.floor(Math.random() * loreFragments.length)];
      setCurrentFragment(fragment);

      // Efecto de glitch en el texto
      const originalText = fragment.title;
      let glitchCount = 0;
      const maxGlitches = intensity === 'high' ? 20 : intensity === 'medium' ? 15 : 10;

      intervalId = setInterval(() => {
        if (glitchCount < maxGlitches) {
          const glitchedText = originalText
            .split('')
            .map((char, index) => {
              if (Math.random() < 0.3) {
                return String.fromCharCode(33 + Math.random() * 94);
              }
              return char;
            })
            .join('');
          
          setGlitchText(glitchedText);
          glitchCount++;
        } else {
          setGlitchText(originalText);
        }
      }, 50);

      // Terminar glitch
      timeoutId = setTimeout(() => {
        setIsGlitching(false);
        setCurrentFragment(null);
        setGlitchText('');
        clearInterval(intervalId);
      }, duration);
    };

    // Configurar trigger
    switch (trigger) {
      case 'time':
        timeoutId = setTimeout(startGlitch, delay);
        break;
      case 'scroll':
        const handleScroll = () => {
          if (window.scrollY > 100 && !isGlitching) {
            startGlitch();
          }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
          window.removeEventListener('scroll', handleScroll);
          clearTimeout(timeoutId);
          clearInterval(intervalId);
        };
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [trigger, delay, duration, intensity, isGlitching]);

  const handleClick = () => {
    if (trigger === 'click' && !isGlitching) {
      setIsGlitching(true);
      const fragment = loreFragments[Math.floor(Math.random() * loreFragments.length)];
      setCurrentFragment(fragment);
      setGlitchText(fragment.title);

      setTimeout(() => {
        setIsGlitching(false);
        setCurrentFragment(null);
        setGlitchText('');
      }, duration);
    }
  };

  const handleHover = () => {
    if (trigger === 'hover' && !isGlitching) {
      setIsGlitching(true);
      const fragment = loreFragments[Math.floor(Math.random() * loreFragments.length)];
      setCurrentFragment(fragment);
      setGlitchText(fragment.title);

      setTimeout(() => {
        setIsGlitching(false);
        setCurrentFragment(null);
        setGlitchText('');
      }, duration);
    }
  };

  return (
    <>
      {/* Glitch Overlay */}
      <AnimatePresence>
        {isGlitching && currentFragment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setIsGlitching(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-gray-900 border border-red-500 rounded-lg p-6 max-w-md mx-4 relative overflow-hidden"
            >
              {/* Glitch Effect */}
              <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-pulse"></div>

              {/* Header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm font-mono">
                    {currentFragment.classification}
                  </span>
                </div>
                <span className="text-gray-400 text-xs font-mono">
                  {currentFragment.timestamp}
                </span>
              </div>

              {/* Title with Glitch */}
              <h3 className="text-xl font-bold text-red-400 mb-4 font-mono relative z-10">
                {glitchText || currentFragment.title}
              </h3>

              {/* Content */}
              <p className="text-gray-300 mb-4 leading-relaxed relative z-10">
                {currentFragment.content}
              </p>

              {/* Source */}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-cyan-400 text-sm font-mono">
                  Fuente: {currentFragment.source}
                </span>
                <button
                  onClick={() => setIsGlitching(false)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  [CERRAR]
                </button>
              </div>

              {/* Scanlines Effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-b from-transparent via-red-500/5 to-transparent animate-pulse"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glitch Triggers */}
      <div
        className="glitch-trigger"
        onClick={handleClick}
        onMouseEnter={handleHover}
        style={{ cursor: trigger === 'click' ? 'pointer' : 'default' }}
      />
    </>
  );
};

// Componente para glitches sutiles en el texto
export const GlitchText: React.FC<{
  children: string;
  intensity?: 'low' | 'medium' | 'high';
  frequency?: number;
}> = ({ children, intensity = 'low', frequency = 0.02 }) => {
  const [glitchedText, setGlitchedText] = useState(children);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < frequency) {
        const glitched = children
          .split('')
          .map((char, index) => {
            if (Math.random() < (intensity === 'high' ? 0.3 : intensity === 'medium' ? 0.2 : 0.1)) {
              return String.fromCharCode(33 + Math.random() * 94);
            }
            return char;
          })
          .join('');
        setGlitchedText(glitched);
      } else {
        setGlitchedText(children);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [children, intensity, frequency]);

  return (
    <span className="font-mono">
      {glitchedText}
    </span>
  );
};

// Componente para efectos de glitch en elementos
export const GlitchEffect: React.FC<{
  children: React.ReactNode;
  trigger?: 'hover' | 'click' | 'always';
  intensity?: 'low' | 'medium' | 'high';
}> = ({ children, trigger = 'hover', intensity = 'medium' }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  const handleTrigger = () => {
    if (trigger !== 'always') {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }
  };

  useEffect(() => {
    if (trigger === 'always') {
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 100);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [trigger]);

  return (
    <div
      className={`relative ${trigger === 'click' ? 'cursor-pointer' : ''}`}
      onClick={trigger === 'click' ? handleTrigger : undefined}
      onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
    >
      {children}
      {isGlitching && (
        <div className={`absolute inset-0 pointer-events-none ${
          intensity === 'high' ? 'bg-red-500/20' :
          intensity === 'medium' ? 'bg-red-500/10' :
          'bg-red-500/5'
        } animate-pulse`} />
      )}
    </div>
  );
};

