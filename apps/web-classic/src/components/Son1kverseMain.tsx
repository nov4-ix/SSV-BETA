/**
 * 🌌 COMPONENTE PRINCIPAL DE SON1KVERSE
 * 
 * Integra todos los componentes de Qwen 2 y Pixel
 */

import React, { useState, useEffect } from 'react';
import Pixel from './Pixel';
import LyricsGenerator from './LyricsGenerator';
import SmartPrompts from './SmartPrompts';
import SunoIntegration from './SunoIntegration';
import PixelDashboard from './PixelDashboard';
import GhostStudioIntegration from './GhostStudioIntegration';
import TheGeneratorIntegration from './TheGeneratorIntegration';
import Sanctuary from './Sanctuary';
import NovaPostPilot from './NovaPostPilot';

interface Son1kverseMainProps {
  userId?: string;
  sessionId?: string;
}

export function Son1kverseMain({ userId, sessionId }: Son1kverseMainProps) {
  const [activeTab, setActiveTab] = useState<'pixel' | 'lyrics' | 'prompts' | 'suno' | 'ghost-studio' | 'the-generator' | 'sanctuary' | 'nova-post'>('pixel');
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentContext, setCurrentContext] = useState<'music' | 'general' | 'help' | 'creative'>('music');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState<any>(null);
  const [translatedLyrics, setTranslatedLyrics] = useState('');

  // 🎯 GENERAR ID DE USUARIO SI NO EXISTE
  useEffect(() => {
    if (!userId) {
      const generatedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // En una implementación real, esto se guardaría en el estado global o localStorage
      console.log('Generated user ID:', generatedUserId);
    }
  }, [userId]);

  // 🎯 MANEJAR SUGERENCIA DE PIXEL
  const handlePixelSuggestion = (suggestion: string) => {
    if (suggestion.includes('letras') || suggestion.includes('música')) {
      setActiveTab('lyrics');
    } else if (suggestion.includes('prompt') || suggestion.includes('mejorar')) {
      setActiveTab('prompts');
    } else if (suggestion.includes('suno') || suggestion.includes('generar')) {
      setActiveTab('suno');
    } else if (suggestion.includes('ghost') || suggestion.includes('análisis')) {
      setActiveTab('ghost-studio');
    } else if (suggestion.includes('generator') || suggestion.includes('perillas')) {
      setActiveTab('the-generator');
    } else if (suggestion.includes('sanctuary') || suggestion.includes('comunidad')) {
      setActiveTab('sanctuary');
    } else if (suggestion.includes('nova') || suggestion.includes('marketing') || suggestion.includes('redes sociales')) {
      setActiveTab('nova-post');
    }
  };

  // 🎯 MANEJAR CAMBIO DE CONTEXTO
  const handleContextChange = (context: string) => {
    setCurrentContext(context as any);
  };

  // 🎯 MANEJAR PROMPT MEJORADO
  const handlePromptEnhanced = (enhancedPrompt: string) => {
    setEnhancedPrompt(enhancedPrompt);
    // Cambiar a generación de letras si el prompt es musical
    if (enhancedPrompt.toLowerCase().includes('música') || 
        enhancedPrompt.toLowerCase().includes('canción')) {
      setActiveTab('lyrics');
    }
  };

  // 🎯 MANEJAR LETRAS GENERADAS
  const handleLyricsGenerated = (lyrics: any) => {
    setGeneratedLyrics(lyrics);
    // Cambiar a Suno si se generaron letras
    setActiveTab('suno');
  };

  // 🎯 MANEJAR TRADUCCIÓN DE LETRAS
  const handleTranslateToEnglish = (translatedText: string) => {
    setTranslatedLyrics(translatedText);
  };

  // 🎯 MANEJAR MÚSICA GENERADA
  const handleMusicGenerated = (musicData: any) => {
    console.log('Music generated:', musicData);
    // Aquí se podría integrar con el sistema de almacenamiento
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HEADER */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Son1kverse</h1>
                <p className="text-sm text-gray-400">Super Son1k Universe</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* CONTEXTO ACTUAL */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Contexto:</span>
                <span className="text-sm font-medium text-blue-400 capitalize">
                  {currentContext}
                </span>
              </div>
              
              {/* BOTÓN DE DASHBOARD */}
              {userId && (
                <button
                  onClick={() => setShowDashboard(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  📊 Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* NAVEGACIÓN */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'pixel', label: '🤖 Pixel', description: 'Asistente virtual' },
              { id: 'lyrics', label: '🎵 Letras', description: 'Generación de letras' },
              { id: 'prompts', label: '🧠 Prompts', description: 'Prompts inteligentes' },
              { id: 'suno', label: '🎛️ Suno', description: 'Generación musical' },
              { id: 'ghost-studio', label: '🎵 Ghost Studio', description: 'Análisis de pistas' },
              { id: 'the-generator', label: '🎛️ The Generator', description: 'Perillas literarias' },
              { id: 'sanctuary', label: '🛡️ Sanctuary', description: 'Red social' },
              { id: 'nova-post', label: '🚀 Nova Post Pilot', description: 'Marketing digital' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-lg">{tab.label}</span>
                  <span className="text-xs">{tab.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pixel' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Pixel
                userId={userId}
                sessionId={sessionId}
                onSuggestionClick={handlePixelSuggestion}
                onContextChange={handleContextChange}
              />
            </div>
            <div className="space-y-6">
              {/* INFORMACIÓN DE CONTEXTO */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">🎯 Contexto Actual</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">🎵</span>
                    <span className="text-sm">Música y composición</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400">🧠</span>
                    <span className="text-sm">IA y aprendizaje</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">🌐</span>
                    <span className="text-sm">Traducción automática</span>
                  </div>
                </div>
              </div>

              {/* ESTADO DEL SISTEMA */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">⚡ Estado del Sistema</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Pixel Learning</span>
                    <span className="text-green-400 text-sm">🟢 Activo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Qwen 2</span>
                    <span className="text-green-400 text-sm">🟢 Conectado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Suno Integration</span>
                    <span className="text-green-400 text-sm">🟢 Listo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <LyricsGenerator
            userId={userId}
            onLyricsGenerated={handleLyricsGenerated}
            onTranslateToEnglish={handleTranslateToEnglish}
            initialPrompt={enhancedPrompt}
          />
        )}

        {activeTab === 'prompts' && (
          <SmartPrompts
            userId={userId}
            onPromptEnhanced={handlePromptEnhanced}
            initialPrompt={generatedLyrics?.lyrics || ''}
          />
        )}

        {activeTab === 'suno' && (
          <SunoIntegration
            userId={userId}
            onMusicGenerated={handleMusicGenerated}
            initialPrompt={translatedLyrics || generatedLyrics?.lyrics || ''}
          />
        )}

        {activeTab === 'ghost-studio' && (
          <GhostStudioIntegration
            userId={userId}
            sessionId={sessionId}
            onAnalysisComplete={(analysis) => console.log('Audio analysis:', analysis)}
            onPromptGenerated={(prompt) => console.log('Arrangement prompt:', prompt)}
          />
        )}

        {activeTab === 'the-generator' && (
          <TheGeneratorIntegration
            userId={userId}
            sessionId={sessionId}
            onLyricsGenerated={(lyrics) => console.log('Structured lyrics:', lyrics)}
            onPromptGenerated={(prompt) => console.log('Generator prompt:', prompt)}
          />
        )}

        {activeTab === 'sanctuary' && (
          <Sanctuary
            userId={userId}
            sessionId={sessionId}
            username={userId ? `Usuario_${userId.slice(-4)}` : 'Usuario'}
          />
        )}

        {activeTab === 'nova-post' && (
          <NovaPostPilot
            userId={userId}
            sessionId={sessionId}
            username={userId ? `Usuario_${userId.slice(-4)}` : 'Usuario'}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">🌌 Son1kverse</h3>
              <p className="text-gray-400 text-sm">
                Super Son1k Universe - Un ecosistema revolucionario de herramientas creativas 
                con aprendizaje adaptativo único.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">🤖 Pixel</h3>
              <p className="text-gray-400 text-sm">
                Tu compañero virtual desde el día uno. Aprende de cada interacción 
                para servirte mejor como extensión de tu creatividad.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">⚡ Tecnología</h3>
              <p className="text-gray-400 text-sm">
                Powered by Qwen 2, Supabase, Netlify Functions, y el sistema de 
                aprendizaje adaptativo más avanzado del mundo.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 Son1kverse. "Lo imperfecto también es sagrado." - José Jaimes (NOV4-IX)</p>
          </div>
        </div>
      </footer>

      {/* DASHBOARD MODAL */}
      {showDashboard && userId && (
        <PixelDashboard
          userId={userId}
          onClose={() => setShowDashboard(false)}
        />
      )}
    </div>
  );
}

export default Son1kverseMain;
