/**
 * 🌌 LANDING PAGE DE SON1KVERSE
 * 
 * Página de inicio optimizada para el lanzamiento
 */

import React, { useState } from 'react';
import { Son1kverseMain } from './Son1kverseMain';

interface LandingPageProps {
  userId?: string;
  sessionId?: string;
}

export function LandingPage({ userId, sessionId }: LandingPageProps) {
  const [showMainApp, setShowMainApp] = useState(false);

  if (showMainApp) {
    return <Son1kverseMain userId={userId} sessionId={sessionId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* LOGO */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-4xl">S</span>
              </div>
            </div>

            {/* TÍTULO PRINCIPAL */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Son1kverse
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-4">
              Super Son1k Universe
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
              Ecosistema revolucionario de herramientas creativas con IA. 
              Desde la generación musical hasta el marketing digital, todo integrado con tu compañero virtual Pixel.
            </p>

            {/* BOTÓN DE ACCESO */}
            <button
              onClick={() => setShowMainApp(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              🌌 Entrar al Universo
            </button>
          </div>
        </div>

        {/* PARTÍCULAS DE FONDO */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* SECCIÓN DE HERRAMIENTAS */}
      <div className="py-20 bg-gray-800 bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🛠️ Herramientas del Ecosistema</h2>
            <p className="text-xl text-gray-400">
              Cada herramienta diseñada para potenciar tu creatividad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* PIXEL */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Pixel</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Tu compañero virtual inteligente con aprendizaje adaptativo
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Aprendizaje continuo</li>
                  <li>• Personalidades contextuales</li>
                  <li>• Sugerencias inteligentes</li>
                </ul>
              </div>
            </div>

            {/* GHOST STUDIO */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">🎵</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Ghost Studio</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Análisis de audio y arreglos inteligentes
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Análisis de BPM y tonalidad</li>
                  <li>• Prompts de arreglo</li>
                  <li>• Dr. Pixel como analista</li>
                </ul>
              </div>
            </div>

            {/* THE GENERATOR */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">🎛️</span>
                </div>
                <h3 className="text-xl font-bold mb-2">The Generator</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Letras con perillas literarias y estructura sólida
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Perillas literarias</li>
                  <li>• Estructuras de canción</li>
                  <li>• Pixel Generator</li>
                </ul>
              </div>
            </div>

            {/* NOVA POST PILOT */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Nova Post Pilot</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Marketing digital y gestión de redes sociales
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Análisis de perfiles</li>
                  <li>• Estrategias por plataforma</li>
                  <li>• Ganchos virales</li>
                </ul>
              </div>
            </div>

            {/* SANCTUARY */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Sanctuary</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Red social creativa y comunidad
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Compartir tracks</li>
                  <li>• Colaboraciones</li>
                  <li>• Pixel Guardian</li>
                </ul>
              </div>
            </div>

            {/* SUNO */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">🎼</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Suno</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Generación musical con IA
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Generación de música</li>
                  <li>• Traducción automática</li>
                  <li>• Integración completa</li>
                </ul>
              </div>
            </div>

            {/* LETRAS */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Letras</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Generación inteligente de letras
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• IA avanzada</li>
                  <li>• Múltiples estilos</li>
                  <li>• Traducción automática</li>
                </ul>
              </div>
            </div>

            {/* PROMPTS */}
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Prompts</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Optimización inteligente de prompts
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Mejora automática</li>
                  <li>• Contexto musical</li>
                  <li>• Sugerencias creativas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE TECNOLOGÍA */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">⚡ Tecnología Avanzada</h2>
            <p className="text-xl text-gray-400">
              Powered by las mejores tecnologías de IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-3xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Qwen 2</h3>
              <p className="text-gray-400">
                Modelo de IA avanzado de Alibaba Cloud para generación de texto, 
                traducción y análisis inteligente.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-3xl">🗄️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Supabase</h3>
              <p className="text-gray-400">
                Base de datos en tiempo real con autenticación, 
                almacenamiento y funciones edge.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Netlify Functions</h3>
              <p className="text-gray-400">
                Serverless functions para procesamiento de IA 
                y integración con APIs externas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE LANZAMIENTO */}
      <div className="py-20 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">🚀 ¡Son1kverse está VIVO!</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            El ecosistema más avanzado de herramientas creativas con IA. 
            Únete a la revolución de la creación musical y el marketing digital.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowMainApp(true)}
              className="bg-white text-purple-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
            >
              🌌 Explorar Ahora
            </button>
            <button
              onClick={() => setShowMainApp(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-purple-900 transition-colors"
            >
              🤖 Conocer a Pixel
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              "Lo imperfecto también es sagrado." - José Jaimes (NOV4-IX)
            </p>
            <p className="text-gray-500 text-xs mt-2">
              © 2024 Son1kverse. Super Son1k Universe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

