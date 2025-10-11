/**
 * 🌌 COMPONENTE PRINCIPAL DE SON1KVERSE
 * 
 * Ecosistema completo de herramientas creativas con IA
 * - Pixel: Asistente virtual inteligente
 * - Ghost Studio: Análisis de audio y arreglos
 * - The Generator: Generación de letras con perillas literarias
 * - Nova Post Pilot: Marketing digital y redes sociales
 * - Sanctuary: Red social y comunidad creativa
 * - Suno Integration: Generación musical con IA
 */

import React, { useState, useEffect } from 'react';
import PixelCharacterized from './PixelCharacterized';
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
  initialTool?: 'pixel' | 'lyrics' | 'prompts' | 'suno' | 'ghost-studio' | 'the-generator' | 'sanctuary' | 'nova-post';
}

export function Son1kverseMain({ userId, sessionId, initialTool = 'pixel' }: Son1kverseMainProps) {
  const [activeTab, setActiveTab] = useState<'pixel' | 'lyrics' | 'prompts' | 'suno' | 'ghost-studio' | 'the-generator' | 'sanctuary' | 'nova-post'>(initialTool);
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
              { 
                id: 'pixel', 
                label: '🤖 Pixel', 
                description: 'Asistente virtual inteligente',
                category: 'core'
              },
              { 
                id: 'ghost-studio', 
                label: '🎵 Ghost Studio', 
                description: 'Análisis de audio y arreglos',
                category: 'music'
              },
              { 
                id: 'the-generator', 
                label: '🎛️ The Generator', 
                description: 'Letras con perillas literarias',
                category: 'music'
              },
              { 
                id: 'suno', 
                label: '🎼 Suno', 
                description: 'Generación musical con IA',
                category: 'music'
              },
              { 
                id: 'nova-post', 
                label: '🚀 Nova Post Pilot', 
                description: 'Marketing digital y redes',
                category: 'marketing'
              },
              { 
                id: 'sanctuary', 
                label: '🛡️ Sanctuary', 
                description: 'Red social creativa',
                category: 'community'
              },
              { 
                id: 'lyrics', 
                label: '📝 Letras', 
                description: 'Generación de letras',
                category: 'tools'
              },
              { 
                id: 'prompts', 
                label: '🧠 Prompts', 
                description: 'Prompts inteligentes',
                category: 'tools'
              }
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">🤖</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Pixel - Tu Compañero Virtual</h1>
                    <p className="text-purple-200">Asistente inteligente con aprendizaje adaptativo</p>
                  </div>
                </div>
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <p className="text-purple-200 text-sm">
                    Pixel es tu compañero virtual desde el día uno. Aprende de cada interacción para servirte mejor 
                    como extensión de tu creatividad. Disponible en todas las herramientas con personalidades específicas.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">🎯 Contexto Actual</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-gray-400">Modo:</span>
                    <span className="text-sm font-medium text-blue-400 capitalize">
                      {currentContext}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Pixel se adapta a tu contexto actual para proporcionar sugerencias más relevantes.
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">🧠 Funciones Principales</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Sugerencias inteligentes de herramientas</li>
                    <li>• Aprendizaje de tus preferencias</li>
                    <li>• Contexto adaptativo por herramienta</li>
                    <li>• Asistencia creativa personalizada</li>
                  </ul>
                </div>
                
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
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">🎨 Personalidades</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400">🔬</span>
                      <span className="text-sm">Dr. Pixel (Ghost Studio)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">📝</span>
                      <span className="text-sm">Pixel Generator</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-400">🚀</span>
                      <span className="text-sm">Pixel Pilot (Nova Post)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-indigo-400">🛡️</span>
                      <span className="text-sm">Pixel Guardian (Sanctuary)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <PixelCharacterized
                userId={userId}
                sessionId={sessionId}
                toolContext="general"
                onSuggestionClick={handlePixelSuggestion}
                onContextChange={handleContextChange}
              />
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3">
              <LyricsGenerator
                userId={userId}
                onLyricsGenerated={handleLyricsGenerated}
                onTranslateToEnglish={handleTranslateToEnglish}
                initialPrompt={enhancedPrompt}
              />
            </div>
            <div className="lg:col-span-1">
              <PixelCharacterized
                userId={userId}
                sessionId={sessionId}
                toolContext="the-generator"
                onSuggestionClick={(suggestion) => {
                  if (suggestion.includes('letras') || suggestion.includes('generar')) {
                    // Trigger lyrics generation
                    console.log('Pixel suggests lyrics generation');
                  } else if (suggestion.includes('traducir') || suggestion.includes('inglés')) {
                    // Trigger translation
                    console.log('Pixel suggests translation');
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3">
              <SmartPrompts
                userId={userId}
                onPromptEnhanced={handlePromptEnhanced}
                initialPrompt={generatedLyrics?.lyrics || ''}
              />
            </div>
            <div className="lg:col-span-1">
              <PixelCharacterized
                userId={userId}
                sessionId={sessionId}
                toolContext="general"
                onSuggestionClick={(suggestion) => {
                  if (suggestion.includes('prompt') || suggestion.includes('mejorar')) {
                    // Trigger prompt enhancement
                    console.log('Pixel suggests prompt enhancement');
                  } else if (suggestion.includes('optimizar') || suggestion.includes('creativo')) {
                    // Trigger creative optimization
                    console.log('Pixel suggests creative optimization');
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'suno' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3">
              <SunoIntegration
                userId={userId}
                onMusicGenerated={handleMusicGenerated}
                initialPrompt={translatedLyrics || generatedLyrics?.lyrics || ''}
              />
            </div>
            <div className="lg:col-span-1">
              <PixelCharacterized
                userId={userId}
                sessionId={sessionId}
                toolContext="general"
                onSuggestionClick={(suggestion) => {
                  if (suggestion.includes('generar') || suggestion.includes('música')) {
                    // Trigger music generation
                    console.log('Pixel suggests music generation');
                  } else if (suggestion.includes('suno') || suggestion.includes('ai')) {
                    // Trigger Suno integration
                    console.log('Pixel suggests Suno integration');
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'ghost-studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3">
              <GhostStudioIntegration
                userId={userId}
                sessionId={sessionId}
                onAnalysisComplete={(analysis) => console.log('Audio analysis:', analysis)}
                onPromptGenerated={(prompt) => console.log('Arrangement prompt:', prompt)}
              />
            </div>
            <div className="lg:col-span-1">
              <PixelCharacterized
                userId={userId}
                sessionId={sessionId}
                toolContext="ghost-studio"
                onSuggestionClick={(suggestion) => {
                  if (suggestion.includes('análisis') || suggestion.includes('audio')) {
                    // Trigger audio analysis
                    console.log('Pixel suggests audio analysis');
                  } else if (suggestion.includes('arreglo') || suggestion.includes('prompt')) {
                    // Trigger arrangement prompt generation
                    console.log('Pixel suggests arrangement prompt');
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'the-generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3">
              <TheGeneratorIntegration
                userId={userId}
                sessionId={sessionId}
                onLyricsGenerated={(lyrics) => console.log('Structured lyrics:', lyrics)}
                onPromptGenerated={(prompt) => console.log('Generator prompt:', prompt)}
              />
            </div>
            <div className="lg:col-span-1">
              <PixelCharacterized
                userId={userId}
                sessionId={sessionId}
                toolContext="the-generator"
                onSuggestionClick={(suggestion) => {
                  if (suggestion.includes('letras') || suggestion.includes('perillas')) {
                    // Trigger lyrics generation
                    console.log('Pixel suggests lyrics generation');
                  } else if (suggestion.includes('arreglo') || suggestion.includes('prompt')) {
                    // Trigger arrangement prompt generation
                    console.log('Pixel suggests arrangement prompt');
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'sanctuary' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3">
              <Sanctuary
                userId={userId}
                sessionId={sessionId}
                username={userId ? `Usuario_${userId.slice(-4)}` : 'Usuario'}
              />
            </div>
            <div className="lg:col-span-1">
              <PixelCharacterized
                userId={userId}
                sessionId={sessionId}
                toolContext="sanctuary"
                onSuggestionClick={(suggestion) => {
                  if (suggestion.includes('compartir') || suggestion.includes('track')) {
                    // Trigger track sharing
                    console.log('Pixel suggests track sharing');
                  } else if (suggestion.includes('colaboración') || suggestion.includes('colaborar')) {
                    // Trigger collaboration
                    console.log('Pixel suggests collaboration');
                  }
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'nova-post' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3">
              <NovaPostPilot
                userId={userId}
                sessionId={sessionId}
                username={userId ? `Usuario_${userId.slice(-4)}` : 'Usuario'}
              />
            </div>
            <div className="lg:col-span-1">
              <PixelCharacterized
                userId={userId}
                sessionId={sessionId}
                toolContext="nova-post"
                onSuggestionClick={(suggestion) => {
                  if (suggestion.includes('análisis') || suggestion.includes('mercado')) {
                    // Trigger market analysis
                    console.log('Pixel suggests market analysis');
                  } else if (suggestion.includes('estrategia') || suggestion.includes('plataforma')) {
                    // Trigger platform strategy
                    console.log('Pixel suggests platform strategy');
                  } else if (suggestion.includes('ganchos') || suggestion.includes('viral')) {
                    // Trigger viral hooks generation
                    console.log('Pixel suggests viral hooks');
                  }
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">🌌 Son1kverse</h3>
              <p className="text-gray-400 text-sm">
                Ecosistema completo de herramientas creativas con IA. 
                Desde la generación musical hasta el marketing digital.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">🎵 Herramientas Musicales</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• 🎵 Ghost Studio - Análisis de audio</li>
                <li>• 🎛️ The Generator - Letras con perillas</li>
                <li>• 🎼 Suno - Generación musical IA</li>
                <li>• 📝 Letras - Generación inteligente</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">🚀 Herramientas Digitales</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• 🚀 Nova Post Pilot - Marketing digital</li>
                <li>• 🛡️ Sanctuary - Red social creativa</li>
                <li>• 🧠 Prompts - Optimización inteligente</li>
                <li>• 🤖 Pixel - Asistente virtual</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">⚡ Tecnología</h3>
              <p className="text-gray-400 text-sm">
                Powered by Qwen 2, Supabase, Netlify Functions, 
                y el sistema de aprendizaje adaptativo más avanzado del mundo.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 Son1kverse. "Lo imperfecto también es sagrado." - José Jaimes (NOV4-IX)</p>
            <p className="mt-2">🌌 Super Son1k Universe - Revolucionando la creación musical</p>
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
