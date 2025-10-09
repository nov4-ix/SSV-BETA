import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Record, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

// 🎛️ MINI DAW PROFESIONAL - MIGRADO DE SSV-BETA 🎛️

interface AudioTrack {
  id: string;
  name: string;
  type: 'audio' | 'midi';
  source: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  isRecording: boolean;
  duration: number;
  color: string;
  waveform?: number[];
}

interface LoopLayer {
  id: string;
  name: string;
  audioData: string;
  duration: number;
  color: string;
  volume: number;
  mute: boolean;
  solo: boolean;
}

interface MiniDAWProps {
  onTrackRecorded?: (track: AudioTrack) => void;
  onTrackProcessed?: (trackId: string, processedAudio: string) => void;
  onLoopExported?: (loop: LoopLayer) => void;
}

export function MiniDAW({ 
  onTrackRecorded, 
  onTrackProcessed,
  onLoopExported 
}: MiniDAWProps) {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(120);
  const [activeView, setActiveView] = useState<'tracks' | 'looper'>('tracks');
  const [loopLayers, setLoopLayers] = useState<LoopLayer[]>([]);
  const [isLooping, setIsLooping] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Playhead animation
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setPlayheadPosition(prev => {
          const newPosition = prev + 0.1;
          return newPosition >= 100 ? 0 : newPosition;
        });
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const addTrack = useCallback((type: 'audio' | 'midi') => {
    const trackId = `track_${Date.now()}`;
    const newTrack: AudioTrack = {
      id: trackId,
      name: `${type === 'audio' ? 'Audio' : 'MIDI'} Track ${tracks.length + 1}`,
      type,
      source: '',
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      isRecording: false,
      duration: 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrackId(trackId);
  }, [tracks.length]);

  const removeTrack = useCallback((trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
    if (selectedTrackId === trackId) {
      setSelectedTrackId(null);
    }
  }, [selectedTrackId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        // Crear track con la grabación
        const trackId = `track_${Date.now()}`;
        const newTrack: AudioTrack = {
          id: trackId,
          name: `Recording ${tracks.length + 1}`,
          type: 'audio',
          source: audioUrl,
          volume: 0.8,
          pan: 0,
          mute: false,
          solo: false,
          isRecording: false,
          duration: 0, // Se calcularía con el audio real
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        };
        
        setTracks(prev => [...prev, newTrack]);
        onTrackRecorded?.(newTrack);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Actualizar track seleccionado para mostrar estado de grabación
      if (selectedTrackId) {
        setTracks(prev => prev.map(t => 
          t.id === selectedTrackId ? { ...t, isRecording: true } : t
        ));
      }
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Actualizar track seleccionado
      if (selectedTrackId) {
        setTracks(prev => prev.map(t => 
          t.id === selectedTrackId ? { ...t, isRecording: false } : t
        ));
      }
    }
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const stop = () => {
    setIsPlaying(false);
    setPlayheadPosition(0);
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, volume } : t
    ));
  };

  const toggleMute = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, mute: !t.mute } : t
    ));
  };

  const toggleSolo = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, solo: !t.solo } : t
    ));
  };

  // Looper functions
  const addLoopLayer = () => {
    const layerId = `layer_${Date.now()}`;
    const newLayer: LoopLayer = {
      id: layerId,
      name: `Layer ${loopLayers.length + 1}`,
      audioData: '',
      duration: 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      volume: 0.8,
      mute: false,
      solo: false,
    };
    
    setLoopLayers(prev => [...prev, newLayer]);
  };

  const removeLoopLayer = (layerId: string) => {
    setLoopLayers(prev => prev.filter(l => l.id !== layerId));
  };

  const toggleLoopLayerMute = (layerId: string) => {
    setLoopLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, mute: !l.mute } : l
    ));
  };

  const updateLoopLayerVolume = (layerId: string, volume: number) => {
    setLoopLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, volume } : l
    ));
  };

  const exportLoop = () => {
    if (loopLayers.length > 0) {
      const loop = loopLayers[0]; // Exportar la primera capa como ejemplo
      onLoopExported?.(loop);
    }
  };

  return (
    <div className="mini-daw bg-black text-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-cyan-400">🎛️ Mini DAW</h1>
          
          <div className="flex items-center gap-4">
            {/* BPM Control */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">BPM:</label>
              <input
                type="number"
                value={currentBpm}
                onChange={(e) => setCurrentBpm(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                min="60"
                max="200"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('tracks')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeView === 'tracks'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                Tracks
              </button>
              <button
                onClick={() => setActiveView('looper')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeView === 'looper'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                Looper
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="bg-gray-900/30 border-b border-gray-700 p-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={togglePlay}
            className={`p-3 rounded-full transition-colors ${
              isPlaying
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <button
            onClick={stop}
            className="p-3 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full hover:bg-gray-500/30 transition-colors"
          >
            <Square className="w-6 h-6" />
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-colors ${
              isRecording
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
            }`}
          >
            <Record className="w-6 h-6" />
          </button>

          <div className="text-sm text-gray-400">
            {isRecording ? 'Recording...' : 'Ready'}
          </div>
        </div>

        {/* Playhead */}
        <div className="mt-4">
          <div className="relative h-2 bg-gray-800 rounded-full">
            <div
              className="absolute top-0 left-0 h-2 bg-cyan-400 rounded-full transition-all duration-100"
              style={{ width: `${playheadPosition}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeView === 'tracks' ? (
          <div className="space-y-4">
            {/* Track Controls */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cyan-400">Audio Tracks</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => addTrack('audio')}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Audio Track
                </button>
                <button
                  onClick={() => addTrack('midi')}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  MIDI Track
                </button>
              </div>
            </div>

            {/* Tracks List */}
            <div className="space-y-3">
              {tracks.map((track) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedTrackId === track.id
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-gray-700 bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Track Color */}
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />

                    {/* Track Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{track.name}</h3>
                      <p className="text-sm text-gray-400">
                        {track.type.toUpperCase()} • {track.duration}s
                      </p>
                    </div>

                    {/* Track Controls */}
                    <div className="flex items-center gap-4">
                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={track.volume}
                          onChange={(e) => updateTrackVolume(track.id, Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-xs text-gray-400 w-8">
                          {Math.round(track.volume * 100)}%
                        </span>
                      </div>

                      {/* Mute */}
                      <button
                        onClick={() => toggleMute(track.id)}
                        className={`p-2 rounded transition-colors ${
                          track.mute
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                        }`}
                      >
                        <VolumeX className="w-4 h-4" />
                      </button>

                      {/* Solo */}
                      <button
                        onClick={() => toggleSolo(track.id)}
                        className={`p-2 rounded transition-colors ${
                          track.solo
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                        }`}
                      >
                        S
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => removeTrack(track.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {tracks.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>No tracks yet. Add an audio or MIDI track to get started.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Looper Controls */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cyan-400">Looper</h2>
              <div className="flex gap-2">
                <button
                  onClick={addLoopLayer}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Layer
                </button>
                <button
                  onClick={exportLoop}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Loop
                </button>
              </div>
            </div>

            {/* Loop Layers */}
            <div className="space-y-3">
              {loopLayers.map((layer) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-gray-700 bg-gray-900/50"
                >
                  <div className="flex items-center gap-4">
                    {/* Layer Color */}
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />

                    {/* Layer Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{layer.name}</h3>
                      <p className="text-sm text-gray-400">
                        Duration: {layer.duration}s
                      </p>
                    </div>

                    {/* Layer Controls */}
                    <div className="flex items-center gap-4">
                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={layer.volume}
                          onChange={(e) => updateLoopLayerVolume(layer.id, Number(e.target.value))}
                          className="w-20"
                        />
                      </div>

                      {/* Mute */}
                      <button
                        onClick={() => toggleLoopLayerMute(layer.id)}
                        className={`p-2 rounded transition-colors ${
                          layer.mute
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                        }`}
                      >
                        <VolumeX className="w-4 h-4" />
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => removeLoopLayer(layer.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {loopLayers.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>No loop layers yet. Add a layer to start looping.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
