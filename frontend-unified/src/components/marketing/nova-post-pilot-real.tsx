import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Target, 
  BarChart3, 
  Zap,
  Users,
  Clock,
  Hash,
  Share2,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  Rocket
} from 'lucide-react';

// 📱 NOVA POST PILOT REAL - ANÁLISIS DE ALGORITMOS + QWEN IA + MARKETING INTELIGENTE 📱

interface UserProfile {
  userId: string;
  username: string;
  contentType: 'music' | 'lifestyle' | 'tech' | 'fitness' | 'food' | 'travel' | 'fashion' | 'education' | 'entertainment';
  currentPlatforms: ('instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin')[];
  followerCount: number;
  engagementRate: number;
  brandVoice: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational' | 'trendy';
  goals: ('growth' | 'engagement' | 'sales' | 'brand_awareness' | 'community_building')[];
}

interface AlgorithmAnalysis {
  platform: string;
  algorithmInsights: {
    bestPostingTimes: string[];
    optimalContentLength: string;
    engagementTriggers: string[];
    shadowbanTriggers: string[];
    trendingTopics: string[];
    hashtagStrategy: string;
    contentMix: {
      educational: number;
      entertaining: number;
      promotional: number;
      personal: number;
    };
  };
  recommendations: string[];
  score: number;
}

interface ViralHook {
  id: string;
  title: string;
  description: string;
  category: 'trending' | 'evergreen' | 'seasonal' | 'viral';
  platforms: string[];
  expectedReach: number;
  engagementScore: number;
  template: {
    hook: string;
    body: string;
    callToAction: string;
    hashtags: string[];
    optimalPostingTime: string;
  };
  trendData: {
    currentMomentum: number;
    peakTime: string;
    relatedTrends: string[];
    competitorAnalysis: string[];
  };
}

interface QwenAnalysis {
  marketAnalysis: {
    targetAudience: {
      demographics: string[];
      psychographics: string[];
      painPoints: string[];
      interests: string[];
    };
    competitorLandscape: {
      topCompetitors: string[];
      marketShare: Record<string, number>;
      contentGaps: string[];
    };
    trendAnalysis: {
      currentTrends: string[];
      emergingTrends: string[];
      decliningTrends: string[];
    };
  };
  contentStrategy: {
    recommendedContentMix: Record<string, number>;
    optimalPostingSchedule: Record<string, string[]>;
    engagementStrategy: string[];
    growthStrategy: string[];
  };
  personalizedRecommendations: string[];
}

interface NovaPostPilotProps {
  userId?: string;
  onAnalysisComplete?: (analysis: any) => void;
  onContentScheduled?: (calendar: any) => void;
}

