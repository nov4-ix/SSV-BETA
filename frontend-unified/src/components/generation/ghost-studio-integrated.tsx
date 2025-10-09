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
  Minus,
  Zap,
  Wand2,
  Image,
  Share2,
  Music,
  Headphones,
  Mic as MicIcon,
  Type,
  Sparkles
} from 'lucide-react';

// 🎵 GHOST STUDIO INTEGRADO - DAW + IA + MARKETING COMPLETO 🎵

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
  aiProcessed?: boolean;
  sunoVersion?: string;
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
  aiEnhanced?: boolean;
}

interface AIProcessingJob {
  id: string;
  type: 'suno_cover' | 'bark_tts' | 'so_vits_clone' | 'flux_artwork';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: any;
  output?: any;
  progress: number;
  createdAt: string;
}

interface GhostStudioIntegratedProps {
  onTrackProcessed?: (trackId: string, processedAudio: string) => void;
  onMarketingGenerated?: (content: any) => void;
}

export function GhostStudioIntegrated({ 
  onTrackProcessed,
  onMarketingGenerated 
}: GhostStudioIntegratedProps) {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(120);
  const [activeView, setActiveView] = useState<'daw' | 'ai' | 'marketing'>('daw');
  const [loopLayers, setLoopLayers] = useState<LoopLayer[]>([]);
  const [aiJobs, setAiJobs] = useState<AIProcessingJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      aiProcessed: false
    };
    
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrackId(trackId);
  }, [tracks.length]);

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
          duration: 0,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          aiProcessed: false
        };
        
        setTracks(prev => [...prev, newTrack]);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // 🤖 IA PROCESSING FUNCTIONS 🤖

  const processWithSuno = async (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const job: AIProcessingJob = {
      id: `suno_${Date.now()}`,
      type: 'suno_cover',
      status: 'pending',
      input: { trackId, audioUrl: track.source },
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setAiJobs(prev => [...prev, job]);
    setIsProcessing(true);

    try {
      // Simular llamada a Suno API
      const response = await fetch('/api/v1/ai/suno-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: track.source,
          prompt: 'Professional studio quality, enhanced vocals, crisp instruments',
          style: 'modern',
          genre: 'pop'
        })
      });

      const result = await response.json();
      
      // Actualizar job
      setAiJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'completed', output: result, progress: 100 }
          : j
      ));

      // Actualizar track
      setTracks(prev => prev.map(t => 
        t.id === trackId 
          ? { ...t, aiProcessed: true, sunoVersion: result.audioUrl }
          : t
      ));

      onTrackProcessed?.(trackId, result.audioUrl);

    } catch (error) {
      setAiJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'failed', progress: 0 }
          : j
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const generateWithBark = async (text: string, voice: string = 'default') => {
    const job: AIProcessingJob = {
      id: `bark_${Date.now()}`,
      type: 'bark_tts',
      status: 'pending',
      input: { text, voice },
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setAiJobs(prev => [...prev, job]);

    try {
      const response = await fetch('/api/v1/ai/bark-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice })
      });

      const result = await response.json();
      
      setAiJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'completed', output: result, progress: 100 }
          : j
      ));

      // Crear track con el audio generado
      const trackId = `track_${Date.now()}`;
      const newTrack: AudioTrack = {
        id: trackId,
        name: `Bark TTS: ${text.substring(0, 20)}...`,
        type: 'audio',
        source: result.audioUrl,
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        isRecording: false,
        duration: result.duration,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        aiProcessed: true
      };
      
      setTracks(prev => [...prev, newTrack]);

    } catch (error) {
      setAiJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'failed', progress: 0 }
          : j
      ));
    }
  };

  const cloneWithSoVITS = async (trackId: string, targetVoice: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const job: AIProcessingJob = {
      id: `sovits_${Date.now()}`,
      type: 'so_vits_clone',
      status: 'pending',
      input: { trackId, audioUrl: track.source, targetVoice },
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setAiJobs(prev => [...prev, job]);

    try {
      const response = await fetch('/api/v1/ai/so-vits-clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: track.source,
          targetVoice,
          preserveEmotion: true
        })
      });

      const result = await response.json();
      
      setAiJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'completed', output: result, progress: 100 }
          : j
      ));

      // Crear nueva track con voz clonada
      const newTrackId = `track_${Date.now()}`;
      const newTrack: AudioTrack = {
        id: newTrackId,
        name: `Cloned: ${track.name}`,
        type: 'audio',
        source: result.audioUrl,
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        isRecording: false,
        duration: track.duration,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        aiProcessed: true
      };
      
      setTracks(prev => [...prev, newTrack]);

    } catch (error) {
      setAiJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'failed', progress: 0 }
          : j
      ));
    }
  };

  const generateArtworkWithFlux = async (prompt: string) => {
    const job: AIProcessingJob = {
      id: `flux_${Date.now()}`,
      type: 'flux_artwork',
      status: 'pending',
      input: { prompt },
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setAiJobs(prev => [...prev, job]);

    try {
      const response = await fetch('/api/v1/ai/flux-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: 'album_cover',
          resolution: '1024x1024'
        })
      });

      const result = await response.json();
      
      setAiJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'completed', output: result, progress: 100 }
          : j
      ));

      return result.imageUrl;

    } catch (error) {
      setAiJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'failed', progress: 0 }
          : j
      ));
    }
  };

  // 📱 MARKETING FUNCTIONS 📱

  const generateMarketingContent = async () => {
    if (tracks.length === 0) return;

    const mainTrack = tracks.find(t => t.aiProcessed) || tracks[0];
    
    try {
      const response = await fetch('/api/v1/marketing/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: mainTrack.id,
          trackName: mainTrack.name,
          genre: 'electronic',
          mood: 'energetic'
        })
      });

      const result = await response.json();
      onMarketingGenerated?.(result);

    } catch (error) {
      console.error('Error generating marketing content:', error);
    }
  };

  const togglePlay = () => setIsPlaying(prev => !prev);
  const stop = () => {
    setIsPlaying(false);
    setPlayheadPosition(0);
  };

  return (
    <div className="ghost-studio-integrated bg-black text-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              👻 Ghost Studio Integrated
            </h1>
            <div className="text-sm text-gray-300">
              DAW + IA + Marketing Completo
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-2">
            {[
              { id: 'daw', label: 'DAW', icon: Music },
              { id: 'ai', label: 'IA', icon: Sparkles },
              { id: 'marketing', label: 'Marketing', icon: Share2 }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === view.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
              </button>
            ))}
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
        {activeView === 'daw' && (
          <div className="space-y-6">
            {/* DAW Controls */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-cyan-400">🎛️ Mini DAW</h2>
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{track.name}</h3>
                        {track.aiProcessed && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                            🤖 AI Enhanced
                          </span>
                        )}
                      </div>
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
                          onChange={(e) => setTracks(prev => prev.map(t => 
                            t.id === track.id ? { ...t, volume: Number(e.target.value) } : t
                          ))}
                          className="w-20"
                        />
                      </div>

                      {/* AI Processing Button */}
                      <button
                        onClick={() => processWithSuno(track.id)}
                        className="p-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                        title="Process with Suno AI"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => setTracks(prev => prev.filter(t => t.id !== track.id))}
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
        )}

        {activeView === 'ai' && (
          <div className="space-y-6">
            {/* AI Processing Tools */}
            <h2 className="text-2xl font-bold text-purple-400">🤖 IA Processing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Suno Cover */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Music className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Suno Cover</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Enhance your tracks with professional studio quality
                </p>
                <button
                  onClick={() => selectedTrackId && processWithSuno(selectedTrackId)}
                  disabled={!selectedTrackId || isProcessing}
                  className="w-full px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Enhance Track'}
                </button>
              </div>

              {/* Bark TTS */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Bark TTS</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Convert text to natural speech
                </p>
                <button
                  onClick={() => generateWithBark('Hello, this is a test of Bark TTS')}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Generate Speech'}
                </button>
              </div>

              {/* So-VITS Clone */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MicIcon className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">So-VITS Clone</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Clone any voice with AI
                </p>
                <button
                  onClick={() => selectedTrackId && cloneWithSoVITS(selectedTrackId, 'target_voice')}
                  disabled={!selectedTrackId || isProcessing}
                  className="w-full px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Clone Voice'}
                </button>
              </div>

              {/* Flux Artwork */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-5 h-5 text-pink-400" />
                  <h3 className="font-semibold text-white">Flux Artwork</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Generate album artwork with AI
                </p>
                <button
                  onClick={() => generateArtworkWithFlux('Cyberpunk music album cover, neon colors, futuristic')}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded hover:bg-pink-500/30 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Generate Artwork'}
                </button>
              </div>
            </div>

            {/* AI Jobs Status */}
            {aiJobs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Processing Jobs</h3>
                <div className="space-y-2">
                  {aiJobs.map((job) => (
                    <div key={job.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">{job.type}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            job.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            job.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {job.progress}%
                        </div>
                      </div>
                      {job.status === 'processing' && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div
                            className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'marketing' && (
          <div className="space-y-6">
            {/* Marketing Tools */}
            <h2 className="text-2xl font-bold text-green-400">📱 Marketing Tools</h2>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Nova Post Pilot</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Generate marketing content automatically for your tracks
              </p>
              <button
                onClick={generateMarketingContent}
                disabled={tracks.length === 0}
                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                Generate Marketing Content
              </button>
            </div>

            {/* Marketing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Tracks Ready</h4>
                <p className="text-2xl font-bold text-cyan-400">{tracks.length}</p>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">AI Enhanced</h4>
                <p className="text-2xl font-bold text-purple-400">
                  {tracks.filter(t => t.aiProcessed).length}
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Processing Jobs</h4>
                <p className="text-2xl font-bold text-yellow-400">{aiJobs.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
