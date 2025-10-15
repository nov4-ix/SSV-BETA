import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Download, Volume2, VolumeX, SkipForward, SkipBack,
  Loader2, CheckCircle, XCircle, Mic, MicOff, Music, Zap,
  Settings, SlidersHorizontal, Headphones, Guitar, Drumstick, Piano,
  ChevronLeft, ChevronRight, RotateCcw, Save, Upload, Trash2,
  Maximize2, Minimize2, MoreHorizontal, Copy, Share2
} from 'lucide-react';
import { useGeneratorStore } from '../store/generatorStore';
import { backendService } from '../services/backendService';
import { Knob } from '../components/ui/Knob';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';
import { Switch } from '../components/ui/Switch';
import { Slider } from '../components/ui/Slider';

// Professional Audio Player Component inspired by Arturia/Waves
const ProfessionalAudioPlayer: React.FC<{
  tracks: Array<{ id: string; name: string; url: string; duration: number; waveform?: number[] }>;
  onTrackSelect: (trackId: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (position: number) => void;
  isPlaying: boolean;
  currentTrack?: string;
  volume: number;
  position: number;
  duration: number;
}> = ({
  tracks,
  onTrackSelect,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onSeek,
  isPlaying,
  currentTrack,
  volume,
  position,
  duration
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(currentTrack || null);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrack(trackId);
    onTrackSelect(trackId);
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    onVolumeChange(isMuted ? volume : 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 rounded-xl p-6 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Professional Audio Engine</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Track Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedTrack === track.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
              onClick={() => handleTrackSelect(track.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{track.name}</h4>
                    <p className="text-xs text-gray-400">{formatTime(track.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Controls */}
      <div className="space-y-6">
        {/* Transport Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffling(!isShuffling)}
            className={`w-10 h-10 rounded-full ${
              isShuffling ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full text-gray-400 hover:text-white"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={isPlaying ? onPause : onPlay}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full text-gray-400 hover:text-white"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLooping(!isLooping)}
            className={`w-10 h-10 rounded-full ${
              isLooping ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                style={{ width: `${(position / duration) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(position / duration) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={position}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Volume and Rate Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVolumeToggle}
              className="text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={([value]) => {
                  setIsMuted(false);
                  onVolumeChange(value);
                }}
                max={100}
                step={1}
                className="w-24"
              />
              <span className="text-sm text-gray-400 w-8">{Math.round(isMuted ? 0 : volume)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Rate:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlaybackRate(Math.max(0.5, playbackRate - 0.25))}
                className="text-gray-400 hover:text-white"
              >
                -
              </Button>
              <span className="text-sm text-white w-12 text-center">{playbackRate}x</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlaybackRate(Math.min(2.0, playbackRate + 0.25))}
                className="text-gray-400 hover:text-white"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-700"
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">EQ</h4>
                <div className="space-y-2">
                  {['Low', 'Mid', 'High'].map((band) => (
                    <div key={band} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{band}</span>
                        <span>0dB</span>
                      </div>
                      <Slider
                        value={[0]}
                        onValueChange={() => {}}
                        max={12}
                        min={-12}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Effects</h4>
                <div className="space-y-2">
                  {['Reverb', 'Delay', 'Chorus'].map((effect) => (
                    <div key={effect} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{effect}</span>
                      <Switch />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Analysis</h4>
                <div className="space-y-2">
                  <div className="h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">Waveform</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>BPM: 120</div>
                    <div>Key: C</div>
                    <div>Loudness: -12dB</div>
                    <div>Dynamic: 8dB</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Professional Literary Knobs inspired by Arturia
const LiteraryKnobPanel: React.FC<{
  knobs: any;
  onKnobChange: (key: string, value: number) => void;
}> = ({ knobs, onKnobChange }) => {
  const knobConfigs = [
    { key: 'narrativeDepth', label: 'Narrative Depth', icon: '📖', color: 'from-blue-500 to-cyan-500' },
    { key: 'emotionalIntensity', label: 'Emotional Intensity', icon: '❤️', color: 'from-red-500 to-pink-500' },
    { key: 'poeticComplexity', label: 'Poetic Complexity', icon: '✨', color: 'from-purple-500 to-violet-500' },
    { key: 'metaphorUsage', label: 'Metaphor Usage', icon: '🎭', color: 'from-orange-500 to-yellow-500' },
    { key: 'rhymeDensity', label: 'Rhyme Density', icon: '🎵', color: 'from-green-500 to-emerald-500' },
    { key: 'storyArc', label: 'Story Arc', icon: '📈', color: 'from-indigo-500 to-blue-500' },
    { key: 'characterDevelopment', label: 'Character Dev', icon: '👤', color: 'from-teal-500 to-cyan-500' },
    { key: 'thematicConsistency', label: 'Thematic Consistency', icon: '🎯', color: 'from-rose-500 to-pink-500' }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <SlidersHorizontal className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">Literary Control Matrix</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        {knobConfigs.map((config) => (
          <div key={config.key} className="text-center space-y-3">
            <div className="relative">
              <Knob
                value={knobs[config.key] || 50}
                onChange={(value) => onKnobChange(config.key, value)}
                min={0}
                max={100}
                step={1}
                size="small"
                color="purple"
                label=""
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                <span className="text-xs">{config.icon}</span>
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-white">{config.label}</h4>
              <div className="text-xs text-gray-400">{knobs[config.key] || 50}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Professional Generator Component
const TheGeneratorProfessional: React.FC = () => {
  const { knobs, setKnobs } = useGeneratorStore();
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState(75);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes default
  
  // Content State
  const [lyrics, setLyrics] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<{
    lyrics?: string;
    prompt?: string;
    audioUrl?: string;
  }>({});
  
  // Voice and Mode Settings
  const [voiceGender, setVoiceGender] = useState<'male' | 'female' | 'random'>('male');
  const [isInstrumental, setIsInstrumental] = useState(false);

  // Mock tracks for demonstration
  const tracks = [
    {
      id: 'track1',
      name: 'Generated Track A',
      url: '',
      duration: 180,
      waveform: Array.from({ length: 100 }, () => Math.random())
    },
    {
      id: 'track2', 
      name: 'Generated Track B',
      url: '',
      duration: 180,
      waveform: Array.from({ length: 100 }, () => Math.random())
    }
  ];

  // Backend Health Check
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch('https://68edd79f78d7cef650777246--son1k.netlify.app/.netlify/functions/health', {
          headers: {
            'x-client-id': 'the-generator'
          }
        });
        
        if (response.ok) {
          setIsBackendOnline(true);
          setError(null);
        } else {
          setIsBackendOnline(false);
          setError('Backend connection failed');
        }
      } catch (err) {
        setIsBackendOnline(false);
        setError('Backend offline');
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle knob changes
  const handleKnobChange = (key: string, value: number) => {
    setKnobs({ ...knobs, [key]: value });
  };

  // Generate Lyrics with Narrative Structure
  const handleGenerateLyrics = async () => {
    if (!isBackendOnline) {
      setError('Backend offline - cannot generate lyrics');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('generating');
    setError(null);

    try {
      const request = {
        prompt: prompt || 'Create a compelling song with narrative structure',
        literaryKnobs: knobs,
        voiceGender,
        isInstrumental: false
      };

      const response = await backendService.generateStructuredLyrics(request);
      
      if (response.success && response.lyrics) {
        setLyrics(response.lyrics);
        setGeneratedContent(prev => ({ ...prev, lyrics: response.lyrics }));
        setGenerationStatus('complete');
      } else {
        throw new Error(response.error || 'Failed to generate lyrics');
      }
    } catch (err: any) {
      setError(err.message);
      setGenerationStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Creative Prompt
  const handleGeneratePrompt = async () => {
    if (!isBackendOnline) {
      setError('Backend offline - cannot generate prompt');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('generating');
    setError(null);

    try {
      const request = {
        basePrompt: prompt || 'Create a musical style prompt',
        literaryKnobs: knobs,
        creativityLevel: knobs.poeticComplexity || 50
      };

      const response = await backendService.generateIntelligentPrompts(request);
      
      if (response.success && response.prompts) {
        setPrompt(response.prompts[0] || response.prompts);
        setGeneratedContent(prev => ({ ...prev, prompt: response.prompts[0] || response.prompts }));
        setGenerationStatus('complete');
      } else {
        throw new Error(response.error || 'Failed to generate prompt');
      }
    } catch (err: any) {
      setError(err.message);
      setGenerationStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Complete Music
  const handleGenerateMusic = async () => {
    if (!isBackendOnline) {
      setError('Backend offline - cannot generate music');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('generating');
    setError(null);

    try {
      // This would integrate with the actual music generation service
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setGenerationStatus('complete');
      setGeneratedContent(prev => ({ 
        ...prev, 
        audioUrl: 'https://example.com/generated-track.mp3' 
      }));
    } catch (err: any) {
      setError(err.message);
      setGenerationStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio Player Controls
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleStop = () => {
    setIsPlaying(false);
    setPosition(0);
  };
  const handleVolumeChange = (newVolume: number) => setVolume(newVolume);
  const handleSeek = (newPosition: number) => setPosition(newPosition);
  const handleTrackSelect = (trackId: string) => setCurrentTrack(trackId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Son1kVers3 Generator</h1>
              <p className="text-gray-400">Professional Music Generation Studio</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isBackendOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isBackendOnline ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-sm font-medium">
                {isBackendOnline ? 'Backend Online' : 'Backend Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Literary Knob Panel */}
        <LiteraryKnobPanel knobs={knobs} onKnobChange={handleKnobChange} />

        {/* Content Generation Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Lyrics Section */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Lyrics Generation</h3>
                <Button
                  onClick={handleGenerateLyrics}
                  disabled={!isBackendOnline || isGenerating || isInstrumental}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate Lyrics
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Lyrics Content</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter lyrics or let AI generate structured, narrative-driven content..."
                  className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  disabled={isInstrumental}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{lyrics.length} characters</span>
                  <span>{isInstrumental ? 'Disabled in Instrumental Mode' : 'Active'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Prompt Section */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Creative Prompt</h3>
                <Button
                  onClick={handleGeneratePrompt}
                  disabled={!isBackendOnline || isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate Prompt
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Musical Style Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the musical style, mood, genre, and creative direction..."
                  className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                />
                <div className="text-xs text-gray-400">
                  {prompt.length} characters
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Voice and Mode Controls */}
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Voice & Mode Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voice Selection */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Voice Gender</h4>
                <div className="flex space-x-3">
                  {[
                    { value: 'male', label: 'Male', icon: Mic },
                    { value: 'female', label: 'Female', icon: Mic },
                    { value: 'random', label: 'Random', icon: Mic }
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={voiceGender === value ? 'default' : 'outline'}
                      onClick={() => setVoiceGender(value as any)}
                      className={`flex items-center space-x-2 ${
                        voiceGender === value 
                          ? 'bg-blue-500 text-white' 
                          : 'border-gray-600 text-gray-300 hover:border-blue-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Instrumental Mode */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Generation Mode</h4>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={isInstrumental}
                    onCheckedChange={setIsInstrumental}
                  />
                  <span className="text-sm text-gray-300">Instrumental Mode</span>
                  {isInstrumental && (
                    <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                      Lyrics disabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Generation Status */}
        <AnimatePresence>
          {generationStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {generationStatus === 'generating' && <Loader2 className="w-5 h-5 animate-spin text-blue-400" />}
                    {generationStatus === 'complete' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {generationStatus === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {generationStatus === 'generating' && 'Generating Content...'}
                        {generationStatus === 'complete' && 'Generation Complete'}
                        {generationStatus === 'error' && 'Generation Failed'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {generationStatus === 'generating' && 'Processing your request with AI...'}
                        {generationStatus === 'complete' && 'Content generated successfully'}
                        {generationStatus === 'error' && error}
                      </p>
                    </div>
                  </div>
                  
                  {generationStatus === 'complete' && (
                    <Button
                      onClick={handleGenerateMusic}
                      disabled={!isBackendOnline || isGenerating}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    >
                      <Music className="w-4 h-4 mr-2" />
                      Generate Music
                    </Button>
                  )}
                </div>
                
                {generationStatus === 'generating' && (
                  <div className="mt-4">
                    <Progress value={66} className="w-full" />
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Professional Audio Player */}
        <ProfessionalAudioPlayer
          tracks={tracks}
          onTrackSelect={handleTrackSelect}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
          isPlaying={isPlaying}
          currentTrack={currentTrack}
          volume={volume}
          position={position}
          duration={duration}
        />

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="border-red-500 bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-400" />
                <AlertTitle className="text-red-400">Generation Error</AlertTitle>
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TheGeneratorProfessional;
