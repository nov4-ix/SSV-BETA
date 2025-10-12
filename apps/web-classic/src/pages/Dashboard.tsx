import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';

// ────────────────────────────────────────────────────────────────────────────────
// DASHBOARD PRINCIPAL - SON1KVERSE.COM
// ────────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const tools = [
    {
      name: 'Ghost Studio',
      description: 'DAW avanzado con análisis de pistas y clonación de voces',
      icon: '🎛️',
      url: 'https://ghost-studio.son1kvers3.com',
      color: 'from-purple-500 to-pink-600',
      features: ['Análisis musical', 'Clonación de voces', 'Mezcla profesional', 'Dr. Pixel']
    },
    {
      name: 'The Generator',
      description: 'Generación musical con IA y letras inteligentes',
      icon: '🎵',
      url: 'https://the-generator.son1kvers3.com',
      color: 'from-green-500 to-emerald-600',
      features: ['Generación con Suno AI', 'Letras inteligentes', 'Pixel Generator', 'Anti-acústico']
    },
    {
      name: 'Sanctuary',
      description: 'Red social musical y colaboraciones',
      icon: '🛡️',
      url: 'https://sanctuary.son1kvers3.com',
      color: 'from-orange-500 to-red-600',
      features: ['Red social', 'Colaboraciones', 'Pixel Guardian', 'Ranking semanal']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">SV</span>
              </div>
              <div className="text-white font-bold text-xl">SON1KVERSE</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-gray-300">
                Bienvenido, <span className="text-cyan-400 font-semibold">{user?.name || user?.email}</span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Bienvenido al Universo
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Accede a las herramientas más avanzadas para crear música con IA. 
            Cada herramienta tiene su propia personalidad de Pixel.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tools.map((tool, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {tool.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{tool.name}</h3>
                <p className="text-gray-400 mb-6">{tool.description}</p>
                
                {/* Features */}
                <div className="space-y-2 mb-8">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="text-sm text-gray-500 flex items-center justify-center">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 transition-opacity`}
                  onClick={() => window.open(tool.url, '_blank')}
                >
                  Entrar a {tool.name}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              onClick={() => window.open('https://the-generator.son1kvers3.com', '_blank')}
            >
              🎵 Generar Música Rápida
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              onClick={() => window.open('https://ghost-studio.son1kvers3.com', '_blank')}
            >
              🎛️ Análisis de Pista
            </Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              onClick={() => window.open('https://sanctuary.son1kvers3.com', '_blank')}
            >
              🛡️ Ver Comunidad
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-12 text-center">
          <div className="bg-gray-800/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Información de Cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="text-white ml-2">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Nombre:</span>
                <span className="text-white ml-2">{user?.name || 'No especificado'}</span>
              </div>
              <div>
                <span className="text-gray-500">Tier:</span>
                <span className="text-cyan-400 ml-2">{user?.tier || 'FREE'}</span>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <span className="text-green-400 ml-2">Activo</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Son1kverse. Powered by Qwen 2, Suno AI, Supabase y Pixel Learning System.
          </p>
        </div>
      </footer>
    </div>
  );
}