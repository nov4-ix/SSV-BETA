import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { musicService, MusicGeneration, MusicGenerationRequest } from '../services/music.service';
import { clientManager } from '../services/clientManager';
import { useSunoService } from '../hooks/useSunoService';
import { UsageLimit } from './UsageLimit';
import { Play, Pause, Download, Trash2, RefreshCw, Music, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const generationSchema = z.object({
  prompt: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  style: z.string().min(1, 'Selecciona un estilo'),
  title: z.string().min(1, 'Ingresa un título'),
  model: z.enum(['3.5', '5']),
  instrumental: z.boolean().default(false),
  lyrics: z.string().optional(),
  gender: z.enum(['male', 'female', 'mixed']).optional(),
});

type GenerationFormData = z.infer<typeof generationSchema>;

export const MusicGenerator: React.FC = () => {
  const { user } = useAuthStore();
  const { isGenerating, isConnected, error: sunoError, generateMusic: sunoGenerate } = useSunoService();
  const [generations, setGenerations] = useState<MusicGeneration[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [limits, setLimits] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<GenerationFormData>({
    resolver: zodResolver(generationSchema),
    defaultValues: {
      model: '3.5',
      instrumental: false,
    },
  });

  const selectedModel = watch('model');

  // Cargar generaciones y límites
  useEffect(() => {
    loadGenerations();
    loadLimits();
  }, []);

  const loadGenerations = async () => {
    try {
      const data = await musicService.getGenerations();
      setGenerations(data.generations);
    } catch (error) {
      console.error('Error loading generations:', error);
    }
  };

  const loadLimits = async () => {
    try {
      const data = await musicService.getLimits();
      setLimits(data);
    } catch (error) {
      console.error('Error loading limits:', error);
    }
  };

  const onSubmit = async (data: GenerationFormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión para generar música');
      return;
    }

    // Verificar límites del cliente
    if (!clientManager.canGenerate()) {
      toast.error('Límite de generaciones del cliente alcanzado');
      return;
    }

    // Verificar límites del usuario
    try {
      const canGenerate = await musicService.checkCanGenerate(data.model);
      if (!canGenerate.canGenerate) {
        toast.error(canGenerate.reason || 'Límite alcanzado');
        return;
      }
    } catch (error) {
      toast.error('Error verificando límites');
      return;
    }

    setIsLoading(true);
    try {
      const generationData: MusicGenerationRequest = {
        prompt: data.prompt,
        style: data.style,
        title: data.title,
        model: data.model,
        customMode: !!data.lyrics,
        instrumental: data.instrumental,
        lyrics: data.lyrics,
        gender: data.gender,
      };

      await musicService.generateMusic(generationData);
      
      // Registrar generación en el cliente
      await clientManager.registerGeneration();
      
      toast.success('🎵 Generación iniciada exitosamente');
      reset();
      loadGenerations();
      loadLimits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar música');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async (generation: MusicGeneration) => {
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
  };

  const handleCancel = async (generation: MusicGeneration) => {
    if (generation.status === 'pending' || generation.status === 'processing') {
      try {
        await musicService.cancelGeneration(generation.id);
        toast.success('Generación cancelada');
        loadGenerations();
      } catch (error) {
        toast.error('Error al cancelar generación');
      }
    }
  };

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

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Music className="w-16 h-16 mx-auto mb-4" />
          <p>Debes iniciar sesión para generar música</p>
        </div>
      </div>
    );
  }

  return (
    <div className="music-generator max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-cyan mb-2">Son1kVerse AI Music</h1>
            <p className="text-accent">
              Crea música profesional con nuestra IA avanzada - Solo usuarios registrados
            </p>
          </div>
          
          {/* Estado de conexión */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-300">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
        
        {/* Error de conexión */}
        {sunoError && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {sunoError}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Limits */}
        <div className="lg:col-span-1">
          <UsageLimit />
        </div>

        {/* Generation Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 border border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-cyan mb-4">Crear con Son1kVerse AI</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-cyan mb-2">
                  Motor de IA Son1kVerse
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer p-3 border rounded-lg transition-colors ${
                    selectedModel === '3.5' 
                      ? 'border-cyan bg-cyan-500/20 text-cyan' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <input
                      {...register('model')}
                      type="radio"
                      value="3.5"
                      className="sr-only"
                    />
                    <div className="text-center">
                      <Zap className="w-6 h-6 mx-auto mb-1" />
                      <div className="font-medium">Son1kVerse Pro</div>
                      <div className="text-xs text-gray-400">Más rápido</div>
                    </div>
                  </label>
                  
                  <label className={`cursor-pointer p-3 border rounded-lg transition-colors ${
                    selectedModel === '5' 
                      ? 'border-purple bg-purple-500/20 text-purple-400' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <input
                      {...register('model')}
                      type="radio"
                      value="5"
                      className="sr-only"
                    />
                    <div className="text-center">
                      <Zap className="w-6 h-6 mx-auto mb-1" />
                      <div className="font-medium">Son1kVerse Ultra</div>
                      <div className="text-xs text-gray-400">Máxima calidad</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-cyan mb-2">
                  Título de la canción
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan focus:outline-none"
                  placeholder="Mi canción increíble"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-cyan mb-2">
                  Descripción de la música
                </label>
                <textarea
                  {...register('prompt')}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan focus:outline-none"
                  rows={3}
                  placeholder="Describe el tipo de música que quieres generar..."
                />
                {errors.prompt && (
                  <p className="text-red-400 text-sm mt-1">{errors.prompt.message}</p>
                )}
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-cyan mb-2">
                  Estilo musical
                </label>
                <select
                  {...register('style')}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan focus:outline-none"
                >
                  <option value="">Seleccionar estilo</option>
                  {musicStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
                {errors.style && (
                  <p className="text-red-400 text-sm mt-1">{errors.style.message}</p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('instrumental')}
                    type="checkbox"
                    className="w-4 h-4 text-cyan bg-gray-800 border-gray-600 rounded focus:ring-cyan"
                  />
                  <span className="text-gray-300">Solo instrumental</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-4 bg-gradient-to-r from-cyan to-purple text-bg-primary font-bold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5" />
                    Crear con Son1kVerse AI
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Generations List */}
      {generations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h3 className="text-2xl font-bold text-cyan mb-4">Generaciones Recientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.map((generation) => (
              <motion.div
                key={generation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{generation.title}</h4>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                      {generation.prompt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{generation.style}</span>
                      <span>Modelo {generation.model}</span>
                      <span className={musicService.getStatusColor(generation.status)}>
                        {musicService.getStatusText(generation.status)}
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
        </motion.div>
      )}
    </div>
  );
};
