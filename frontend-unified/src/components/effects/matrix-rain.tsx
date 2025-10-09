import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  color?: string;
  fontSize?: number;
  speedInitial?: number;
  speedCalm?: number;
  opacityInitial?: number;
  opacityCalm?: number;
  settleAfterMs?: number;
  transitionMs?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export function MatrixRain({
  color = '#00FFE7',
  fontSize = 18,
  speedInitial = 34,
  speedCalm = 70,
  opacityInitial = 0.15,
  opacityCalm = 0.08,
  settleAfterMs = 5000,
  transitionMs = 1000,
  intensity = 'medium',
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  // Adjust intensity settings
  const intensitySettings = {
    low: { speedInitial: 50, opacityInitial: 0.05, opacityCalm: 0.02 },
    medium: { speedInitial: 34, opacityInitial: 0.15, opacityCalm: 0.08 },
    high: { speedInitial: 20, opacityInitial: 0.25, opacityCalm: 0.12 },
  };

  const settings = intensitySettings[intensity];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const glyphs =
      'アカサタナハマヤラワイキシチニヒミリヰウクスツヌフムユルエケセテネヘメレヱオコソトノホモヨロヲ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () =>
      Math.floor(Math.random() * canvas.height / fontSize)
    );

    let speed = settings.speedInitial;
    let opacity = settings.opacityInitial;
    let start = performance.now();
    let transitionStart: number | null = null;

    const draw = (now: number) => {
      const elapsed = now - start;

      // Start transition after settle time
      if (elapsed >= settleAfterMs && !transitionStart) {
        transitionStart = now;
      }

      if (transitionStart) {
        const t = Math.min(1, (now - transitionStart) / transitionMs);
        speed = settings.speedInitial + (speedCalm - settings.speedInitial) * t;
        opacity = settings.opacityInitial + (settings.opacityCalm - settings.opacityInitial) * t;
      }

      ctx.fillStyle = `rgba(10, 12, 16, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('resize', setSize);
    };
  }, [
    color,
    fontSize,
    speedInitial,
    speedCalm,
    settings.opacityInitial,
    settings.opacityCalm,
    settleAfterMs,
    transitionMs,
    settings.speedInitial,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
