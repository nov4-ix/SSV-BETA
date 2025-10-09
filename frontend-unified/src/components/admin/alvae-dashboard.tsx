import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Shield, 
  Star, 
  Zap, 
  Users, 
  Settings,
  CreditCard,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

// 🏆 SÍMBOLO ALVAE - SISTEMA DE CUENTAS ÉPICO 🏆

export interface AlvaeAccount {
  id: string;
  email: string;
  name: string;
  role: 'ALVAE_FOUNDER' | 'ALVAE_PARTNER' | 'ALVAE_TESTER' | 'ALVAE_ADMIN';
  tier: 'ALVAE_FOUNDER' | 'ALVAE_PARTNER' | 'ALVAE_TESTER' | 'ALVAE_ADMIN';
  alvaeSymbol: string;
  alvaeColor: string;
  permissions: string[];
  stripeCustomerId?: string;
  subscriptionStatus: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastActive: string;
  isBlindado: boolean; // Dashboard administrativo blindado
}

// 🏆 CONFIGURACIÓN DE CUENTAS ALVAE 🏆
export const ALVAE_ACCOUNTS: AlvaeAccount[] = [
  // FOUNDER (Tu cuenta)
  {
    id: 'alvae_founder_001',
    email: 'founder@son1kverse.com',
    name: 'Son1kVerse Founder',
    role: 'ALVAE_FOUNDER',
    tier: 'ALVAE_FOUNDER',
    alvaeSymbol: '👑',
    alvaeColor: '#FFD700',
    permissions: ['all', 'admin', 'billing', 'users', 'analytics', 'system'],
    subscriptionStatus: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: new Date().toISOString(),
    isBlindado: true,
  },
  
  // PARTNER (Tu socio)
  {
    id: 'alvae_partner_001',
    email: 'partner@son1kverse.com',
    name: 'Son1kVerse Partner',
    role: 'ALVAE_PARTNER',
    tier: 'ALVAE_PARTNER',
    alvaeSymbol: '🤝',
    alvaeColor: '#00FFE7',
    permissions: ['admin', 'billing', 'users', 'analytics'],
    subscriptionStatus: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: new Date().toISOString(),
    isBlindado: true,
  },
  
  // 10 TESTERS ALVAE
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `alvae_tester_${String(i + 1).padStart(3, '0')}`,
    email: `tester${i + 1}@son1kverse.com`,
    name: `ALVAE Tester ${i + 1}`,
    role: 'ALVAE_TESTER' as const,
    tier: 'ALVAE_TESTER' as const,
    alvaeSymbol: '🧪',
    alvaeColor: '#B84DFF',
    permissions: ['test', 'feedback', 'report'],
    subscriptionStatus: 'active' as const,
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: new Date().toISOString(),
    isBlindado: false,
  })),
];

interface AlvaeDashboardProps {
  currentUser?: AlvaeAccount;
  onAccountSelect?: (account: AlvaeAccount) => void;
}

export function AlvaeDashboard({ currentUser, onAccountSelect }: AlvaeDashboardProps) {
  const [selectedAccount, setSelectedAccount] = useState<AlvaeAccount | null>(currentUser || null);
  const [showBlindado, setShowBlindado] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'billing' | 'analytics' | 'system'>('accounts');

  const getAccountStats = () => {
    const founders = ALVAE_ACCOUNTS.filter(a => a.role === 'ALVAE_FOUNDER').length;
    const partners = ALVAE_ACCOUNTS.filter(a => a.role === 'ALVAE_PARTNER').length;
    const testers = ALVAE_ACCOUNTS.filter(a => a.role === 'ALVAE_TESTER').length;
    const active = ALVAE_ACCOUNTS.filter(a => a.subscriptionStatus === 'active').length;
    
    return { founders, partners, testers, active, total: ALVAE_ACCOUNTS.length };
  };

  const stats = getAccountStats();

  const handleAccountSelect = (account: AlvaeAccount) => {
    setSelectedAccount(account);
    onAccountSelect?.(account);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ALVAE_FOUNDER': return <Crown className="w-5 h-5" />;
      case 'ALVAE_PARTNER': return <Shield className="w-5 h-5" />;
      case 'ALVAE_TESTER': return <Star className="w-5 h-5" />;
      case 'ALVAE_ADMIN': return <Settings className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'suspended': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="alvae-dashboard min-h-screen bg-black text-white">
      {/* Header con símbolo ALVAE */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-b border-purple-500/30 p-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
              🏆 ALVAE
            </div>
            <div className="text-sm text-gray-300">
              Sistema Administrativo Blindado
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Sistema Activo</span>
            </div>
            
            <button
              onClick={() => setShowBlindado(!showBlindado)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              {showBlindado ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showBlindado ? 'Ocultar' : 'Mostrar'} Blindado
            </button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h3 className="font-semibold text-yellow-400">Founders</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.founders}</p>
            <p className="text-sm text-gray-400">Cuentas Fundadoras</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h3 className="font-semibold text-cyan-400">Partners</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.partners}</p>
            <p className="text-sm text-gray-400">Cuentas Socio</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-purple-400" />
              <h3 className="font-semibold text-purple-400">Testers</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.testers}</p>
            <p className="text-sm text-gray-400">Cuentas Tester</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold text-green-400">Activos</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.active}</p>
            <p className="text-sm text-gray-400">de {stats.total} total</p>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { id: 'accounts', label: 'Cuentas ALVAE', icon: Users },
            { id: 'billing', label: 'Stripe Billing', icon: CreditCard },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'system', label: 'Sistema', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Accounts List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Cuentas ALVAE ({ALVAE_ACCOUNTS.length})
            </h2>
            
            <div className="space-y-3">
              {ALVAE_ACCOUNTS.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAccountSelect(account)}
                  className={`bg-gray-900/50 border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAccount?.id === account.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="text-2xl p-2 rounded-lg"
                        style={{ backgroundColor: `${account.alvaeColor}20` }}
                      >
                        {account.alvaeSymbol}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-white">{account.name}</h3>
                        <p className="text-sm text-gray-400">{account.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleIcon(account.role)}
                          <span className="text-xs text-gray-500">{account.role}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(account.subscriptionStatus)}
                        <span className={`text-sm ${getStatusColor(account.subscriptionStatus)}`}>
                          {account.subscriptionStatus}
                        </span>
                      </div>
                      
                      {account.isBlindado && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                          <Shield className="w-3 h-3" />
                          Blindado
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Account Details */}
          <div>
            {selectedAccount ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Detalles de Cuenta</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                    <p className="text-white">{selectedAccount.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-white">{selectedAccount.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Rol</label>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-lg"
                        style={{ color: selectedAccount.alvaeColor }}
                      >
                        {selectedAccount.alvaeSymbol}
                      </span>
                      <span className="text-white">{selectedAccount.role}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedAccount.subscriptionStatus)}
                      <span className={getStatusColor(selectedAccount.subscriptionStatus)}>
                        {selectedAccount.subscriptionStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Permisos</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedAccount.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedAccount.stripeCustomerId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Stripe Customer ID</label>
                      <p className="text-white font-mono text-sm">{selectedAccount.stripeCustomerId}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Última Actividad</label>
                    <p className="text-white text-sm">
                      {new Date(selectedAccount.lastActive).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Selecciona una cuenta para ver detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
