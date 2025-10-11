/**
 * 🚀 NOVA POST PILOT - COMPONENTE PRINCIPAL
 * 
 * Herramienta completa de marketing digital y gestión de redes sociales
 */

import React, { useState, useEffect } from 'react';
import PixelCharacterized from './PixelCharacterized';

interface NovaPostPilotProps {
  userId?: string;
  sessionId?: string;
  username?: string;
}

interface MarketAnalysis {
  targetAudience: {
    demographics: {
      age: string;
      gender: string;
      location: string;
      interests: string[];
    };
    psychographics: {
      values: string[];
      lifestyle: string[];
      painPoints: string[];
    };
    behavior: {
      activeHours: string[];
      preferredContent: string[];
      engagementPatterns: string[];
    };
  };
  competitorAnalysis: {
    topCompetitors: Array<{
      name: string;
      platform: string;
      followers: number;
      engagementRate: number;
      contentStrategy: string;
    }>;
    marketGaps: string[];
    opportunities: string[];
  };
  marketTrends: {
    trendingTopics: string[];
    emergingPlatforms: string[];
    seasonalTrends: string[];
    viralContent: string[];
  };
}

interface PlatformStrategy {
  platform: string;
  algorithmInsights: {
    rankingFactors: string[];
    optimalPostingTimes: string[];
    contentFormats: string[];
    engagementBoosters: string[];
  };
  contentStrategy: {
    postFrequency: string;
    contentMix: Array<{
      type: string;
      percentage: number;
      description: string;
    }>;
    hashtagStrategy: string[];
    captionTemplates: string[];
  };
  growthPlan: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  automationSettings: {
    autoPosting: boolean;
    autoResponding: boolean;
    schedulingPreferences: any;
  };
}

interface ViralHooks {
  week: string;
  hooks: Array<{
    id: string;
    title: string;
    variants: {
      A: string;
      B: string;
      C: string;
    };
    platforms: string[];
    expectedReach: string;
    trendingScore: number;
  }>;
  trendingTopics: string[];
  seasonalOpportunities: string[];
}

interface SEOAnalysis {
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    relevance: number;
  }>;
  hashtags: Array<{
    hashtag: string;
    posts: number;
    engagement: number;
    trend: 'rising' | 'stable' | 'declining';
  }>;
  contentSuggestions: string[];
  competitorKeywords: string[];
}

