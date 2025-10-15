import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Download, Volume2, VolumeX, SkipForward, SkipBack,
  Loader2, CheckCircle, XCircle, Mic, MicOff, Music, Zap,
  Settings, SlidersHorizontal, Headphones, Guitar, Drumstick, Piano,
  ChevronLeft, ChevronRight, RotateCcw, Save, Upload, Trash2,
  Maximize2, Minimize2, MoreHorizontal, Copy, Share2, FileText, Brain
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

// Professional Knob Component
const ProfessionalKnob: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  icon: React.ReactNode;
  tooltip: string;
}> = ({ label, value, onChange, color, icon, tooltip }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, value: 0 });
  const knobRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, value });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStart.y - e.clientY;
    const deltaX = e.clientX - dragStart.x;
    const delta = deltaY + deltaX;
    const sensitivity = 0.5;
    const newValue = Math.max(0, Math.min(100, dragStart.value + delta * sensitivity));
    
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const rotation = (value / 100) * 270 - 135;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full border-2 border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl relative overflow-hidden cursor-pointer"
                style={{
                  background: `conic-gradient(from 0deg, ${color}20, ${color}80, ${color}20)`,
                  boxShadow: `0 0 20px ${color}40, inset 0 0 20px rgba(0,0,0,0.5)`
                }}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm">
                  <div 
                    className="absolute top-1 left-1/2 w-0.5 h-4 bg-white origin-bottom transform -translate-x-1/2"
                    style={{
                      transform: `translateX(-50%) rotate(${rotation}deg)`,
                      boxShadow: `0 0 8px ${color}`
                    }}
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="text-white/80 transition-all duration-200 group-hover:text-white"
                      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                    >
                      {icon}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-mono border border-gray-700">
                  {Math.round(value)}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 text-center max-w-16 leading-tight">
              {label}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Two-Track Audio Player
