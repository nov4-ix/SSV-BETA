/**
 * 📊 DASHBOARD DE APRENDIZAJE DE PIXEL
 * 
 * Muestra estadísticas y progreso del sistema de aprendizaje
 */

import React, { useState, useEffect } from 'react';
import { pixelHelpers } from '../services/pixelLearningSystem';

interface PixelDashboardProps {
  userId: string;
  onClose?: () => void;
}

interface LearningStats {
  adaptationScore: number;
  confidenceLevel: number;
  totalInteractions: number;
  averageSatisfaction: number;
  favoriteTopics: string[];
  personality: string;
}

interface UserProfile {
  preferences: {
    musicStyle: string[];
    experience: 'beginner' | 'intermediate' | 'expert';
    language: 'es' | 'en';
    personality: 'creative' | 'technical' | 'social' | 'analytical';
    interactionStyle: 'direct' | 'conversational' | 'detailed' | 'concise';
  };
  behavior: {
    frequentApps: string[];
    usagePatterns: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
    interactionTypes: {
      questions: number;
      requests: number;
      casual: number;
      technical: number;
    };
    responsePreferences: {
      length: 'short' | 'medium' | 'long';
      tone: 'formal' | 'casual' | 'friendly' | 'professional';
      detail: 'basic' | 'moderate' | 'comprehensive';
    };
  };
  emotional: {
    mood: 'positive' | 'neutral' | 'frustrated' | 'excited' | 'curious';
    stressLevel: number;
    engagementLevel: number;
    satisfactionScore: number;
  };
  memory: {
    favoriteTopics: string[];
    successfulInteractions: string[];
    userGoals: string[];
    painPoints: string[];
  };
  adaptation: {
    learningRate: number;
    confidenceLevel: number;
    adaptationScore: number;
    lastUpdated: Date;
  };
}

