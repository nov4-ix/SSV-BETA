import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 🎛️ CONTROLES DE RENDIMIENTO PROFESIONALES - MIGRADO DE SSV-BETA 🎛️

interface PerformanceControlsProps {
  onQualityChange?: (quality: 'low' | 'medium' | 'high') => void;
  onAudioToggle?: (enabled: boolean) => void;
  onAnimationsToggle?: (enabled: boolean) => void;
  initialQuality?: 'low' | 'medium' | 'high';
  initialAudio?: boolean;
  initialAnimations?: boolean;
}

export function PerformanceControls({
  onQualityChange,
  onAudioToggle,
  onAnimationsToggle,
  initialQuality = 'high',
  initialAudio = true,
  initialAnimations = true
}: PerformanceControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [quality, setQuality] = useState(initialQuality);
  const [audioEnabled, setAudioEnabled] = useState(initialAudio);
  const [animationsEnabled, setAnimationsEnabled] = useState(initialAnimations);
  const [fps, setFps] = useState(60);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Monitoreo de FPS en tiempo real
  useEffect(() => {
    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTimeRef.current >= 1000) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        setFps(calculatedFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    measureFPS();
  }, []);

  // Detectar tecla de acceso rápido (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleQualityChange = useCallback((newQuality: 'low' | 'medium' | 'high') => {
    setQuality(newQuality);
    onQualityChange?.(newQuality);
  }, [onQualityChange]);

  const handleAudioToggle = useCallback(() => {
    const newAudioState = !audioEnabled;
    setAudioEnabled(newAudioState);
    onAudioToggle?.(newAudioState);
  }, [audioEnabled, onAudioToggle]);

  const handleAnimationsToggle = useCallback(() => {
    const newAnimationsState = !animationsEnabled;
    setAnimationsEnabled(newAnimationsState);
    onAnimationsToggle?.(newAnimationsState);
  }, [animationsEnabled, onAnimationsToggle]);

  const getFpsColor = () => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVisible(true)}
          className="p-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg text-white hover:bg-gray-800/80 transition-colors"
          title="Performance Controls (Ctrl+Shift+P)"
        >
          ⚙️
        </motion.button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-4 right-4 z-50 w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyan-400">Performance Controls</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* FPS Monitor */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">FPS</span>
            <span className={`text-lg font-bold ${getFpsColor()}`}>
              {fps}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                fps >= 55 ? 'bg-green-400' : fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min((fps / 60) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Quality Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Quality Level:</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map(level => (
              <button
                key={level}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quality === level
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
                onClick={() => handleQualityChange(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Audio:</label>
          <button
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              audioEnabled
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
            onClick={handleAudioToggle}
          >
            {audioEnabled ? '🔊 Enabled' : '🔇 Disabled'}
          </button>
        </div>

        {/* Animations Toggle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Animations:</label>
          <button
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              animationsEnabled
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
            onClick={handleAnimationsToggle}
          >
            {animationsEnabled ? '🎬 Enabled' : '⏸️ Disabled'}
          </button>
        </div>

        {/* Performance Tips */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Low: Better performance, reduced effects</p>
          <p>• Medium: Balanced quality and performance</p>
          <p>• High: Maximum visual quality</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
