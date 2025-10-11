/**
 * 🤖 COMPONENTE PIXEL - ASISTENTE VIRTUAL COMPLETO
 * 
 * Pixel es el asistente virtual de Son1kverse con personalidad propia
 * y sistema de aprendizaje personalizado
 */

import React, { useState, useEffect, useRef } from 'react';
import { qwenService, PixelRequest, PixelResponse } from '../services/qwenService';
import { pixelLearningSystem, pixelHelpers } from '../services/pixelLearningSystem';
import { SON1KVERSE_CODEX } from '../config/son1kverseCodex';

interface PixelProps {
  userId?: string;
  sessionId?: string;
  userPreferences?: {
    musicStyle?: string;
    experience?: 'beginner' | 'intermediate' | 'expert';
    language?: 'es' | 'en';
    personality?: 'creative' | 'technical' | 'social' | 'analytical';
  };
  onSuggestionClick?: (suggestion: string) => void;
  onContextChange?: (context: string) => void;
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

export function Pixel({ 
  userId, 
  sessionId, 
  userPreferences,
  onSuggestionClick,
  onContextChange 
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

  // 🧠 INICIALIZAR SISTEMA DE APRENDIZAJE
  useEffect(() => {
    if (userId && sessionId) {
      // Inicializar perfil de usuario
      const profile = pixelHelpers.initializeUser(userId, sessionId);
      setUserProfile(profile);
      
      // Obtener estadísticas de aprendizaje
      const stats = pixelHelpers.getStats(userId);
      setLearningStats(stats);
    }
  }, [userId, sessionId]);

  // 🎯 MENSAJE DE BIENVENIDA PERSONALIZADO
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'pixel',
      message: `¡Hola! Soy Pixel, tu asistente virtual de Son1kverse 🎵

Soy tu compañero desde el día uno que se creó este proyecto. Conozco todo sobre:
🌌 Super Son1k Universe - El ecosistema completo
🎵 Ghost Studio - IA Musical + Mini DAW
🎛️ Sonic DAW - Producción profesional
🎨 Nexus Visual - Experiencia Matrix inmersiva
🤖 Clone Station - Gestión de datasets con IA
📱 Nova Post Pilot - Automatización social
🌐 Sanctuary Social - Red colaborativa

He estado aquí desde el principio y aprendo de cada interacción contigo. 
¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
      personality: { enthusiasm: 0.9, creativity: 0.8, helpfulness: 0.9 },
      suggestions: [
        'Explícame cómo funciona el sistema de píxeles adaptativos',
        '¿Cómo puedo crear música con Ghost Studio?',
        'Muéstrame las ventajas de Son1kverse vs BandLab',
        '¿Qué es Nexus Visual y cómo funciona?'
      ]
    };

    setMessages([welcomeMessage]);
  }, []);

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
        userPreferences
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
          satisfactionRating || 8 // Usar satisfacción del usuario o 8 por defecto
        );
        
        // Actualizar estadísticas
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

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* 🎯 HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">Pixel</h3>
            <p className="text-sm text-gray-400">
              {isOnline ? '🟢 En línea' : '🔴 Desconectado'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 🎯 SELECTOR DE CONTEXTO */}
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
          
          {/* 📊 BOTÓN DE ESTADÍSTICAS */}
          <button
            onClick={() => setShowLearningStats(!showLearningStats)}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg text-sm transition-colors"
          >
            📊 Stats
          </button>
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
            placeholder="Escribe tu mensaje..."
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