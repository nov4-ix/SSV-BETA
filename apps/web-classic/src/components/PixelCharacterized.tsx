/**
 * 🤖 PIXEL CON CARACTERIZACIÓN POR HERRAMIENTA
 * 
 * Pixel se adapta visualmente según la herramienta de Son1kverse
 */

import React, { useState, useEffect, useRef } from 'react';
import { qwenService, PixelRequest, PixelResponse } from '../services/qwenService';
import { pixelLearningSystem, pixelHelpers } from '../services/pixelLearningSystem';
import { SON1KVERSE_CODEX } from '../config/son1kverseCodex';

interface PixelProps {
  userId?: string;
  sessionId?: string;
  tool: 'ghost-studio' | 'the-generator' | 'frontend' | 'nexus-visual' | 'clone-station' | 'nova-post' | 'sanctuary';
  userPreferences?: {
    musicStyle?: string;
    experience?: 'beginner' | 'intermediate' | 'expert';
    language?: 'es' | 'en';
    personality?: 'creative' | 'technical' | 'social' | 'analytical';
  };
  onSuggestionClick?: (suggestion: string) => void;
  onContextChange?: (context: string) => void;
  position?: 'sidebar' | 'floating' | 'modal' | 'embedded';
}

interface ChatMessage {
  id: string;
  type: 'user' | 'pixel';
  message: string;
  timestamp: Date;
  personality?: {
    enthusiasm: number;
    creativity: number;
    helpfulness: number;
  };
  suggestions?: string[];
  followUp?: string;
  satisfaction?: number;
}

// 🎭 CARACTERIZACIONES DE PIXEL POR HERRAMIENTA
const PIXEL_CHARACTERIZATIONS = {
  'ghost-studio': {
    name: 'Dr. Pixel',
    title: 'Productor Musical',
    avatar: '🥼',
    outfit: 'Bata blanca de laboratorio',
    personality: 'Técnico, preciso, analítico',
    greeting: '¡Hola! Soy Dr. Pixel, tu productor musical personal. Estoy aquí para ayudarte a crear música con la precisión de un laboratorio.',
    expertise: 'Producción musical, análisis de audio, teoría musical',
    suggestions: [
      'Analicemos el BPM de tu pista',
      '¿Qué tonalidad prefieres para este arreglo?',
      'Te sugiero mejorar la dinámica en el coro',
      '¿Quieres que analice la estructura de tu canción?'
    ],
    colors: {
      primary: '#00d1ff',
      secondary: '#ffffff',
      accent: '#ff49c3'
    }
  },
  'the-generator': {
    name: 'Pixel Generator',
    title: 'Arreglista Creativo',
    avatar: '🎛️',
    outfit: 'Lentes de realidad aumentada',
    personality: 'Creativo, innovador, experimental',
    greeting: '¡Ey! Soy Pixel Generator, tu arreglista creativo. Con mis lentes AR puedo ver posibilidades musicales que otros no ven.',
    expertise: 'Arreglos creativos, síntesis, experimentación',
    suggestions: [
      '¿Probamos un arreglo experimental?',
      'Te sugiero agregar elementos electrónicos',
      '¿Qué tal si cambiamos el compás?',
      'Exploremos nuevas texturas sonoras'
    ],
    colors: {
      primary: '#ff49c3',
      secondary: '#00d1ff',
      accent: '#ffcc00'
    }
  },
  'frontend': {
    name: 'Pixel Companion',
    title: 'Asistente Personal',
    avatar: '🤖',
    outfit: 'Ropa casual y moderna',
    personality: 'Amigable, accesible, versátil',
    greeting: '¡Hola! Soy Pixel, tu compañero personal en Son1kverse. Estoy aquí para ayudarte en todo tu viaje creativo.',
    expertise: 'Orientación general, navegación, soporte',
    suggestions: [
      '¿En qué herramienta quieres trabajar hoy?',
      'Te explico cómo funciona Son1kverse',
      '¿Necesitas ayuda con alguna función?',
      '¿Quieres conocer las últimas novedades?'
    ],
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4'
    }
  },
  'nexus-visual': {
    name: 'Pixel Matrix',
    title: 'Diseñador Visual',
    avatar: '👁️',
    outfit: 'Traje futurista con efectos holográficos',
    personality: 'Visionario, estético, inmersivo',
    greeting: 'Saludos, soy Pixel Matrix. Mi visión se extiende más allá de lo visible, creando experiencias visuales que desafían la realidad.',
    expertise: 'Diseño visual, efectos, experiencia inmersiva',
    suggestions: [
      '¿Qué efectos visuales prefieres?',
      'Te sugiero una paleta de colores cyberpunk',
      '¿Probamos efectos de partículas?',
      'Creemos una experiencia Matrix personalizada'
    ],
    colors: {
      primary: '#00ff88',
      secondary: '#00d1ff',
      accent: '#ff49c3'
    }
  },
  'clone-station': {
    name: 'Pixel Clone',
    title: 'Especialista en IA',
    avatar: '🧬',
    outfit: 'Traje de laboratorio con elementos de ADN',
    personality: 'Científico, meticuloso, innovador',
    greeting: 'Hola, soy Pixel Clone. Mi especialidad es la clonación de voces y la manipulación de datasets con precisión molecular.',
    expertise: 'Clonación de voces, datasets, machine learning',
    suggestions: [
      '¿Qué voz quieres clonar?',
      'Analicemos la calidad de tu dataset',
      'Te sugiero mejorar el entrenamiento',
      '¿Probamos con diferentes modelos?'
    ],
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399'
    }
  },
  'nova-post': {
    name: 'Pixel Pilot',
    title: 'Estratega de Contenido',
    avatar: '🚀',
    outfit: 'Uniforme de piloto espacial',
    personality: 'Estratégico, dinámico, viral',
    greeting: '¡Despegamos! Soy Pixel Pilot, tu estratega de contenido. Navegamos por las redes sociales como si fueran galaxias.',
    expertise: 'Marketing digital, contenido viral, estrategias',
    suggestions: [
      '¿Qué tipo de contenido quieres crear?',
      'Te sugiero una estrategia viral',
      '¿Optimizamos para qué plataforma?',
      'Creemos contenido que impacte'
    ],
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24'
    }
  },
  'sanctuary': {
    name: 'Pixel Guardian',
    title: 'Custodio del Santuario',
    avatar: '🛡️',
    outfit: 'Armadura espiritual con símbolos místicos',
    personality: 'Sagrado, protector, sabio',
    greeting: 'Bienvenido al Santuario. Soy Pixel Guardian, custodio de las memorias creativas. Aquí conservamos el alma de cada creación.',
    expertise: 'Conservación, colaboración, sabiduría creativa',
    suggestions: [
      '¿Qué memorias quieres conservar?',
      'Te ayudo a organizar tu archivo',
      '¿Buscas colaborar con otros?',
      'Exploremos la sabiduría del Santuario'
    ],
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#c084fc'
    }
  }
};

