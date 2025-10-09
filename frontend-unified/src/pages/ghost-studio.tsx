import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Play, Pause, Download, Trash2, RefreshCw } from 'lucide-react';

interface MusicGeneration {
  id: string;
  prompt: string;
  duration: number;
  genre?: string;
  mood?: string;
  tempo?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  waveformUrl?: string;
  createdAt: string;
  completedAt?: string;
}

interface GenerationRequest {
  prompt: string;
  duration: number;
  genre?: string;
  mood?: string;
  tempo?: number;
  key?: string;
  instruments?: string[];
  style?: string;
}

// API Service
const apiService = {
  generateMusic: async (data: GenerationRequest): Promise<MusicGeneration> => {
    const response = await fetch('/api/v1/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate music');
    }

    return response.json();
  },

  getGenerations: async (): Promise<{ generations: MusicGeneration[] }> => {
    const response = await fetch('/api/v1/generations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch generations');
    }

    return response.json();
  },

  getGenerationStatus: async (id: string): Promise<MusicGeneration> => {
    const response = await fetch(`/api/v1/generations/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch generation status');
    }

    return response.json();
  },

  cancelGeneration: async (id: string): Promise<void> => {
    const response = await fetch(`/api/v1/generations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel generation');
    }
  },
};

export function GhostStudio() {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentStyle, setCurrentStyle] = useState('electronic');
  const [currentDuration, setCurrentDuration] = useState(30);
  const [currentMood, setCurrentMood] = useState('');
  const [currentTempo, setCurrentTempo] = useState<number | undefined>();
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Queries
  const { data: generationsData, refetch } = useQuery({
    queryKey: ['generations'],
    queryFn: apiService.getGenerations,
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });

  // Mutations
  const generateMutation = useMutation({
    mutationFn: apiService.generateMusic,
    onSuccess: () => {
      toast.success('🎵 Generación iniciada exitosamente');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: apiService.cancelGeneration,
    onSuccess: () => {
      toast.success('Generación cancelada');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const musicStyles = [
    { value: 'electronic', label: 'Electronic' },
    { value: 'ambient', label: 'Ambient' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'synthwave', label: 'Synthwave' },
    { value: 'drum-and-bass', label: 'Drum & Bass' },
    { value: 'techno', label: 'Techno' },
    { value: 'house', label: 'House' },
    { value: 'trance', label: 'Trance' },
    { value: 'rock', label: 'Rock' },
    { value: 'pop', label: 'Pop' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'classical', label: 'Classical' },
  ];

  const moods = [
    { value: 'energetic', label: 'Energetic' },
    { value: 'calm', label: 'Calm' },
    { value: 'dark', label: 'Dark' },
    { value: 'uplifting', label: 'Uplifting' },
    { value: 'melancholic', label: 'Melancholic' },
    { value: 'mysterious', label: 'Mysterious' },
  ];

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPrompt.trim()) {
      toast.error('Por favor ingresa una descripción');
      return;
    }

    generateMutation.mutate({
      prompt: currentPrompt,
      duration: currentDuration,
      genre: currentStyle,
      mood: currentMood || undefined,
      tempo: currentTempo,
    });
  }, [currentPrompt, currentDuration, currentStyle, currentMood, currentTempo, generateMutation]);

  const handlePlay = useCallback((generation: MusicGeneration) => {
    if (!generation.audioUrl) return;

    const audio = new Audio(generation.audioUrl);
    
    if (playingId === generation.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      if (playingId) {
        const currentAudio = document.querySelector('audio');
        if (currentAudio) currentAudio.pause();
      }
      
      audio.play();
      setPlayingId(generation.id);
      
      audio.onended = () => setPlayingId(null);
    }
  }, [playingId]);

  const handleCancel = useCallback((generation: MusicGeneration) => {
    if (generation.status === 'pending' || generation.status === 'processing') {
      cancelMutation.mutate(generation.id);
    }
  }, [cancelMutation]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'processing': return 'Procesando...';
      case 'failed': return 'Fallido';
      default: return 'Pendiente';
    }
  };

  return (
    <div className="ghost-studio min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Ghost Studio</h1>
          <p className="text-gray-300">
            Producción musical con Suno AI - Genera música profesional con IA
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Generar Música</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    Descripción de la música
                  </label>
                  <textarea
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    placeholder="Describe el tipo de música que quieres generar... (ej: 'Una canción cyberpunk con sintetizadores oscuros y ritmo acelerado')"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                    rows={4}
                    disabled={generateMutation.isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      Estilo musical
                    </label>
                    <select
                      value={currentStyle}
                      onChange={(e) => setCurrentStyle(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                      disabled={generateMutation.isPending}
                    >
                      {musicStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      Duración (segundos)
                    </label>
                    <select
                      value={currentDuration}
                      onChange={(e) => setCurrentDuration(Number(e.target.value))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                      disabled={generateMutation.isPending}
                    >
                      <option value={15}>15 segundos</option>
                      <option value={30}>30 segundos</option>
                      <option value={60}>1 minuto</option>
                      <option value={120}>2 minutos</option>
                      <option value={180}>3 minutos</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      Mood (opcional)
                    </label>
                    <select
                      value={currentMood}
                      onChange={(e) => setCurrentMood(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                      disabled={generateMutation.isPending}
                    >
                      <option value="">Seleccionar mood</option>
                      {moods.map((mood) => (
                        <option key={mood.value} value={mood.value}>
                          {mood.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      Tempo BPM (opcional)
                    </label>
                    <input
                      type="number"
                      value={currentTempo || ''}
                      onChange={(e) => setCurrentTempo(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="120"
                      min="60"
                      max="200"
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                      disabled={generateMutation.isPending}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full p-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={generateMutation.isPending || !currentPrompt.trim()}
                >
                  {generateMutation.isPending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      🎵 Generar Música
                    </>
                  )}
                </button>
              </form>

              {/* Tips */}
              <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-cyan-400 mb-2">💡 Consejos para mejores resultados:</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Sé específico sobre el género y mood</li>
                  <li>• Menciona instrumentos específicos</li>
                  <li>• Incluye referencias de tempo (lento, rápido, moderado)</li>
                  <li>• Describe la atmósfera emocional</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Generations List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Generaciones Recientes</h3>
            
            {generationsData?.generations?.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No hay generaciones aún</p>
                <p className="text-sm text-gray-500 mt-2">Crea tu primera canción con IA</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generationsData?.generations?.map((generation) => (
                  <motion.div
                    key={generation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 mb-1 line-clamp-2">
                          {generation.prompt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{generation.genre}</span>
                          <span>{formatDuration(generation.duration)}</span>
                          <span className={getStatusColor(generation.status)}>
                            {getStatusText(generation.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {generation.status === 'completed' && generation.audioUrl && (
                          <button
                            onClick={() => handlePlay(generation)}
                            className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                          >
                            {playingId === generation.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {(generation.status === 'pending' || generation.status === 'processing') && (
                          <button
                            onClick={() => handleCancel(generation)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {generation.status === 'completed' && generation.audioUrl && (
                          <a
                            href={generation.audioUrl}
                            download
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {generation.status === 'processing' && (
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-cyan-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