export function NovaPostPilot({ userId, sessionId, username = 'Usuario' }: NovaPostPilotProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'strategy' | 'hooks' | 'seo' | 'automation'>('analysis');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 📊 DATOS DEL USUARIO
  const [userProfile, setUserProfile] = useState({
    contentType: '',
    currentPlatforms: [] as string[],
    targetAudience: '',
    goals: [] as string[],
    budget: 0,
    timeCommitment: 'medium' as 'low' | 'medium' | 'high',
    socialProfiles: [] as Array<{
      platform: string;
      username: string;
      url: string;
      isPublic: boolean;
    }>
  });

  // 📈 RESULTADOS DE ANÁLISIS
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<any>(null);
  const [platformStrategies, setPlatformStrategies] = useState<PlatformStrategy[]>([]);
  const [viralHooks, setViralHooks] = useState<ViralHooks | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);

  // 🔧 FUNCIONES PARA MANEJAR PERFILES SOCIALES
  const addSocialProfile = () => {
    setUserProfile(prev => ({
      ...prev,
      socialProfiles: [...prev.socialProfiles, {
        platform: '',
        username: '',
        url: '',
        isPublic: true
      }]
    }));
  };

  const updateSocialProfile = (index: number, field: string, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      socialProfiles: prev.socialProfiles.map((profile, i) => 
        i === index ? { ...profile, [field]: value } : profile
      )
    }));
  };

  const removeSocialProfile = (index: number) => {
    setUserProfile(prev => ({
      ...prev,
      socialProfiles: prev.socialProfiles.filter((_, i) => i !== index)
    }));
  };

  // 🎯 ANÁLISIS DE PERFILES SOCIALES
  const analyzeSocialProfiles = async () => {
    if (userProfile.socialProfiles.length === 0) {
      setError('Por favor, agrega al menos un perfil social para analizar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/nova-post-pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_social_profiles',
          userId,
          username,
          ...userProfile
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setProfileAnalysis(data.data);
        setActiveTab('strategy');
      } else {
        setError(data.message || 'Error al analizar perfiles sociales');
      }
    } catch (error) {
      console.error('Error analyzing social profiles:', error);
      setError('Error al analizar perfiles sociales');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 ANÁLISIS DE MERCADO
  const analyzeMarket = async () => {
    if (!userProfile.contentType) {
      setError('Por favor, completa el tipo de contenido que creas');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/nova-post-pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_market',
          userId,
          username,
          ...userProfile
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMarketAnalysis(data.data);
        setActiveTab('strategy');
      } else {
        setError(data.message || 'Error al analizar el mercado');
      }
    } catch (error) {
      console.error('Error analyzing market:', error);
      setError('Error al analizar el mercado');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 CREAR ESTRATEGIA POR PLATAFORMA
  const createPlatformStrategy = async (platform: string) => {
    if (!marketAnalysis) {
      setError('Primero realiza el análisis de mercado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/nova-post-pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_platform_strategy',
          userId,
          username,
          platform,
          contentType: userProfile.contentType,
          targetAudience: userProfile.targetAudience,
          marketAnalysis
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPlatformStrategies(prev => [...prev, data.data]);
      } else {
        setError(data.message || 'Error al crear estrategia');
      }
    } catch (error) {
      console.error('Error creating platform strategy:', error);
      setError('Error al crear estrategia');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 GENERAR GANCHOS VIRALES
  const generateViralHooks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/nova-post-pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_viral_hooks',
          userId,
          username,
          contentType: userProfile.contentType,
          targetAudience: userProfile.targetAudience,
          platforms: userProfile.currentPlatforms
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setViralHooks(data.data);
        setActiveTab('hooks');
      } else {
        setError(data.message || 'Error al generar ganchos virales');
      }
    } catch (error) {
      console.error('Error generating viral hooks:', error);
      setError('Error al generar ganchos virales');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 ANÁLISIS SEO
  const analyzeSEO = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/nova-post-pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_seo',
          userId,
          username,
          contentType: userProfile.contentType,
          targetAudience: userProfile.targetAudience,
          platforms: userProfile.currentPlatforms
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSeoAnalysis(data.data);
        setActiveTab('seo');
      } else {
        setError(data.message || 'Error al analizar SEO');
      }
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      setError('Error al analizar SEO');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* 🚀 PANEL PRINCIPAL */}
      <div className="lg:col-span-3 space-y-6">
        {/* HEADER DE NOVA POST PILOT */}
        <div className="bg-gradient-to-r from-orange-900 to-yellow-900 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🚀</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Nova Post Pilot</h1>
              <p className="text-orange-200">Estrategia de marketing digital y crecimiento en redes</p>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <p className="text-orange-200 text-sm">
              Herramienta completa para creadores de contenido que buscan hacer crecer sus números en redes sociales. 
              Análisis de mercado, estrategias por plataforma, ganchos virales y automatización inteligente.
            </p>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <div className="flex space-x-4 border-b border-gray-700">
          {[
            { id: 'analysis', label: '📊 Análisis', icon: '📊' },
            { id: 'strategy', label: '🎯 Estrategia', icon: '🎯' },
            { id: 'hooks', label: '🔥 Ganchos', icon: '🔥' },
            { id: 'seo', label: '🔍 SEO', icon: '🔍' },
            { id: 'automation', label: '🤖 Automatización', icon: '🤖' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO SEGÚN TAB */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* FORMULARIO DE PERFIL */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">📊 Perfil de Contenido</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de contenido que creas</label>
                  <select
                    value={userProfile.contentType}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, contentType: e.target.value }))}
                    className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="música">Música</option>
                    <option value="educación">Educación</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="fitness">Fitness</option>
                    <option value="cocina">Cocina</option>
                    <option value="viajes">Viajes</option>
                    <option value="tecnología">Tecnología</option>
                    <option value="entretenimiento">Entretenimiento</option>
                    <option value="negocios">Negocios</option>
                    <option value="arte">Arte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Plataformas actuales</label>
                  <div className="space-y-2">
                    {['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn'].map(platform => (
                      <label key={platform} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={userProfile.currentPlatforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserProfile(prev => ({
                                ...prev,
                                currentPlatforms: [...prev.currentPlatforms, platform]
                              }));
                            } else {
                              setUserProfile(prev => ({
                                ...prev,
                                currentPlatforms: prev.currentPlatforms.filter(p => p !== platform)
                              }));
                            }
                          }}
                          className="rounded border-gray-600"
                        />
                        <span className="text-sm">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Audiencia objetivo</label>
                  <input
                    type="text"
                    value={userProfile.targetAudience}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="ej: Jóvenes de 18-25 años interesados en música"
                    className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Objetivos</label>
                  <div className="space-y-2">
                    {['Aumentar seguidores', 'Mejorar engagement', 'Generar ventas', 'Construir marca personal', 'Monetizar contenido'].map(goal => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={userProfile.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserProfile(prev => ({
                                ...prev,
                                goals: [...prev.goals, goal]
                              }));
                            } else {
                              setUserProfile(prev => ({
                                ...prev,
                                goals: prev.goals.filter(g => g !== goal)
                              }));
                            }
                          }}
                          className="rounded border-gray-600"
                        />
                        <span className="text-sm">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Presupuesto mensual</label>
                  <select
                    value={userProfile.budget}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                    className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  >
                    <option value={0}>$0 - Solo orgánico</option>
                    <option value={100}>$100 - Principiante</option>
                    <option value={500}>$500 - Intermedio</option>
                    <option value={1000}>$1000+ - Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tiempo disponible</label>
                  <select
                    value={userProfile.timeCommitment}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, timeCommitment: e.target.value as any }))}
                    className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                  >
                    <option value="low">Bajo (1-2 horas/semana)</option>
                    <option value="medium">Medio (3-5 horas/semana)</option>
                    <option value="high">Alto (6+ horas/semana)</option>
                  </select>
                </div>
              </div>

              {/* PERFILES SOCIALES */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">📱 Perfiles Sociales (Opcional)</h3>
                  <button
                    type="button"
                    onClick={addSocialProfile}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    + Agregar Perfil
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Comparte tus perfiles para un análisis más preciso de tu contenido existente
                </p>
                
                {userProfile.socialProfiles.map((profile, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Plataforma</label>
                        <select
                          value={profile.platform}
                          onChange={(e) => updateSocialProfile(index, 'platform', e.target.value)}
                          className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Twitter">Twitter</option>
                          <option value="LinkedIn">LinkedIn</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Usuario</label>
                        <input
                          type="text"
                          value={profile.username}
                          onChange={(e) => updateSocialProfile(index, 'username', e.target.value)}
                          placeholder="@usuario"
                          className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input
                          type="url"
                          value={profile.url}
                          onChange={(e) => updateSocialProfile(index, 'url', e.target.value)}
                          placeholder="https://instagram.com/usuario"
                          className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeSocialProfile(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={analyzeMarket}
                  disabled={isLoading || !userProfile.contentType}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analizando mercado...</span>
                    </div>
                  ) : (
                    '🚀 Analizar Mercado'
                  )}
                </button>
                
                {userProfile.socialProfiles.length > 0 && (
                  <button
                    onClick={analyzeSocialProfiles}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analizando perfiles...</span>
                      </div>
                    ) : (
                      '📱 Analizar Perfiles'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* RESULTADOS DEL ANÁLISIS DE PERFILES */}
            {profileAnalysis && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">📱 Análisis de Perfiles Sociales</h3>
                
                {/* ANÁLISIS DE CONTENIDO EXISTENTE */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">📊 Contenido Existente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Tipos de Contenido</h5>
                      <div className="flex flex-wrap gap-2">
                        {profileAnalysis.contentAnalysis?.topContentTypes?.map((type: string, i: number) => (
                          <span key={i} className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Temas Recurrentes</h5>
                      <div className="flex flex-wrap gap-2">
                        {profileAnalysis.contentAnalysis?.recurringThemes?.map((theme: string, i: number) => (
                          <span key={i} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ANÁLISIS DE AUDIENCIA ACTUAL */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">👥 Audiencia Actual</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Demografía</h5>
                      <p className="text-sm"><strong>Edad:</strong> {profileAnalysis.audienceAnalysis?.demographics?.age}</p>
                      <p className="text-sm"><strong>Género:</strong> {profileAnalysis.audienceAnalysis?.demographics?.gender}</p>
                      <p className="text-sm"><strong>Ubicación:</strong> {profileAnalysis.audienceAnalysis?.demographics?.location}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Horarios Activos</h5>
                      <div className="flex flex-wrap gap-2">
                        {profileAnalysis.audienceAnalysis?.activeHours?.map((hour: string, i: number) => (
                          <span key={i} className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                            {hour}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OPORTUNIDADES DE MEJORA */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">🚀 Oportunidades de Mejora</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Brechas en Contenido</h5>
                      <ul className="text-sm space-y-1">
                        {profileAnalysis.improvementOpportunities?.contentGaps?.map((gap: string, i: number) => (
                          <li key={i}>• {gap}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Nuevos Formatos</h5>
                      <div className="flex flex-wrap gap-2">
                        {profileAnalysis.improvementOpportunities?.newFormats?.map((format: string, i: number) => (
                          <span key={i} className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RECOMENDACIONES PERSONALIZADAS */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">💡 Recomendaciones Personalizadas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Estrategia de Contenido</h5>
                      <ul className="text-sm space-y-1">
                        {profileAnalysis.personalizedRecommendations?.contentStrategy?.map((strategy: string, i: number) => (
                          <li key={i}>• {strategy}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Mejoras de Consistencia</h5>
                      <ul className="text-sm space-y-1">
                        {profileAnalysis.personalizedRecommendations?.consistencyImprovements?.map((improvement: string, i: number) => (
                          <li key={i}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('strategy')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🎯 Ver Estrategias
                  </button>
                  <button
                    onClick={generateViralHooks}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔥 Generar Ganchos
                  </button>
                  <button
                    onClick={analyzeSEO}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔍 Analizar SEO
                  </button>
                </div>
              </div>
            )}

            {/* RESULTADOS DEL ANÁLISIS */}
            {marketAnalysis && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">📊 Resultados del Análisis de Mercado</h3>
                
                {/* AUDIENCIA OBJETIVO */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">🎯 Audiencia Objetivo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Demografía</h5>
                      <p className="text-sm"><strong>Edad:</strong> {marketAnalysis.targetAudience.demographics.age}</p>
                      <p className="text-sm"><strong>Género:</strong> {marketAnalysis.targetAudience.demographics.gender}</p>
                      <p className="text-sm"><strong>Ubicación:</strong> {marketAnalysis.targetAudience.demographics.location}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Psicografía</h5>
                      <p className="text-sm"><strong>Valores:</strong> {marketAnalysis.targetAudience.psychographics.values.join(', ')}</p>
                      <p className="text-sm"><strong>Estilo de vida:</strong> {marketAnalysis.targetAudience.psychographics.lifestyle.join(', ')}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Comportamiento</h5>
                      <p className="text-sm"><strong>Horarios activos:</strong> {marketAnalysis.targetAudience.behavior.activeHours.join(', ')}</p>
                      <p className="text-sm"><strong>Contenido preferido:</strong> {marketAnalysis.targetAudience.behavior.preferredContent.join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* TENDENCIAS DE MERCADO */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">📈 Tendencias de Mercado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Temas Trending</h5>
                      <div className="flex flex-wrap gap-2">
                        {marketAnalysis.marketTrends.trendingTopics.map((topic, index) => (
                          <span key={index} className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Contenido Viral</h5>
                      <div className="flex flex-wrap gap-2">
                        {marketAnalysis.marketTrends.viralContent.map((content, index) => (
                          <span key={index} className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                            {content}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('strategy')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🎯 Ver Estrategias
                  </button>
                  <button
                    onClick={generateViralHooks}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔥 Generar Ganchos
                  </button>
                  <button
                    onClick={analyzeSEO}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔍 Analizar SEO
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">🎯 Estrategias por Plataforma</h2>
            
            {/* SELECCIONAR PLATAFORMA */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Seleccionar Plataforma para Estrategia</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn'].map(platform => (
                  <button
                    key={platform}
                    onClick={() => createPlatformStrategy(platform)}
                    disabled={isLoading}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* ESTRATEGIAS GENERADAS */}
            {platformStrategies.map((strategy, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">🎯 Estrategia para {strategy.platform}</h3>
                
                {/* INSIGHTS DEL ALGORITMO */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">⚡ Insights del Algoritmo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Factores de Ranking</h5>
                      <ul className="text-sm space-y-1">
                        {strategy.algorithmInsights.rankingFactors.map((factor, i) => (
                          <li key={i}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Horarios Óptimos</h5>
                      <ul className="text-sm space-y-1">
                        {strategy.algorithmInsights.optimalPostingTimes.map((time, i) => (
                          <li key={i}>• {time}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ESTRATEGIA DE CONTENIDO */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">📝 Estrategia de Contenido</h4>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm mb-2"><strong>Frecuencia:</strong> {strategy.contentStrategy.postFrequency}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {strategy.contentStrategy.contentMix.map((mix, i) => (
                        <div key={i} className="bg-gray-600 rounded-lg p-3">
                          <h5 className="font-bold text-orange-400">{mix.type}</h5>
                          <p className="text-sm">{mix.percentage}% - {mix.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PLAN DE CRECIMIENTO */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">📈 Plan de Crecimiento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Corto Plazo (1-3 meses)</h5>
                      <ul className="text-sm space-y-1">
                        {strategy.growthPlan.shortTerm.map((goal, i) => (
                          <li key={i}>• {goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Mediano Plazo (3-6 meses)</h5>
                      <ul className="text-sm space-y-1">
                        {strategy.growthPlan.mediumTerm.map((goal, i) => (
                          <li key={i}>• {goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="font-bold text-orange-400 mb-2">Largo Plazo (6-12 meses)</h5>
                      <ul className="text-sm space-y-1">
                        {strategy.growthPlan.longTerm.map((goal, i) => (
                          <li key={i}>• {goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hooks' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">🔥 Ganchos Virales Semanales</h2>
            
            {viralHooks && (
              <div className="space-y-6">
                {/* GANCHOS VIRALES */}
                {viralHooks.hooks.map((hook, index) => (
                  <div key={hook.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">{hook.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                          Score: {hook.trendingScore}/100
                        </span>
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                          {hook.expectedReach}
                        </span>
                      </div>
                    </div>

                    {/* VARIANTES */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-orange-400 mb-2">Variante A</h4>
                        <p className="text-sm">{hook.variants.A}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-orange-400 mb-2">Variante B</h4>
                        <p className="text-sm">{hook.variants.B}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-orange-400 mb-2">Variante C</h4>
                        <p className="text-sm">{hook.variants.C}</p>
                      </div>
                    </div>

                    {/* PLATAFORMAS */}
                    <div className="mb-4">
                      <h4 className="font-bold text-orange-400 mb-2">Plataformas Recomendadas</h4>
                      <div className="flex space-x-2">
                        {hook.platforms.map((platform, i) => (
                          <span key={i} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                      📋 Copiar Variante A
                    </button>
                  </div>
                ))}

                {/* TENDENCIAS ACTUALES */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">📈 Tendencias Actuales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-bold text-orange-400 mb-2">Temas Trending</h4>
                      <div className="flex flex-wrap gap-2">
                        {viralHooks.trendingTopics.map((topic, i) => (
                          <span key={i} className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-bold text-orange-400 mb-2">Oportunidades Estacionales</h4>
                      <div className="flex flex-wrap gap-2">
                        {viralHooks.seasonalOpportunities.map((opportunity, i) => (
                          <span key={i} className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                            {opportunity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">🔍 Análisis SEO y Hashtags</h2>
            
            {seoAnalysis && (
              <div className="space-y-6">
                {/* KEYWORDS */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">🔑 Keywords</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seoAnalysis.keywords.map((keyword, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-orange-400">{keyword.keyword}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            keyword.competition === 'low' ? 'bg-green-600' :
                            keyword.competition === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                          } text-white`}>
                            {keyword.competition}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Volumen: {keyword.searchVolume.toLocaleString()} | Relevancia: {keyword.relevance}/100
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HASHTAGS */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4"># Hashtags</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seoAnalysis.hashtags.map((hashtag, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-orange-400">{hashtag.hashtag}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            hashtag.trend === 'rising' ? 'bg-green-600' :
                            hashtag.trend === 'stable' ? 'bg-blue-600' : 'bg-red-600'
                          } text-white`}>
                            {hashtag.trend}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Posts: {hashtag.posts.toLocaleString()} | Engagement: {hashtag.engagement}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SUGERENCIAS DE CONTENIDO */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">💡 Sugerencias de Contenido</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-bold text-orange-400 mb-2">Ideas de Contenido</h4>
                      <ul className="text-sm space-y-1">
                        {seoAnalysis.contentSuggestions.map((suggestion, i) => (
                          <li key={i}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-bold text-orange-400 mb-2">Keywords de Competidores</h4>
                      <div className="flex flex-wrap gap-2">
                        {seoAnalysis.competitorKeywords.map((keyword, i) => (
                          <span key={i} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">🤖 Automatización</h2>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">🚀 Funciones de Automatización</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">📅 Programación de Contenido</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Programa publicaciones automáticas basadas en el análisis de horarios óptimos.
                  </p>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Configurar Auto-Posting
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">💬 Auto-Responder</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Responde automáticamente a comentarios y mensajes con IA personalizada.
                  </p>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Configurar Auto-Responder
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">📊 Dashboard de Rendimiento</h3>
              <p className="text-gray-300 mb-4">
                Monitorea el rendimiento de tus estrategias y automatizaciones en tiempo real.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <h4 className="font-bold text-orange-400 mb-2">Crecimiento</h4>
                  <p className="text-2xl font-bold text-green-400">+25%</p>
                  <p className="text-sm text-gray-300">vs mes anterior</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <h4 className="font-bold text-orange-400 mb-2">Engagement</h4>
                  <p className="text-2xl font-bold text-blue-400">8.5%</p>
                  <p className="text-sm text-gray-300">promedio</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <h4 className="font-bold text-orange-400 mb-2">Alcance</h4>
                  <p className="text-2xl font-bold text-purple-400">45K</p>
                  <p className="text-sm text-gray-300">esta semana</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* 🤖 PIXEL PILOT */}
      <div className="lg:col-span-1">
        <PixelCharacterized
          userId={userId}
          sessionId={sessionId}
          tool="nova-post"
          position="embedded"
          onSuggestionClick={(suggestion) => {
            if (suggestion.includes('análisis') || suggestion.includes('mercado')) {
              analyzeMarket();
            } else if (suggestion.includes('estrategia') || suggestion.includes('plataforma')) {
              setActiveTab('strategy');
            } else if (suggestion.includes('ganchos') || suggestion.includes('viral')) {
              generateViralHooks();
            } else if (suggestion.includes('SEO') || suggestion.includes('hashtags')) {
              analyzeSEO();
            }
          }}
        />
      </div>
    </div>
  );
}

export default NovaPostPilot;
