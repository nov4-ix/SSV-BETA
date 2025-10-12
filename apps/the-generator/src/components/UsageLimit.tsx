/**
 * 🎵 USAGE LIMIT COMPONENT - COMPONENTE DE LÍMITES DE USO
 * 
 * Muestra los límites de uso del usuario
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Calendar } from 'lucide-react';

interface UsageLimitProps {
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    usedToday: number;
    usedThisMonth: number;
    canGenerate: boolean;
  } | null;
  clientLimits: {
    used: number;
    limit: number;
  };
}

export const UsageLimit: React.FC<UsageLimitProps> = ({ limits, clientLimits }) => {
  if (!limits) return null;

  const dailyPercentage = (limits.usedToday / limits.dailyLimit) * 100;
  const monthlyPercentage = (limits.usedThisMonth / limits.monthlyLimit) * 100;
  const clientPercentage = (clientLimits.used / clientLimits.limit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 mb-6"
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-yellow-400" />
        Límites de Uso
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Límite Diario */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Diario
            </span>
            <span className="text-sm text-white font-medium">
              {limits.usedToday}/{limits.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                dailyPercentage >= 90 ? 'bg-red-500' : 
                dailyPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {limits.dailyLimit - limits.usedToday} generaciones restantes
          </p>
        </div>

        {/* Límite Mensual */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Mensual
            </span>
            <span className="text-sm text-white font-medium">
              {limits.usedThisMonth}/{limits.monthlyLimit}
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                monthlyPercentage >= 90 ? 'bg-red-500' : 
                monthlyPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {limits.monthlyLimit - limits.usedThisMonth} generaciones restantes
          </p>
        </div>

        {/* Límite del Cliente */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 flex items-center">
              <Zap className="w-4 h-4 mr-1" />
              Cliente
            </span>
            <span className="text-sm text-white font-medium">
              {clientLimits.used}/{clientLimits.limit}
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                clientPercentage >= 90 ? 'bg-red-500' : 
                clientPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(clientPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {clientLimits.limit - clientLimits.used} generaciones restantes
          </p>
        </div>
      </div>

      {/* Estado de Generación */}
      <div className="mt-4 p-3 rounded-lg bg-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Estado:</span>
          <span className={`text-sm font-medium ${
            limits.canGenerate ? 'text-green-400' : 'text-red-400'
          }`}>
            {limits.canGenerate ? '✅ Puede generar' : '❌ Límite alcanzado'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

