import React, { useRef, useEffect, useState, useCallback } from 'react';

// 🎵 SISTEMA DE AUDIO PROCEDURAL AVANZADO - MIGRADO DE SSV-BETA 🎵

interface AudioManagerProps {
  enableAmbient?: boolean;
  enableSFX?: boolean;
  volume?: number;
  onIconClick?: (iconIndex: number) => void;
}

export function AudioManager({
  enableAmbient = true,
  enableSFX = true,
  volume = 0.3,
  onIconClick
}: AudioManagerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar Web Audio API
  useEffect(() => {
    if (!enableAmbient && !enableSFX) return;

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (enableAmbient) {
        ambientGainRef.current = audioContextRef.current.createGain();
        ambientGainRef.current.connect(audioContextRef.current.destination);
        ambientGainRef.current.gain.value = volume * 0.5; // Ambient más suave
      }
      
      if (enableSFX) {
        sfxGainRef.current = audioContextRef.current.createGain();
        sfxGainRef.current.connect(audioContextRef.current.destination);
        sfxGainRef.current.gain.value = volume;
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enableAmbient, enableSFX, volume]);

  // Crear sonido ambiental de fondo
  const createAmbientSound = useCallback(() => {
    if (!audioContextRef.current || !ambientGainRef.current || !enableAmbient) return;

    // Limpiar osciladores anteriores
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Oscilador ya detenido
      }
    });
    oscillatorsRef.current = [];

    // Crear múltiples osciladores para sonido ambiental complejo
    const frequencies = [220, 330, 440, 550]; // A3, E4, A4, C#5
    const types: OscillatorType[] = ['sine', 'triangle', 'sawtooth'];

    frequencies.forEach((freq, index) => {
      const oscillator = audioContextRef.current!.createOscillator();
      const gainNode = audioContextRef.current!.createGain();
      
      oscillator.type = types[index % types.length];
      oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime);
      
      // Modulación suave de frecuencia
      oscillator.frequency.setValueAtTime(
        freq + Math.sin(Date.now() * 0.001) * 5,
        audioContextRef.current!.currentTime
      );
      
      gainNode.gain.setValueAtTime(0.1 * (1 - index * 0.2), audioContextRef.current!.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(ambientGainRef.current!);
      
      oscillator.start();
      oscillatorsRef.current.push(oscillator);
    });
  }, [enableAmbient]);

  // Crear SFX para íconos
  const createIconSFX = useCallback((iconIndex: number) => {
    if (!audioContextRef.current || !sfxGainRef.current || !enableSFX) return;

    const frequencies = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      493.88, // B4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      698.46, // F5
      783.99  // G5
    ];

    const frequency = frequencies[iconIndex % frequencies.length];
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    const filterNode = audioContextRef.current.createBiquadFilter();

    // Configurar oscilador
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    
    // Configurar filtro
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1000, audioContextRef.current.currentTime);
    filterNode.Q.setValueAtTime(1, audioContextRef.current.currentTime);

    // Configurar ganancia con envelope
    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    // Conectar nodos
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(sfxGainRef.current);

    // Iniciar y detener
    oscillator.start(now);
    oscillator.stop(now + 0.5);

    // Limpiar después de terminar
    setTimeout(() => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
        filterNode.disconnect();
      } catch (e) {
        // Ya desconectado
      }
    }, 500);
  }, [enableSFX]);

  // Crear efecto de Matrix Rain
  const createMatrixSFX = useCallback(() => {
    if (!audioContextRef.current || !sfxGainRef.current || !enableSFX) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    const filterNode = audioContextRef.current.createBiquadFilter();

    // Sonido glitch
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, audioContextRef.current.currentTime);
    oscillator.frequency.setValueAtTime(200, audioContextRef.current.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(50, audioContextRef.current.currentTime + 0.2);

    // Filtro con modulación
    filterNode.type = 'highpass';
    filterNode.frequency.setValueAtTime(500, audioContextRef.current.currentTime);
    filterNode.frequency.setValueAtTime(2000, audioContextRef.current.currentTime + 0.1);

    // Envelope rápido
    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(sfxGainRef.current);

    oscillator.start(now);
    oscillator.stop(now + 0.1);

    setTimeout(() => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
        filterNode.disconnect();
      } catch (e) {
        // Ya desconectado
      }
    }, 100);
  }, [enableSFX]);

  // Iniciar sonido ambiental
  useEffect(() => {
    if (isInitialized && enableAmbient) {
      createAmbientSound();
    }
  }, [isInitialized, enableAmbient, createAmbientSound]);

  // Exponer funciones globalmente para uso desde otros componentes
  useEffect(() => {
    if (isInitialized) {
      (window as any).nexusAudio = {
        iconClick: createIconSFX,
        matrixEffect: createMatrixSFX,
        ambientSound: createAmbientSound,
      };
    }
  }, [isInitialized, createIconSFX, createMatrixSFX, createAmbientSound]);

  // Función para manejar clicks de íconos
  const handleIconClick = useCallback((iconIndex: number) => {
    createIconSFX(iconIndex);
    onIconClick?.(iconIndex);
  }, [createIconSFX, onIconClick]);

  // Función para efectos de Matrix Rain
  const triggerMatrixEffect = useCallback(() => {
    createMatrixSFX();
  }, [createMatrixSFX]);

  // Función para reiniciar sonido ambiental
  const restartAmbient = useCallback(() => {
    createAmbientSound();
  }, [createAmbientSound]);

  return (
    <div className="audio-manager">
      {/* Controles de audio (opcionales) */}
      {isInitialized && (
        <div className="audio-controls">
          <button
            onClick={restartAmbient}
            className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded text-sm hover:bg-gray-700/50 transition-colors"
            title="Restart Ambient Sound"
          >
            🔄 Ambient
          </button>
          <button
            onClick={triggerMatrixEffect}
            className="px-3 py-1 bg-gray-800/50 text-gray-300 rounded text-sm hover:bg-gray-700/50 transition-colors"
            title="Matrix Effect"
          >
            ⚡ Matrix
          </button>
        </div>
      )}
    </div>
  );
}
