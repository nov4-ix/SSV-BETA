import React, { useState } from 'react';
import { useTieredTokenService } from '../hooks/useTieredTokenService';

interface TierStatusProps {
  className?: string;
}

export default function TierStatus({ className = '' }: TierStatusProps) {
  const {
    tier,
    hourlyUsage,
    hourlyLimit,
    canGenerate,
    upgradeMessage,
    statusColor,
    upgradeToPremium,
    isUpgrading
  } = useTieredTokenService();

  const [email, setEmail] = useState('');
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);

  const handleUpgrade = async () => {
    if (!email.trim()) {
      alert('Por favor ingresa tu email');
      return;
    }

    const success = await upgradeToPremium(email);
    if (success) {
      setShowUpgradeForm(false);
      setEmail('');
      alert('¡Upgrade a premium exitoso!');
    }
  };

  const getTierIcon = () => {
    switch (tier) {
      case 'premium':
        return '👑';
      case 'free':
        return '🆓';
      default:
        return '❓';
    }
  };

  const getTierColor = () => {
    switch (statusColor) {
      case 'green':
        return 'text-green-400';
      case 'blue':
        return 'text-blue-400';
      case 'red':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getProgressColor = () => {
    const percentage = (hourlyUsage / hourlyLimit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`tier-status ${className}`}>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getTierIcon()}</span>
            <span className={`font-semibold ${getTierColor()}`}>
              {tier === 'premium' ? 'Premium' : 'Free'}
            </span>
          </div>
          
          {tier === 'free' && (
            <button
              onClick={() => setShowUpgradeForm(!showUpgradeForm)}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Upgrade
            </button>
          )}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Generaciones esta hora</span>
            <span>{hourlyUsage}/{hourlyLimit}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min((hourlyUsage / hourlyLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-3">
          {upgradeMessage}
        </div>

        {!canGenerate && (
          <div className="bg-red-900/20 border border-red-500/30 rounded p-2 mb-3">
            <p className="text-red-400 text-sm">
              Límite horario alcanzado. Upgrade a premium para más generaciones.
            </p>
          </div>
        )}

        {showUpgradeForm && (
          <div className="bg-gray-700 rounded p-3 mb-3">
            <h4 className="text-white font-semibold mb-2">Upgrade a Premium</h4>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                >
                  {isUpgrading ? 'Upgrading...' : 'Upgrade Now'}
                </button>
                <button
                  onClick={() => setShowUpgradeForm(false)}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          {tier === 'premium' ? (
            <span>✅ Acceso prioritario a tokens premium</span>
          ) : (
            <span>🆓 Acceso limitado a tokens compartidos</span>
          )}
        </div>
      </div>
    </div>
  );
}