const TwoTrackPlayer: React.FC<{
  tracks: Array<{ id: string; name: string; url: string; duration: number }>;
  onTrackSelect: (trackId: string) => void;
  onPlay: () => void;
  onPause: () => void;
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
  onVolumeChange,
  onSeek,
  isPlaying,
  currentTrack,
  volume,
  position,
  duration
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    onSeek((newProgress / 100) * duration);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">Audio Engine</h3>
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
                currentTrack === track.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
              onClick={() => onTrackSelect(track.id)}
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
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
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{formatTime(position)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer" onClick={handleProgressClick}>
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              style={{ width: `${(position / duration) * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${(position / duration) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center space-x-4">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <div className="flex items-center space-x-2">
          <Slider
            value={[volume]}
            onValueChange={([value]) => onVolumeChange(value)}
            max={100}
            step={1}
            className="w-32"
          />
          <span className="text-sm text-gray-400 w-8">{Math.round(volume)}</span>
        </div>
      </div>
    </div>
  );
};

// Main Component
const TheGeneratorClean: React.FC = () => {
  const { knobs, setKnobs } = useGeneratorStore();
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState(75);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(180);
  
  // Content State
  const [lyrics, setLyrics] = useState('');
  const [prompt, setPrompt] = useState('');
  
  // Voice and Mode Settings
  const [voiceGender, setVoiceGender] = useState<'male' | 'female' | 'random'>('male');
  const [isInstrumental, setIsInstrumental] = useState(false);

  // Two tracks for the player
  const tracks = [
    {
      id: 'track1',
      name: 'Track A',
      url: '',
      duration: 180
    },
    {
      id: 'track2', 
      name: 'Track B',
      url: '',
      duration: 180
    }
  ];

  const API_BASE = 'https://68edd79f78d7cef650777246--son1k.netlify.app/.netlify/functions';

  // Backend Health Check
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`, {
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

  // Generate Lyrics
  const handleGenerateLyrics = async () => {
    if (!isBackendOnline) {
      setError('Backend offline - cannot generate lyrics');
      return;
    }

    setIsGenerating(true);
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
      } else {
        throw new Error(response.error || 'Failed to generate lyrics');
      }
    } catch (err: any) {
      setError(err.message);
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
      } else {
        throw new Error(response.error || 'Failed to generate prompt');
      }
    } catch (err: any) {
      setError(err.message);
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
    setError(null);

    try {
      // This would integrate with the actual music generation service
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio Player Controls
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleVolumeChange = (newVolume: number) => setVolume(newVolume);
  const handleSeek = (newPosition: number) => setPosition(newPosition);
  const handleTrackSelect = (trackId: string) => setCurrentTrack(trackId);

  // Knob configurations
  const knobConfigs = [
    { key: 'narrativeDepth', label: 'Narrative', icon: <FileText className="w-4 h-4" />, color: '#8b5cf6', tooltip: 'Story complexity and layering' },
    { key: 'emotionalIntensity', label: 'Emotion', icon: <Brain className="w-4 h-4" />, color: '#ef4444', tooltip: 'Emotional impact and resonance' },
    { key: 'poeticComplexity', label: 'Poetry', icon: <Zap className="w-4 h-4" />, color: '#a855f7', tooltip: 'Literary sophistication' },
    { key: 'metaphorUsage', label: 'Metaphor', icon: <Settings className="w-4 h-4" />, color: '#6366f1', tooltip: 'Figurative language density' },
    { key: 'rhythmDensity', label: 'Rhythm', icon: <Music className="w-4 h-4" />, color: '#3b82f6', tooltip: 'Flow and syllabic patterns' },
    { key: 'storyArc', label: 'Story Arc', icon: <SlidersHorizontal className="w-4 h-4" />, color: '#10b981', tooltip: 'Narrative progression strength' },
    { key: 'characterDevelopment', label: 'Character', icon: <Mic className="w-4 h-4" />, color: '#06b6d4', tooltip: 'Character depth and evolution' },
    { key: 'thematicConsistency', label: 'Theme', icon: <Headphones className="w-4 h-4" />, color: '#f59e0b', tooltip: 'Coherence and unity' }
  ];

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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Literary Controls */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Literary Controls</h3>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  {knobConfigs.map((config) => (
                    <ProfessionalKnob
                      key={config.key}
                      label={config.label}
                      value={knobs[config.key] || 50}
                      onChange={(value) => handleKnobChange(config.key, value)}
                      color={config.color}
                      icon={config.icon}
                      tooltip={config.tooltip}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Center Column - Content Generation */}
          <div className="space-y-6">
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
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
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
                  <h3 className="text-lg font-semibold text-white">Music Prompt</h3>
                  <Button
                    onClick={handleGeneratePrompt}
                    disabled={!isBackendOnline || isGenerating}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
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

            {/* Generate Music Button */}
            <Button
              onClick={handleGenerateMusic}
              disabled={!isBackendOnline || isGenerating || (!lyrics && !isInstrumental)}
              className="w-full py-4 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 hover:from-purple-600 hover:via-blue-600 hover:to-green-600 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 rounded-xl transition-all duration-200 shadow-2xl hover:shadow-3xl disabled:shadow-none text-lg font-semibold flex items-center justify-center space-x-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Generating Music...</span>
                </>
              ) : (
                <>
                  <Music className="w-6 h-6" />
                  <span>Generate Music</span>
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Audio Player */}
          <div className="space-y-6">
            <TwoTrackPlayer
              tracks={tracks}
              onTrackSelect={handleTrackSelect}
              onPlay={handlePlay}
              onPause={handlePause}
              onVolumeChange={handleVolumeChange}
              onSeek={handleSeek}
              isPlaying={isPlaying}
              currentTrack={currentTrack}
              volume={volume}
              position={position}
              duration={duration}
            />
          </div>
        </div>

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

export default TheGeneratorClean;
