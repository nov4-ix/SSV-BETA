import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🎵 COMPONENTE DE LÍMITES SON1KVERSE
 * 
 * Componente para mostrar límites y permisos del usuario
 * según su tier de suscripción
 */

interface UserLimits {
  tier: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  permissions: {
    canDownload: boolean;
    requiresWatermark: boolean;
    hasQwen2Access: boolean;
    hasPixelAssistant: boolean;
  };
  limits: {
    general: {
      generations: {
        model35: number;
        model5: number;
        total: number;
      };
      storageGB: number;
    };
    theGenerator: {
      musicGenerations: number;
      sunoTokens: number;
      pixelAssistance: boolean;
      downloads: boolean;
      watermarkRequired: boolean;
    };
    features: string[];
  };
  upgradePrompt?: {
    message: string;
    benefits: string[];
  };
}

interface UsageStats {
  tier: string;
  currentMonth: string;
  usage: {
    generations: {
      model35: { used: number; remaining: number; limit: number };
      model5: { used: number; remaining: number; limit: number };
    };
    musicGenerations: { used: number; remaining: number; limit: number };
    storage: { used: number; limit: number };
  };
  permissions: {
    canDownload: boolean;
    requiresWatermark: boolean;
    hasQwen2Access: boolean;
    hasPixelAssistant: boolean;
  };
}