export function PixelDashboard({ userId, onClose }: PixelDashboardProps) {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'behavior' | 'preferences' | 'memory'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const learningStats = pixelHelpers.getStats(userId);
      const userProfile = pixelHelpers.getUserProfile(userId);
      
      setStats(learningStats);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 OBTENER COLOR SEGÚN VALOR
  const getValueColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // 🎯 OBTENER COLOR DE BARRA
  const getBarColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // 🎯 FORMATEAR FECHA
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Cargando dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard de Pixel</h2>
              <p className="text-gray-400">Sistema de aprendizaje personalizado</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: '📊 Resumen', icon: '📊' },
            { id: 'behavior', label: '🎯 Comportamiento', icon: '🎯' },
            { id: 'preferences', label: '⚙️ Preferencias', icon: '⚙️' },
            { id: 'memory', label: '🧠 Memoria', icon: '🧠' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* MÉTRICAS PRINCIPALES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Adaptación</h3>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className={`text-3xl font-bold ${getValueColor(stats.adaptationScore)}`}>
                    {stats.adaptationScore}%
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getBarColor(stats.adaptationScore)}`}
                      style={{ width: `${stats.adaptationScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Confianza</h3>
                    <span className="text-2xl">💪</span>
                  </div>
                  <div className={`text-3xl font-bold ${getValueColor(stats.confidenceLevel * 100)}`}>
                    {Math.round(stats.confidenceLevel * 100)}%
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getBarColor(stats.confidenceLevel * 100)}`}
                      style={{ width: `${stats.confidenceLevel * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Interacciones</h3>
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">
                    {stats.totalInteractions}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Total de conversaciones
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Satisfacción</h3>
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className={`text-3xl font-bold ${getValueColor(stats.averageSatisfaction, 10)}`}>
                    {stats.averageSatisfaction.toFixed(1)}/10
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getBarColor(stats.averageSatisfaction * 10, 10)}`}
                      style={{ width: `${stats.averageSatisfaction * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* TEMAS FAVORITOS */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Temas Favoritos</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.favoriteTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* PERSONALIDAD */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎭 Personalidad Detectada</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">
                    {stats.personality === 'creative' ? '🎨' :
                     stats.personality === 'technical' ? '🔧' :
                     stats.personality === 'social' ? '👥' : '📊'}
                  </span>
                  <div>
                    <div className="text-lg font-bold text-white capitalize">
                      {stats.personality}
                    </div>
                    <div className="text-gray-400">
                      {stats.personality === 'creative' ? 'Creativo e innovador' :
                       stats.personality === 'technical' ? 'Analítico y detallista' :
                       stats.personality === 'social' ? 'Colaborativo y comunicativo' : 'Metódico y organizado'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'behavior' && profile && (
            <div className="space-y-6">
              {/* PATRONES DE USO */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">⏰ Patrones de Uso</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(profile.behavior.usagePatterns).map(([time, count]) => (
                    <div key={time} className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{count}</div>
                      <div className="text-sm text-gray-400 capitalize">{time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIPOS DE INTERACCIÓN */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">💬 Tipos de Interacción</h3>
                <div className="space-y-3">
                  {Object.entries(profile.behavior.interactionTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / Math.max(...Object.values(profile.behavior.interactionTypes))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* APLICACIONES FRECUENTES */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">📱 Aplicaciones Frecuentes</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.behavior.frequentApps.map((app, index) => (
                    <span
                      key={index}
                      className="bg-green-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && profile && (
            <div className="space-y-6">
              {/* PREFERENCIAS GENERALES */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">⚙️ Preferencias Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Experiencia</div>
                    <div className="text-lg font-bold text-white capitalize">
                      {profile.preferences.experience}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Idioma</div>
                    <div className="text-lg font-bold text-white">
                      {profile.preferences.language === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Estilo de Interacción</div>
                    <div className="text-lg font-bold text-white capitalize">
                      {profile.preferences.interactionStyle}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Personalidad</div>
                    <div className="text-lg font-bold text-white capitalize">
                      {profile.preferences.personality}
                    </div>
                  </div>
                </div>
              </div>

              {/* PREFERENCIAS DE RESPUESTA */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">💬 Preferencias de Respuesta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Longitud</div>
                    <div className="text-lg font-bold text-white capitalize">
                      {profile.behavior.responsePreferences.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Tono</div>
                    <div className="text-lg font-bold text-white capitalize">
                      {profile.behavior.responsePreferences.tone}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Detalle</div>
                    <div className="text-lg font-bold text-white capitalize">
                      {profile.behavior.responsePreferences.detail}
                    </div>
                  </div>
                </div>
              </div>

              {/* ESTILOS MUSICALES */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎵 Estilos Musicales</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.musicStyle.map((style, index) => (
                    <span
                      key={index}
                      className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'memory' && profile && (
            <div className="space-y-6">
              {/* OBJETIVOS DEL USUARIO */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Objetivos del Usuario</h3>
                <div className="space-y-2">
                  {profile.memory.userGoals.map((goal, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* INTERACCIONES EXITOSAS */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">✨ Interacciones Exitosas</h3>
                <div className="space-y-2">
                  {profile.memory.successfulInteractions.map((interaction, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-gray-300">{interaction}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PUNTOS DE DOLOR */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">⚠️ Puntos de Dolor</h3>
                <div className="space-y-2">
                  {profile.memory.painPoints.map((painPoint, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-red-400">⚠️</span>
                      <span className="text-gray-300">{painPoint}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESTADO EMOCIONAL */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">😊 Estado Emocional</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Estado de Ánimo</div>
                    <div className="text-lg font-bold text-white capitalize">
                      {profile.emotional.mood}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Nivel de Estrés</div>
                    <div className={`text-lg font-bold ${getValueColor(profile.emotional.stressLevel, 10)}`}>
                      {profile.emotional.stressLevel}/10
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Nivel de Engagement</div>
                    <div className={`text-lg font-bold ${getValueColor(profile.emotional.engagementLevel, 10)}`}>
                      {profile.emotional.engagementLevel}/10
                    </div>
                  </div>
                </div>
              </div>

              {/* ÚLTIMA ACTUALIZACIÓN */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🕒 Última Actualización</h3>
                <div className="text-gray-300">
                  {formatDate(profile.adaptation.lastUpdated)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PixelDashboard;
