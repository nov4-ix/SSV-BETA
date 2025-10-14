/**
 * 🌌 NEXUS VISUAL - Lluvia de Kanjis Épica
 * 
 * Implementación completa del modo NEXUS con animación épica
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useNexusMode } from '../auth/store';

// Kanji character set (Unicode: U+4E00 to U+9FFF)
const KANJI_CHARS = [
  '音', '楽', '歌', '曲', '声', '響', '韻', '律', '調', '和',
  '美', '心', '情', '愛', '夢', '光', '星', '月', '風', '雲',
  '水', '火', '土', '木', '金', '銀', '青', '赤', '白', '黒',
  '新', '古', '大', '小', '高', '低', '速', '遅', '強', '弱',
  '静', '動', '明', '暗', '暖', '冷', '甘', '苦', '酸', '辛',
  '天', '地', '人', '神', '鬼', '龍', '鳳', '虎', '鷹', '鶴',
  '花', '葉', '根', '実', '種', '芽', '枝', '幹', '森', '林',
  '山', '川', '海', '湖', '島', '岸', '波', '潮', '流', '源',
  '空', '宙', '宇', '宙', '世', '界', '国', '家', '城', '殿',
  '道', '路', '橋', '門', '窓', '壁', '床', '天', '井', '柱'
];

interface FallingKanji {
  id: string;
  char: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  fontSize: number;
}

interface NexusVisualProps {
  className?: string;
}

export const NexusVisual: React.FC<NexusVisualProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [fallingKanjis, setFallingKanjis] = useState<FallingKanji[]>([]);
  const [nexusMode, setNexusMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { nexusMode: globalNexusMode, activateNexus, deactivateNexus } = useNexusMode();

  // Create falling kanji
  const createFallingKanji = useCallback((): FallingKanji => {
    const colors = nexusMode ? ['#FFD700', '#FFA500', '#FF8C00'] : ['#00FFE7', '#00BFFF', '#87CEEB'];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      char: KANJI_CHARS[Math.floor(Math.random() * KANJI_CHARS.length)],
      x: Math.random() * window.innerWidth,
      y: -50,
      speed: nexusMode ? 2 + Math.random() * 4 : 1 + Math.random() * 2,
      size: 8 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.4 + Math.random() * 0.6,
      rotation: Math.random() * 360,
      fontSize: nexusMode ? 18 + Math.random() * 12 : 14 + Math.random() * 8
    };
  }, [nexusMode]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setFallingKanjis(prev => {
        const moved = prev.map(kanji => ({
          ...kanji,
          y: kanji.y + kanji.speed,
          rotation: kanji.rotation + (nexusMode ? 2 : 0.5),
          opacity: Math.max(0, kanji.opacity - 0.002)
        })).filter(kanji => kanji.y < window.innerHeight + 100 && kanji.opacity > 0.1);

        const newKanjis = Math.random() < (nexusMode ? 0.8 : 0.4) ? [createFallingKanji()] : [];
        
        return [...moved, ...newKanjis];
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createFallingKanji, nexusMode]);

  // Canvas rendering
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

    const drawKanjis = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = nexusMode ? 'rgba(255, 23, 68, 0.1)' : 'rgba(10, 12, 16, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      fallingKanjis.forEach(kanji => {
        ctx.save();
        ctx.translate(kanji.x, kanji.y);
        ctx.rotate((kanji.rotation * Math.PI) / 180);
        ctx.globalAlpha = kanji.opacity;
        ctx.fillStyle = kanji.color;
        ctx.font = `${kanji.fontSize}px 'Noto Sans JP', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Glow effect
        ctx.shadowColor = kanji.color;
        ctx.shadowBlur = nexusMode ? 20 : 10;
        ctx.fillText(kanji.char, 0, 0);
        
        ctx.restore();
      });
    };

    const interval = setInterval(drawKanjis, 16);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [fallingKanjis, nexusMode]);

  // Nexus activation animation
  const handleNexusActivation = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    activateNexus();
    
    // Epic animation sequence
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        setNexusMode(true);
      }
    });

    // FASE 1: Screen Flash (0-0.5s)
    timeline.to('.screen-overlay', {
      opacity: 1,
      duration: 0.1,
      ease: 'power4.in'
    });

    // Play sound: Bass rumble
    playSound('bass-rumble.mp3');

    timeline.to('.screen-overlay', {
      opacity: 0,
      duration: 0.4,
      ease: 'power4.out'
    });

    // FASE 2: ALVAE Symbol Emergence (0.5-2s)
    timeline.fromTo('.alvae-symbol', {
      scale: 0,
      opacity: 0,
      filter: 'blur(20px)'
    }, {
      scale: 3,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.5,
      ease: 'back.out(2)'
    }, 0.5);

    // Golden glow
    timeline.to('.alvae-glow', {
      opacity: 1,
      scale: 1.5,
      duration: 1,
      ease: 'power2.inOut'
    }, 0.7);

    // Play sound: Energy buildup
    playSound('energy-buildup.mp3', 0.8);

    // Camera shake
    timeline.to('.nexus-container', {
      x: '+=10',
      yoyo: true,
      repeat: 10,
      duration: 0.1
    }, 1);

    // FASE 3: Transformation (2-4s)
    // Kanjis turn gold (handled by state change)
    timeline.call(() => {
      setNexusMode(true);
    }, null, 2);

    // Lightning effects
    timeline.to('.lightning', {
      opacity: 1,
      duration: 0.1,
      yoyo: true,
      repeat: 20,
      ease: 'steps(1)'
    }, 2);

    // Background shift to red
    timeline.to('.nexus-container', {
      background: 'radial-gradient(circle, #FF1744, #0A0C10)',
      duration: 2,
      ease: 'power2.inOut'
    }, 2);

    // Play sound: Epic orchestral crescendo
    playSound('epic-orchestral.mp3', 2);

    // FASE 4: Super Saiyan Peak (4-5s)
    timeline.to('.golden-aura', {
      opacity: 1,
      scale: 1.2,
      duration: 1,
      ease: 'power2.out'
    }, 4);

    // Lightning continuous
    timeline.to('.lightning-continuous', {
      opacity: 0.8,
      duration: 0.05,
      yoyo: true,
      repeat: -1
    }, 4);

    // Screen pulse
    timeline.to('.screen-pulse', {
      scale: 1.05,
      yoyo: true,
      repeat: 5,
      duration: 0.2,
      ease: 'sine.inOut'
    }, 4);

    // "NEXUS MODE ACTIVATED" text
    timeline.fromTo('.nexus-text', {
      opacity: 0,
      y: 50,
      scale: 0.8
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(2)'
    }, 4.5);

    // Play sound: Powerful hit
    playSound('power-hit.mp3', 4.5);

    // FASE 5: Settle (5-6s)
    timeline.to('.golden-aura', {
      opacity: 0.6,
      scale: 1,
      duration: 1,
      ease: 'power2.out'
    }, 5);

    timeline.to('.lightning-continuous', {
      opacity: 0,
      duration: 0.5
    }, 5);

    timeline.to('.nexus-text', {
      opacity: 0,
      y: -30,
      duration: 0.5
    }, 5.5);

    // Auto-deactivate after 1 minute
    setTimeout(() => {
      setNexusMode(false);
      deactivateNexus();
    }, 60000);
  }, [isAnimating, activateNexus, deactivateNexus]);

  // Sound effects
  const playSound = (filename: string, delay = 0) => {
    setTimeout(() => {
      try {
        const audio = new Audio(`/sounds/${filename}`);
        audio.volume = 0.7;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Sound playback failed:', error);
      }
    }, delay * 1000);
  };

  // Keyboard shortcut for Nexus activation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'N' && !isAnimating) {
        handleNexusActivation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNexusActivation, isAnimating]);

  return (
    <div className={`nexus-container fixed inset-0 z-10 ${className}`}>
      {/* Canvas for falling kanjis */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* ALVAE Symbol (hidden by default) */}
      <div className="alvae-symbol fixed inset-0 flex items-center justify-center z-40 opacity-0">
        <div className="relative">
          <div className="w-64 h-64 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <span className="text-6xl font-bold text-white">ALVAE</span>
          </div>
          <div className="alvae-glow absolute inset-0 opacity-0">
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400 via-orange-500 to-transparent blur-3xl" />
          </div>
        </div>
      </div>

      {/* Lightning Effects */}
      <div className="lightning fixed inset-0 opacity-0 z-30 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-yellow-300 opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '2px',
              height: `${Math.random() * 200 + 50}px`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* Continuous Lightning */}
      <div className="lightning-continuous fixed inset-0 opacity-0 z-30 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-yellow-300 opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '3px',
              height: `${Math.random() * 300 + 100}px`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* Golden Aura */}
      <div className="golden-aura fixed inset-0 opacity-0 z-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 mix-blend-overlay" />
      </div>

      {/* Screen Flash Overlay */}
      <div className="screen-overlay fixed inset-0 bg-white opacity-0 z-50" />

      {/* Screen Pulse */}
      <div className="screen-pulse fixed inset-0 z-15 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-yellow-400/20 via-orange-500/10 to-transparent" />
      </div>

      {/* NEXUS Text */}
      <div className="nexus-text fixed inset-0 flex items-center justify-center z-50 opacity-0">
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 drop-shadow-2xl">
          NEXUS MODE ACTIVATED
        </h1>
      </div>

      {/* Activation Button */}
      <AnimatePresence>
        {!nexusMode && !isAnimating && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleNexusActivation}
            className="fixed bottom-8 right-8 z-50 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🌌 ACTIVATE NEXUS
          </motion.button>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      {nexusMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-8 left-8 z-50 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg shadow-lg"
        >
          ⚡ NEXUS MODE ACTIVE
        </motion.div>
      )}
    </div>
  );
};

export default NexusVisual;
