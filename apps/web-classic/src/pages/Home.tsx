import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

// ────────────────────────────────────────────────────────────────────────────────
// PÁGINA DE INICIO - SON1KVERSE.COM
// ────────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickStart = () => {
    setIsLoading(true);
    // Redirigir al login después de un breve delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">SV</span>
              </div>
              <div className="text-white font-bold text-xl">SON1KVERSE</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Button 
                onClick={handleQuickStart}
                loading={isLoading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {isLoading ? 'Entrando...' : 'Comenzar'}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Son1kverse
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              La plataforma musical más avanzada del universo. 
              Genera, mezcla y crea música con IA, clona voces y colabora en el Santuario.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                onClick={handleQuickStart}
                loading={isLoading}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {isLoading ? 'Entrando...' : '🚀 Entrar al Universo'}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                📖 Ver Demo
              </Button>
            </div>
          </div>

          {/* Herramientas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {/* Ghost Studio */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl mb-4">🎛️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Ghost Studio</h3>
                <p className="text-gray-400 mb-6">
                  DAW avanzado con análisis de pistas, clonación de voces y mezcla profesional.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• Análisis musical con Dr. Pixel</div>
                  <div>• Clonación de voces cantadas</div>
                  <div>• Mezcla de calidad de estudio</div>
                  <div>• Sistema de aprendizaje adaptativo</div>
                </div>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  onClick={() => window.open('https://ghost-studio.son1kvers3.com', '_blank')}
                >
                  Entrar a Ghost Studio
                </Button>
              </div>
            </div>

            {/* The Generator */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-2xl font-bold text-white mb-4">The Generator</h3>
                <p className="text-gray-400 mb-6">
                  Generación musical con IA, letras inteligentes y prompts optimizados.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• Generación musical con Suno AI</div>
                  <div>• Letras con Pixel Generator</div>
                  <div>• Prompts inteligentes con Qwen 2</div>
                  <div>• Sistema anti-acústico</div>
                </div>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={() => window.open('https://the-generator.son1kvers3.com', '_blank')}
                >
                  Entrar a The Generator
                </Button>
              </div>
            </div>

            {/* Sanctuary */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Sanctuary</h3>
                <p className="text-gray-400 mb-6">
                  Red social musical, colaboraciones y comunidad creativa.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• Red social musical</div>
                  <div>• Colaboraciones en tiempo real</div>
                  <div>• Moderación con Pixel Guardian</div>
                  <div>• Ranking semanal de tracks</div>
                </div>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  onClick={() => window.open('https://sanctuary.son1kvers3.com', '_blank')}
                >
                  Entrar a Sanctuary
                </Button>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">
              Características Únicas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🤖', title: 'Pixel Assistant', desc: 'IA adaptativa con personalidades únicas' },
                { icon: '🧠', title: 'Qwen 2', desc: 'Motor de IA para generación inteligente' },
                { icon: '🎤', title: 'Clonación de Voces', desc: 'Replica voces cantadas con precisión' },
                { icon: '🌐', title: 'Traducción Automática', desc: 'Español-inglés invisible para Suno' },
                { icon: '📊', title: 'Análisis Musical', desc: 'Análisis profundo de pistas y estilos' },
                { icon: '🎛️', title: 'Mezcla Profesional', desc: 'Calidad de estudio en cada track' },
                { icon: '🔒', title: 'Sistema de Tiers', desc: 'Acceso diferenciado por suscripción' },
                { icon: '⚡', title: 'Velocidad Optimizada', desc: 'Generación rápida y eficiente' }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-2xl p-12 border border-cyan-500/20">
              <h2 className="text-3xl font-bold text-white mb-4">
                ¿Listo para crear música del futuro?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Únete a la revolución musical. Genera, mezcla, colabora y crea 
                con las herramientas más avanzadas del universo.
              </p>
              <Button 
                onClick={handleQuickStart}
                loading={isLoading}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {isLoading ? 'Entrando...' : '🚀 Comenzar Ahora'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Son1kverse. Powered by Qwen 2, Suno AI, Supabase y Pixel Learning System.
          </p>
        </div>
      </footer>
    </div>
  );
}