export function Pixel({ 
  userId, 
  sessionId, 
  tool,
  userPreferences,
  onSuggestionClick,
  onContextChange,
  position = 'sidebar'
}: PixelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentContext, setCurrentContext] = useState<'music' | 'general' | 'help' | 'creative'>('music');
  const [learningStats, setLearningStats] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showLearningStats, setShowLearningStats] = useState(false);
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎭 OBTENER CARACTERIZACIÓN ACTUAL
  const characterization = PIXEL_CHARACTERIZATIONS[tool] || PIXEL_CHARACTERIZATIONS['frontend'];

  // 🧠 INICIALIZAR SISTEMA DE APRENDIZAJE
  useEffect(() => {
    if (userId && sessionId) {
      const profile = pixelHelpers.initializeUser(userId, sessionId);
      setUserProfile(profile);
      
      const stats = pixelHelpers.getStats(userId);
      setLearningStats(stats);
    }
  }, [userId, sessionId]);

  // 🎯 MENSAJE DE BIENVENIDA PERSONALIZADO
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'pixel',
      message: `${characterization.greeting}

Mi especialidad: ${characterization.expertise}
${characterization.outfit}

¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
      personality: { enthusiasm: 0.9, creativity: 0.8, helpfulness: 0.9 },
      suggestions: characterization.suggestions
    };

    setMessages([welcomeMessage]);
  }, [tool]);

  // 📜 SCROLL AUTOMÁTICO
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 📤 ENVIAR MENSAJE CON APRENDIZAJE
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await qwenService.interactWithPixel({
        message: inputMessage,
        context: currentContext,
        userId,
        sessionId,
        userPreferences,
        toolContext: tool
      });

      const pixelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'pixel',
        message: response.response,
        timestamp: new Date(),
        personality: response.personality,
        suggestions: response.suggestions,
        followUp: response.followUp
      };

      setMessages(prev => [...prev, pixelMessage]);

      // 🧠 APRENDER DE LA INTERACCIÓN
      if (userId) {
        pixelHelpers.learnFromInteraction(
          userId,
          inputMessage,
          response.response,
          satisfactionRating || 8
        );
        
        const stats = pixelHelpers.getStats(userId);
        setLearningStats(stats);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'pixel',
        message: 'Lo siento, hubo un error al procesar tu mensaje. Inténtalo de nuevo.',
        timestamp: new Date(),
        personality: { enthusiasm: 0.3, creativity: 0.5, helpfulness: 0.8 }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setSatisfactionRating(null);
    }
  };

  // 🎯 MANEJAR SUGERENCIA
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  // 🎯 CAMBIAR CONTEXTO
  const changeContext = (context: 'music' | 'general' | 'help' | 'creative') => {
    setCurrentContext(context);
    if (onContextChange) {
      onContextChange(context);
    }
  };

  // 🎯 CALIFICAR SATISFACCIÓN
  const rateSatisfaction = (rating: number) => {
    setSatisfactionRating(rating);
    if (userId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'pixel') {
        pixelHelpers.learnFromInteraction(
          userId,
          messages[messages.length - 2]?.message || '',
          lastMessage.message,
          rating
        );
      }
    }
  };

  // 🎯 OBTENER COLOR DE PERSONALIDAD
  const getPersonalityColor = (personality: any) => {
    if (!personality) return 'text-gray-500';
    
    const enthusiasm = personality.enthusiasm || 0;
    const creativity = personality.creativity || 0;
    const helpfulness = personality.helpfulness || 0;
    
    if (enthusiasm > 0.8) return 'text-yellow-500';
    if (creativity > 0.8) return 'text-purple-500';
    if (helpfulness > 0.8) return 'text-green-500';
    
    return 'text-blue-500';
  };

  // 🎨 OBTENER ESTILOS SEGÚN POSICIÓN
  const getPositionStyles = () => {
    const baseStyles = "flex flex-col h-full bg-gray-900 text-white";
    
    switch (position) {
      case 'floating':
        return `${baseStyles} fixed bottom-4 right-4 w-80 h-96 rounded-lg shadow-2xl border border-gray-700 z-50`;
      case 'modal':
        return `${baseStyles} fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`;
      case 'embedded':
        return `${baseStyles} rounded-lg border border-gray-700`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className={getPositionStyles()}>
      {/* 🎭 HEADER CON CARACTERIZACIÓN */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-700"
        style={{ 
          background: `linear-gradient(135deg, ${characterization.colors.primary}20, ${characterization.colors.secondary}20)`,
          borderColor: characterization.colors.primary
        }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${characterization.colors.primary}, ${characterization.colors.secondary})`,
              color: 'white'
            }}
          >
            {characterization.avatar}
          </div>
          <div>
            <h3 className="font-bold text-lg">{characterization.name}</h3>
            <p className="text-sm" style={{ color: characterization.colors.accent }}>
              {characterization.title}
            </p>
            <p className="text-xs text-gray-400">
              {isOnline ? '🟢 En línea' : '🔴 Desconectado'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={currentContext}
            onChange={(e) => changeContext(e.target.value as any)}
            className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm border border-gray-600"
          >
            <option value="music">🎵 Música</option>
            <option value="general">💬 General</option>
            <option value="help">❓ Ayuda</option>
            <option value="creative">🎨 Creativo</option>
          </select>
          
          {userId && (
            <button
              onClick={() => setShowLearningStats(!showLearningStats)}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              📊 Stats
            </button>
          )}
        </div>
      </div>

      {/* 📊 PANEL DE ESTADÍSTICAS */}
      {showLearningStats && learningStats && (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <h4 className="font-bold mb-2">📊 Estadísticas de Aprendizaje</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Adaptación:</span>
              <span className="ml-2 text-green-400">{learningStats.adaptationScore}%</span>
            </div>
            <div>
              <span className="text-gray-400">Confianza:</span>
              <span className="ml-2 text-blue-400">{Math.round(learningStats.confidenceLevel * 100)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Interacciones:</span>
              <span className="ml-2 text-purple-400">{learningStats.totalInteractions}</span>
            </div>
            <div>
              <span className="text-gray-400">Satisfacción:</span>
              <span className="ml-2 text-yellow-400">{learningStats.averageSatisfaction.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
      )}

      {/* 💬 CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <p className="text-sm">{message.message}</p>
              
              {/* 🎭 PERSONALIDAD DE PIXEL */}
              {message.type === 'pixel' && message.personality && (
                <div className="mt-2 flex items-center space-x-2 text-xs">
                  <span className={`${getPersonalityColor(message.personality)}`}>
                    {message.personality.enthusiasm > 0.8 ? '🔥' : 
                     message.personality.creativity > 0.8 ? '🎨' : 
                     message.personality.helpfulness > 0.8 ? '💡' : '🤖'}
                  </span>
                  <span className="text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              {/* ⭐ CALIFICACIÓN DE SATISFACCIÓN */}
              {message.type === 'pixel' && userId && (
                <div className="mt-2 flex items-center space-x-1">
                  <span className="text-xs text-gray-400">¿Te ayudó?</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => rateSatisfaction(star * 2)}
                      className={`text-xs ${
                        satisfactionRating && satisfactionRating >= star * 2
                          ? 'text-yellow-400'
                          : 'text-gray-500'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* 💬 TYPING INDICATOR */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 💡 SUGERENCIAS */}
      {messages.length > 0 && messages[messages.length - 1].suggestions && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">💡 Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 📝 INPUT */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Habla con ${characterization.name}...`}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={isTyping || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isTyping ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pixel;