export const Son1kverseLimits: React.FC = () => {
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'limits' | 'usage' | 'permissions'>('limits');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [limitsResponse, usageResponse] = await Promise.all([
        fetch('/api/tracks/user/limits', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/tracks/user/usage', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const limitsData = await limitsResponse.json();
      const usageData = await usageResponse.json();

      if (limitsData.success) setUserLimits(limitsData.data);
      if (usageData.success) setUsageStats(usageData.data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'from-gray-500 to-gray-600';
      case 'STARTER': return 'from-blue-500 to-blue-600';
      case 'PRO': return 'from-purple-500 to-purple-600';
      case 'ENTERPRISE': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'FREE': return '🆓';
      case 'STARTER': return '🚀';
      case 'PRO': return '⭐';
      case 'ENTERPRISE': return '🏢';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!userLimits || !usageStats) {
    return (
      <div className="text-center p-8 text-gray-400">
        Error al cargar los límites del usuario
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTierIcon(userLimits.tier)}</span>
          <div>
            <h2 className="text-xl font-bold text-white">
              Plan {userLimits.tier}
            </h2>
            <p className="text-sm text-gray-400">
              Límites y permisos de Son1kverse
            </p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getTierColor(userLimits.tier)} text-white font-semibold`}>
          {userLimits.tier}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'limits', label: 'Límites', icon: '📊' },
          { id: 'usage', label: 'Uso Actual', icon: '📈' },
          { id: 'permissions', label: 'Permisos', icon: '🔐' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'limits' && (
          <motion.div
            key="limits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Generaciones */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">🎵</span>
                Generaciones de Música
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {userLimits.limits.theGenerator.musicGenerations === -1 
                      ? '∞' 
                      : userLimits.limits.theGenerator.musicGenerations
                    }
                  </div>
                  <div className="text-sm text-gray-400">Por mes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {userLimits.limits.theGenerator.sunoTokens}
                  </div>
                  <div className="text-sm text-gray-400">Tokens Suno</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {userLimits.limits.general.storageGB === -1 
                      ? '∞' 
                      : userLimits.limits.general.storageGB
                    }GB
                  </div>
                  <div className="text-sm text-gray-400">Almacenamiento</div>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">✨</span>
                Características Incluidas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {userLimits.limits.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-300">
                    <span className="text-green-400">✓</span>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade Prompt */}
            {userLimits.upgradePrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  🚀 {userLimits.upgradePrompt.message}
                </h3>
                <div className="space-y-2 mb-4">
                  {userLimits.upgradePrompt.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-300">
                      <span className="text-purple-400">→</span>
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
                  Actualizar a PRO
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'usage' && (
          <motion.div
            key="usage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Uso de Generaciones */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Uso del Mes Actual
              </h3>
              
              <div className="space-y-4">
                {/* Generaciones de Música */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Generaciones de Música</span>
                    <span className="text-sm text-gray-400">
                      {usageStats.usage.musicGenerations.used} / {
                        usageStats.usage.musicGenerations.limit === -1 
                          ? '∞' 
                          : usageStats.usage.musicGenerations.limit
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${usageStats.usage.musicGenerations.limit === -1 
                          ? 0 
                          : (usageStats.usage.musicGenerations.used / usageStats.usage.musicGenerations.limit) * 100
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Almacenamiento */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Almacenamiento</span>
                    <span className="text-sm text-gray-400">
                      {usageStats.usage.storage.used}GB / {
                        usageStats.usage.storage.limit === -1 
                          ? '∞' 
                          : usageStats.usage.storage.limit
                      }GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${usageStats.usage.storage.limit === -1 
                          ? 0 
                          : (usageStats.usage.storage.used / usageStats.usage.storage.limit) * 100
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Resumen del Mes
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {usageStats.usage.musicGenerations.remaining === -1 
                      ? '∞' 
                      : usageStats.usage.musicGenerations.remaining
                    }
                  </div>
                  <div className="text-sm text-gray-400">Generaciones restantes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {usageStats.usage.storage.limit === -1 
                      ? '∞' 
                      : (usageStats.usage.storage.limit - usageStats.usage.storage.used).toFixed(1)
                    }GB
                  </div>
                  <div className="text-sm text-gray-400">Almacenamiento libre</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'permissions' && (
          <motion.div
            key="permissions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Permisos Principales */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">🔐</span>
                Permisos de Cuenta
              </h3>
              
              <div className="space-y-3">
                {[
                  {
                    key: 'canDownload',
                    label: 'Descargar Pistas',
                    description: 'Descargar pistas sin marca de agua',
                    icon: '⬇️'
                  },
                  {
                    key: 'requiresWatermark',
                    label: 'Marca de Agua',
                    description: 'Marca de agua obligatoria en pistas',
                    icon: '🏷️',
                    inverse: true
                  },
                  {
                    key: 'hasQwen2Access',
                    label: 'Qwen 2',
                    description: 'Acceso a análisis avanzados con IA',
                    icon: '🤖'
                  },
                  {
                    key: 'hasPixelAssistant',
                    label: 'Pixel Assistant',
                    description: 'Asistencia inteligente completa',
                    icon: '🎭'
                  }
                ].map((permission) => {
                  const hasPermission = userLimits.permissions[permission.key as keyof typeof userLimits.permissions];
                  const showPermission = permission.inverse ? !hasPermission : hasPermission;
                  
                  return (
                    <div key={permission.key} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{permission.icon}</span>
                        <div>
                          <div className="text-white font-medium">{permission.label}</div>
                          <div className="text-sm text-gray-400">{permission.description}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        showPermission 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {showPermission ? 'Incluido' : 'No incluido'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Información de Tier */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">ℹ️</span>
                Información del Plan
              </h3>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Tier actual:</span>
                  <span className="text-white font-semibold">{userLimits.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descargas:</span>
                  <span className={userLimits.permissions.canDownload ? 'text-green-400' : 'text-red-400'}>
                    {userLimits.permissions.canDownload ? 'Permitidas' : 'No permitidas'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Marca de agua:</span>
                  <span className={userLimits.permissions.requiresWatermark ? 'text-yellow-400' : 'text-green-400'}>
                    {userLimits.permissions.requiresWatermark ? 'Obligatoria' : 'No requerida'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pixel Assistant:</span>
                  <span className={userLimits.permissions.hasPixelAssistant ? 'text-purple-400' : 'text-gray-400'}>
                    {userLimits.permissions.hasPixelAssistant ? 'Activo' : 'No disponible'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Son1kverseLimits;