export function NovaPostPilot({ 
  userId, 
  onAnalysisComplete, 
  onContentScheduled 
}: NovaPostPilotProps) {
  const [activeStep, setActiveStep] = useState<'profile' | 'analysis' | 'hooks' | 'calendar' | 'publish'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [qwenAnalysis, setQwenAnalysis] = useState<QwenAnalysis | null>(null);
  const [algorithmAnalyses, setAlgorithmAnalyses] = useState<AlgorithmAnalysis[]>([]);
  const [viralHooks, setViralHooks] = useState<ViralHook[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  // 🧠 EJECUTAR ANÁLISIS COMPLETO CON QWEN IA 🧠
  const executeCompleteAnalysis = useCallback(async (profile: UserProfile) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simular progreso del análisis
      const progressSteps = [
        'Analizando perfil de usuario...',
        'Estudiando algoritmos de redes sociales...',
        'Identificando tendencias virales...',
        'Generando ganchos personalizados...',
        'Creando calendario optimizado...'
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        setAnalysisProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Simular llamada a la API real
      const response = await fetch('/api/v1/nova-post-pilot/complete-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: profile, week: 'current' })
      });

      const result = await response.json();

      setQwenAnalysis(result.qwenAnalysis);
      setAlgorithmAnalyses(result.algorithmAnalyses);
      setViralHooks(result.viralHooks);
      
      onAnalysisComplete?.(result);
      setActiveStep('hooks');

    } catch (error) {
      console.error('Error in complete analysis:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }
  }, [onAnalysisComplete]);

  // 📊 RENDERIZAR ANÁLISIS DE ALGORITMOS 📊
  const renderAlgorithmAnalysis = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
        <Brain className="w-6 h-6" />
        Análisis de Algoritmos por Plataforma
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {algorithmAnalyses.map((analysis) => (
          <motion.div
            key={analysis.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 border border-gray-700 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white capitalize">
                {analysis.platform}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">{analysis.score}/100</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Mejores Horarios</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.algorithmInsights.bestPostingTimes.slice(0, 3).map((time) => (
                    <span key={time} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Triggers de Engagement</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.algorithmInsights.engagementTriggers.slice(0, 3).map((trigger) => (
                    <span key={trigger} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Tendencias</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.algorithmInsights.trendingTopics.slice(0, 3).map((topic) => (
                    <span key={topic} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Mix de Contenido</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.algorithmInsights.contentMix).map(([type, percentage]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 capitalize">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-cyan-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // 🎯 RENDERIZAR GANCHOS VIRALES 🎯
  const renderViralHooks = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
        <Zap className="w-6 h-6" />
        Ganchos Virales Semanales
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {viralHooks.map((hook) => (
          <motion.div
            key={hook.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-500/10 to-purple-500/10 border border-green-500/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{hook.title}</h3>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">{hook.engagementScore}/100</span>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4">{hook.description}</p>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">Template</h4>
                <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                  <div className="text-white font-medium mb-1">{hook.template.hook}</div>
                  <div className="text-gray-300 mb-2">{hook.template.body}</div>
                  <div className="text-cyan-400">{hook.template.callToAction}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">Hashtags</h4>
                <div className="flex flex-wrap gap-1">
                  {hook.template.hashtags.map((hashtag) => (
                    <span key={hashtag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">Datos de Tendencia</h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Momentum</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${hook.trendData.currentMomentum}%` }}
                      />
                    </div>
                    <span className="text-gray-400">{hook.trendData.currentMomentum}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Alcance esperado: {hook.expectedReach.toLocaleString()}</span>
                <span>Hora óptima: {hook.template.optimalPostingTime}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // 🧠 RENDERIZAR ANÁLISIS DE QWEN IA 🧠
  const renderQwenAnalysis = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
        <Brain className="w-6 h-6" />
        Análisis Profundo con Qwen IA
      </h2>

      {qwenAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Audience */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Audiencia Objetivo
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Demográficos</h4>
                <div className="flex flex-wrap gap-1">
                  {qwenAnalysis.marketAnalysis.targetAudience.demographics.map((demo) => (
                    <span key={demo} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {demo}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Intereses</h4>
                <div className="flex flex-wrap gap-1">
                  {qwenAnalysis.marketAnalysis.targetAudience.interests.map((interest) => (
                    <span key={interest} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Analysis */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Análisis Competitivo
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Top Competidores</h4>
                <div className="space-y-1">
                  {qwenAnalysis.marketAnalysis.competitorLandscape.topCompetitors.map((competitor) => (
                    <div key={competitor} className="text-sm text-gray-300">• {competitor}</div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Oportunidades</h4>
                <div className="space-y-1">
                  {qwenAnalysis.marketAnalysis.competitorLandscape.contentGaps.map((gap) => (
                    <div key={gap} className="text-sm text-gray-300">• {gap}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2 bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Recomendaciones Personalizadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qwenAnalysis.personalizedRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Rocket className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="nova-post-pilot bg-black text-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-green-900/50 border-b border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              📱 Nova Post Pilot
            </h1>
            <div className="text-sm text-gray-300">
              Análisis de Algoritmos + Qwen IA + Marketing Inteligente
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {['profile', 'analysis', 'hooks', 'calendar', 'publish'].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activeStep === step 
                    ? 'bg-purple-500 text-white' 
                    : index < ['profile', 'analysis', 'hooks', 'calendar', 'publish'].indexOf(activeStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {index < ['profile', 'analysis', 'hooks', 'calendar', 'publish'].indexOf(activeStep) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 4 && <div className="w-4 h-0.5 bg-gray-600" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeStep === 'profile' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">Configuración de Perfil</h2>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Contenido</label>
                  <select className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white">
                    <option value="music">Música</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="tech">Tecnología</option>
                    <option value="fitness">Fitness</option>
                    <option value="food">Comida</option>
                    <option value="travel">Viajes</option>
                    <option value="fashion">Moda</option>
                    <option value="education">Educación</option>
                    <option value="entertainment">Entretenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plataformas</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'linkedin'].map((platform) => (
                      <label key={platform} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span className="capitalize">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Voz de Marca</label>
                  <select className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white">
                    <option value="professional">Profesional</option>
                    <option value="casual">Casual</option>
                    <option value="humorous">Humorístico</option>
                    <option value="inspirational">Inspiracional</option>
                    <option value="educational">Educativo</option>
                    <option value="trendy">Trendy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Objetivos</label>
                  <div className="space-y-2">
                    {['growth', 'engagement', 'sales', 'brand_awareness', 'community_building'].map((goal) => (
                      <label key={goal} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span className="capitalize">{goal.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    // Crear perfil de usuario simulado
                    const profile: UserProfile = {
                      userId: userId || 'user_123',
                      username: 'test_user',
                      contentType: 'music',
                      currentPlatforms: ['instagram', 'tiktok', 'youtube'],
                      followerCount: 10000,
                      engagementRate: 5.2,
                      brandVoice: 'professional',
                      goals: ['growth', 'engagement']
                    };
                    setUserProfile(profile);
                    setActiveStep('analysis');
                    executeCompleteAnalysis(profile);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-green-500 text-white rounded-lg hover:from-purple-600 hover:to-green-600 transition-all"
                >
                  Iniciar Análisis con Qwen IA
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStep === 'analysis' && isAnalyzing && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-purple-400 mb-2">Analizando con Qwen IA</h2>
              <p className="text-gray-300">Estudiando algoritmos y tendencias...</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className="text-sm text-gray-400">
                {analysisProgress < 20 && 'Analizando perfil de usuario...'}
                {analysisProgress >= 20 && analysisProgress < 40 && 'Estudiando algoritmos de redes sociales...'}
                {analysisProgress >= 40 && analysisProgress < 60 && 'Identificando tendencias virales...'}
                {analysisProgress >= 60 && analysisProgress < 80 && 'Generando ganchos personalizados...'}
                {analysisProgress >= 80 && analysisProgress < 100 && 'Creando calendario optimizado...'}
                {analysisProgress === 100 && 'Análisis completado!'}
              </div>
            </div>
          </div>
        )}

        {activeStep === 'analysis' && !isAnalyzing && qwenAnalysis && (
          <div>
            {renderQwenAnalysis()}
            {renderAlgorithmAnalysis()}
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setActiveStep('hooks')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-green-500 text-white rounded-lg hover:from-purple-600 hover:to-green-600 transition-all"
              >
                Ver Ganchos Virales
              </button>
            </div>
          </div>
        )}

        {activeStep === 'hooks' && (
          <div>
            {renderViralHooks()}
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setActiveStep('calendar')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-green-500 text-white rounded-lg hover:from-purple-600 hover:to-green-600 transition-all"
              >
                Crear Calendario
              </button>
            </div>
          </div>
        )}

        {activeStep === 'calendar' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Calendario de Contenido Inteligente
            </h2>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Calendario Generado</h3>
                <p className="text-gray-400 mb-6">
                  Se ha creado un calendario optimizado con 15 publicaciones para esta semana
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">15</div>
                    <div className="text-sm text-gray-400">Publicaciones</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">45K</div>
                    <div className="text-sm text-gray-400">Alcance Esperado</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">8.2%</div>
                    <div className="text-sm text-gray-400">Engagement Rate</div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setActiveStep('publish')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-green-500 text-white rounded-lg hover:from-purple-600 hover:to-green-600 transition-all"
                  >
                    Configurar Publicación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 'publish' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              Configuración de Publicación Automática
            </h2>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Permisos de Publicación</h3>
                
                {['instagram', 'tiktok', 'youtube', 'facebook', 'twitter'].map((platform) => (
                  <div key={platform} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{platform[0].toUpperCase()}</span>
                      </div>
                      <span className="text-white capitalize">{platform}</span>
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={userPermissions[platform] || false}
                        onChange={(e) => setUserPermissions(prev => ({
                          ...prev,
                          [platform]: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-400">
                        {userPermissions[platform] ? 'Autorizado' : 'No autorizado'}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-4 justify-end">
                <button
                  onClick={() => setIsPublishing(true)}
                  disabled={Object.values(userPermissions).every(p => !p)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? 'Publicando...' : 'Iniciar Publicación Automática'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
