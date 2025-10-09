import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Zap, Crown, AlertTriangle } from 'lucide-react';

export const UsageLimit: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const { subscriptionTier } = user;

  // Límites por tier
  const getTierLimits = () => {
    switch (subscriptionTier) {
      case 'FREE':
        return {
          model35: 3,
          model5: 2,
          total: 5,
        };
      case 'PRO':
        return {
          model35: 100,
          model5: 100,
          total: 200,
        };
      case 'ENTERPRISE':
        return {
          model35: -1, // Ilimitado
          model5: 300,  // 300 generaciones
          total: -1,   // Ilimitado (porque 3.5 es ilimitado)
        };
      default:
        return {
          model35: 3,
          model5: 2,
          total: 5,
        };
    }
  };

  const limits = getTierLimits();
  const isUnlimited = limits.total === -1;

  const getTierInfo = () => {
    switch (subscriptionTier) {
      case 'FREE':
        return {
          name: 'Free',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500',
          icon: <Zap className="w-4 h-4" />,
        };
      case 'PRO':
        return {
          name: 'Pro',
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500',
          icon: <Crown className="w-4 h-4" />,
        };
      case 'ENTERPRISE':
        return {
          name: 'Enterprise',
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/20',
          borderColor: 'border-cyan-500',
          icon: <Crown className="w-4 h-4" />,
        };
      default:
        return {
          name: 'Free',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500',
          icon: <Zap className="w-4 h-4" />,
        };
    }
  };

  const tierInfo = getTierInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`usage-limit-card ${tierInfo.bgColor} ${tierInfo.borderColor} border rounded-lg p-4 mb-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {tierInfo.icon}
          <span className={`font-medium ${tierInfo.color}`}>
            Plan {tierInfo.name}
          </span>
        </div>
        
        {isAtLimit && (
          <div className="flex items-center gap-1 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Límite alcanzado</span>
          </div>
        )}
        
        {isNearLimit && !isAtLimit && (
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Límite cercano</span>
          </div>
        )}
      </div>

      {/* Usage by Model */}
      <div className="mb-3 space-y-3">
            {/* Son1kVerse Pro */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Son1kVerse Pro</span>
                <span className="text-cyan-400 font-medium">
                  {limits.model35 === -1 ? 'Ilimitado' : `${limits.model35} disponibles`}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
              </div>
            </div>

            {/* Son1kVerse Ultra */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Son1kVerse Ultra</span>
                <span className="text-purple-400 font-medium">
                  {limits.model5 === -1 ? 'Ilimitado' : `${limits.model5} disponibles`}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
            </div>

        {/* Total */}
        <div className="pt-2 border-t border-gray-600">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Total mensual</span>
            <span className="text-green-400 font-medium">
              {limits.total === -1 ? 'Ilimitado' : `${limits.total} generaciones`}
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt for FREE users */}
      {subscriptionTier === 'FREE' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 pt-3 border-t border-gray-600"
        >
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-2">
              ¿Necesitas más generaciones?
            </p>
            <div className="text-xs text-gray-500 mb-3">
              <div>Pro: 100 Son1kVerse Pro + 100 Son1kVerse Ultra</div>
              <div>Enterprise: Ilimitado</div>
            </div>
            <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-300">
              Actualizar a Pro
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
