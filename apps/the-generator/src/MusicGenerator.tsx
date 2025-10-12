import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from './store/authStore';
import { musicService, MusicGeneration, MusicGenerationRequest } from './services/music.service';
import { clientManager } from './services/clientManager';
import { useSunoService } from './hooks/useSunoService';
import { UsageLimit } from './components/UsageLimit';
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
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [generationsData, limitsData] = await Promise.all([
          musicService.getGenerations(),
          musicService.getLimits()
        ]);
        setGenerations(generationsData);
        setLimits(limitsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error cargando datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const onSubmit = async (data: GenerationFormData) => {
    try {
      // FORMATO ESPECÍFICO - Forzar instrumentos eléctricos cuando sea necesario
      // Detectar instrumentos eléctricos y agregar instrucciones específicas

      let finalPrompt = '';

      // Detectar si el prompt menciona instrumentos eléctricos
      const hasElectricInstruments = /electric|overdrive|distortion|rock|metal|punk|indie|alternative/i.test(data.prompt);

      if (data.instrumental) {
        if (hasElectricInstruments) {
          finalPrompt = `ELECTRIC GUITARS ONLY, NO ACOUSTIC: [${data.style.toUpperCase()}] ${data.prompt}`;
        } else {
          finalPrompt = `[${data.style.toUpperCase()}] ${data.prompt}`;
        }
      } else if (data.lyrics) {
        if (hasElectricInstruments) {
          finalPrompt = `ELECTRIC GUITARS ONLY, NO ACOUSTIC: [${data.style.toUpperCase()}] ${data.prompt}\n\n[Verse 1]\n${data.lyrics}`;
        } else {
          finalPrompt = `[${data.style.toUpperCase()}] ${data.prompt}\n\n[Verse 1]\n${data.lyrics}`;
        }
      } else {
        if (hasElectricInstruments) {
          finalPrompt = `ELECTRIC GUITARS ONLY, NO ACOUSTIC: [${data.style.toUpperCase()}] ${data.prompt}`;
        } else {
          finalPrompt = `[${data.style.toUpperCase()}] ${data.prompt}`;
        }
      }

      const generationData: MusicGenerationRequest = {
        prompt: finalPrompt,
        style: data.style,
        title: data.title,
        model: data.model,
        customMode: !!data.lyrics,
        instrumental: data.instrumental,
        lyrics: data.lyrics,
        gender: data.gender,
      };

      await musicService.generateMusic(generationData);
      
      // Recargar generaciones después de crear una nueva
      const updatedGenerations = await musicService.getGenerations();
      setGenerations(updatedGenerations);
      
      toast.success('¡Música generada exitosamente!');
      reset();
    } catch (error: any) {
      console.error('Error generating music:', error);
      toast.error(error.message || 'Error generando música');
    }
  };

  const handlePlayPause = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await musicService.deleteGeneration(id);
      setGenerations(generations.filter(g => g.id !== id));
      toast.success('Generación eliminada');
    } catch (error) {
      toast.error('Error eliminando generación');
    }
  };

  const handleDownload = async (generation: MusicGeneration) => {
    try {
      await musicService.downloadGeneration(generation.id);
      toast.success('Descarga iniciada');
    } catch (error) {
      toast.error('Error descargando archivo');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando The Generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎵</span>
              </div>
              <div className="text-white font-bold text-xl">The Generator</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-gray-300">
                Bienvenido, <span className="text-green-400 font-semibold">{user?.name || user?.email}</span>
              </div>
              <button 
                onClick={() => window.location.href = 'https://son1kvers3.com'}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                ← Volver a Son1kverse
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Generación */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Generar Música</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título de la canción
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Mi canción increíble"
                    disabled={isGenerating}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Estilo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estilo musical
                  </label>
                  <select
                    {...register('style')}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                    disabled={isGenerating}
                  >
                    <option value="">Selecciona un estilo</option>
                    <option value="indie rock">Indie Rock</option>
                    <option value="alternative">Alternative</option>
                    <option value="pop">Pop</option>
                    <option value="electronic">Electronic</option>
                    <option value="hip hop">Hip Hop</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="folk">Folk</option>
                    <option value="metal">Metal</option>
                    <option value="punk">Punk</option>
                  </select>
                  {errors.style && (
                    <p className="text-red-400 text-sm mt-1">{errors.style.message}</p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción del estilo
                  </label>
                  <textarea
                    {...register('prompt')}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Describe el estilo, instrumentos, tempo, mood..."
                    disabled={isGenerating}
                  />
                  {errors.prompt && (
                    <p className="text-red-400 text-sm mt-1">{errors.prompt.message}</p>
                  )}
                </div>

                {/* Letras */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Letras (opcional)
                  </label>
                  <textarea
                    {...register('lyrics')}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Escribe las letras aquí..."
                    disabled={isGenerating}
                  />
                </div>

                {/* Opciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Modelo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Modelo
                    </label>
                    <select
                      {...register('model')}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                      disabled={isGenerating}
                    >
                      <option value="3.5">Suno 3.5</option>
                      <option value="5">Suno 5</option>
                    </select>
                  </div>

                  {/* Instrumental */}
                  <div className="flex items-center space-x-3 pt-8">
                    <input
                      {...register('instrumental')}
                      type="checkbox"
                      id="instrumental"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
                      disabled={isGenerating}
                    />
                    <label htmlFor="instrumental" className="text-sm font-medium text-gray-300">
                      Solo instrumental
                    </label>
                  </div>

                  {/* Género de voz */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Género de voz
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none transition-colors"
                      disabled={isGenerating}
                    >
                      <option value="mixed">Mixto</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                    </select>
                  </div>
                </div>

                {/* Botón de generación */}
                <button
                  type="submit"
                  disabled={isGenerating || !isConnected}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generando música...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generar Música
                    </>
                  )}
                </button>

                {/* Estado de conexión */}
                {!isConnected && (
                  <div className="text-center text-yellow-400 text-sm">
                    ⚠️ Conectando con Suno AI...
                  </div>
                )}

                {sunoError && (
                  <div className="text-center text-red-400 text-sm">
                    ❌ Error: {sunoError}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Límites de uso */}
            {limits && <UsageLimit limits={limits} />}

            {/* Estado de conexión */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Estado del Sistema</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Suno AI</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Generaciones</span>
                  <span className="text-white">{generations.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de generaciones */}
        {generations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Mis Generaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map((generation) => (
                <div key={generation.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{generation.title}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePlayPause(generation.id)}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        {playingId === generation.id ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(generation)}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(generation.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div><span className="text-gray-500">Estilo:</span> {generation.style}</div>
                    <div><span className="text-gray-500">Modelo:</span> {generation.model}</div>
                    <div><span className="text-gray-500">Fecha:</span> {new Date(generation.createdAt).toLocaleDateString()}</div>
                  </div>

                  {generation.audioUrl && (
                    <div className="mt-4">
                      <audio
                        controls
                        className="w-full"
                        src={generation.audioUrl}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};