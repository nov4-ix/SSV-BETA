/**
 * 🛡️ SANCTUARIO - COMPONENTE PRINCIPAL
 * 
 * Red social respetuosa con chat, colaboraciones y top tracks
 */

import React, { useState, useEffect, useRef } from 'react';
import PixelCharacterized from './PixelCharacterized';

interface SanctuaryProps {
  userId?: string;
  sessionId?: string;
  username?: string;
}

interface SanctuaryMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  type: 'text' | 'track_share' | 'collaboration_request' | 'system';
  trackData?: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    genre: string;
    mood: string;
    audioUrl: string;
    coverUrl?: string;
  };
  collaborationData?: {
    type: 'vocalist' | 'producer' | 'lyricist' | 'mixer' | 'general';
    description: string;
    requirements: string[];
    timeline: string;
  };
  timestamp: string;
  reactions: {
    likes: number;
    shares: number;
    comments: number;
  };
  isModerated: boolean;
}

interface TopTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  audioUrl: string;
  coverUrl?: string;
  totalReactions: number;
  likes: number;
  shares: number;
  comments: number;
}

export function Sanctuary({ userId, sessionId, username = 'Usuario' }: SanctuaryProps) {
  const [messages, setMessages] = useState<SanctuaryMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'top-tracks' | 'collaborations'>('chat');
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [showCollaborationForm, setShowCollaborationForm] = useState(false);
  const [showTrackShareForm, setShowTrackShareForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 📨 CARGAR MENSAJES INICIALES
  useEffect(() => {
    loadMessages();
    loadTopTracks();
  }, []);

  // 📜 SCROLL AUTOMÁTICO
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 📨 CARGAR MENSAJES
  const loadMessages = async () => {
    try {
      const response = await fetch('/netlify/functions/sanctuary-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_messages',
          userId,
          username,
          limit: 50,
          offset: 0
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // 🏆 CARGAR TOP TRACKS
  const loadTopTracks = async () => {
    try {
      const response = await fetch('/netlify/functions/sanctuary-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_top_tracks',
          userId,
          username
        })
      });

      const data = await response.json();
      if (data.success) {
        setTopTracks(data.data || []);
      }
    } catch (error) {
      console.error('Error loading top tracks:', error);
    }
  };

  // 💬 ENVIAR MENSAJE
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      const response = await fetch('/netlify/functions/sanctuary-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          userId,
          username,
          message: newMessage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [data.data, ...prev]);
        setNewMessage('');
      } else {
        if (data.moderation?.isModerated) {
          setWarning(data.warning || 'Pixel Guardian ha detectado contenido que necesita revisión.');
        } else {
          setError(data.message || 'Error al enviar mensaje');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎵 COMPARTIR TRACK
  const shareTrack = async (trackData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/sanctuary-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'share_track',
          userId,
          username,
          trackData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [data.data, ...prev]);
        setShowTrackShareForm(false);
        loadTopTracks(); // Recargar top tracks
      } else {
        setError(data.message || 'Error al compartir track');
      }
    } catch (error) {
      console.error('Error sharing track:', error);
      setError('Error al compartir track');
    } finally {
      setIsLoading(false);
    }
  };

  // 🤝 SOLICITAR COLABORACIÓN
  const requestCollaboration = async (collaborationData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/netlify/functions/sanctuary-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_collaboration',
          userId,
          username,
          collaborationData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [data.data, ...prev]);
        setShowCollaborationForm(false);
      } else {
        setError(data.message || 'Error al solicitar colaboración');
      }
    } catch (error) {
      console.error('Error requesting collaboration:', error);
      setError('Error al solicitar colaboración');
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ REACCIONAR A MENSAJE
  const reactToMessage = async (messageId: string, reactionType: 'like' | 'share' | 'comment') => {
    try {
      const response = await fetch('/netlify/functions/sanctuary-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'react_to_message',
          userId,
          username,
          messageId,
          reactionType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Actualizar mensajes localmente
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reactions: { ...msg.reactions, [reactionType]: msg.reactions[reactionType] + 1 } }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  };

  // 🎵 FORMULARIO DE COMPARTIR TRACK
  const TrackShareForm = () => {
    const [trackData, setTrackData] = useState({
      title: '',
      artist: username,
      duration: 0,
      genre: '',
      mood: '',
      audioUrl: '',
      coverUrl: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      shareTrack(trackData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">🎵 Compartir Track</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                value={trackData.title}
                onChange={(e) => setTrackData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Género</label>
                <select
                  value={trackData.genre}
                  onChange={(e) => setTrackData(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="electronic">Electrónico</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="jazz">Jazz</option>
                  <option value="acoustic">Acústico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ánimo</label>
                <select
                  value={trackData.mood}
                  onChange={(e) => setTrackData(prev => ({ ...prev, mood: e.target.value }))}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="energetic">Energético</option>
                  <option value="melancholic">Melancólico</option>
                  <option value="hopeful">Esperanzado</option>
                  <option value="romantic">Romántico</option>
                  <option value="mysterious">Misterioso</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL del Audio</label>
              <input
                type="url"
                value={trackData.audioUrl}
                onChange={(e) => setTrackData(prev => ({ ...prev, audioUrl: e.target.value }))}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isLoading ? 'Compartiendo...' : 'Compartir'}
              </button>
              <button
                type="button"
                onClick={() => setShowTrackShareForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 🤝 FORMULARIO DE COLABORACIÓN
  const CollaborationForm = () => {
    const [collaborationData, setCollaborationData] = useState({
      type: 'general' as 'vocalist' | 'producer' | 'lyricist' | 'mixer' | 'general',
      description: '',
      requirements: [''],
      timeline: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      requestCollaboration(collaborationData);
    };

    const addRequirement = () => {
      setCollaborationData(prev => ({
        ...prev,
        requirements: [...prev.requirements, '']
      }));
    };

    const updateRequirement = (index: number, value: string) => {
      setCollaborationData(prev => ({
        ...prev,
        requirements: prev.requirements.map((req, i) => i === index ? value : req)
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">🤝 Solicitar Colaboración</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Colaboración</label>
              <select
                value={collaborationData.type}
                onChange={(e) => setCollaborationData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="general">General</option>
                <option value="vocalist">Vocalista</option>
                <option value="producer">Productor</option>
                <option value="lyricist">Letrista</option>
                <option value="mixer">Mezclador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={collaborationData.description}
                onChange={(e) => setCollaborationData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-24 bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Describe tu proyecto y qué tipo de colaboración buscas..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Requisitos</label>
              {collaborationData.requirements.map((req, index) => (
                <input
                  key={index}
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 mb-2"
                  placeholder={`Requisito ${index + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-blue-400 text-sm hover:text-blue-300"
              >
                + Agregar requisito
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Timeline</label>
              <input
                type="text"
                value={collaborationData.timeline}
                onChange={(e) => setCollaborationData(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="ej: 2 semanas, 1 mes, etc."
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isLoading ? 'Enviando...' : 'Solicitar'}
              </button>
              <button
                type="button"
                onClick={() => setShowCollaborationForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* 🛡️ PANEL PRINCIPAL */}
      <div className="lg:col-span-3 space-y-6">
        {/* HEADER DEL SANCTUARIO */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sanctuary</h1>
              <p className="text-purple-200">Red social respetuosa de Son1kverse</p>
            </div>
          </div>

          {/* REGLAS DEL SANCTUARIO */}
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">🛡️ Reglas del Sanctuary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-purple-200">
              <div>• <strong>Respeto absoluto:</strong> Todos los tracks son sagrados</div>
              <div>• <strong>No críticas destructivas:</strong> Las opiniones son subjetivas</div>
              <div>• <strong>Tolerancia cero:</strong> Toxicidad = ban permanente</div>
              <div>• <strong>Colaboración:</strong> Fomentar el apoyo mutuo</div>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <div className="flex space-x-4 border-b border-gray-700">
          {[
            { id: 'chat', label: '💬 Chat', icon: '💬' },
            { id: 'top-tracks', label: '🏆 Top Tracks', icon: '🏆' },
            { id: 'collaborations', label: '🤝 Colaboraciones', icon: '🤝' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO SEGÚN TAB */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {/* CHAT MESSAGES */}
            <div className="bg-gray-800 rounded-lg h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {message.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">{message.username}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {/* MENSAJE DE TEXTO */}
                    {message.type === 'text' && (
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-white">{message.message}</p>
                      </div>
                    )}

                    {/* TRACK COMPARTIDO */}
                    {message.type === 'track_share' && message.trackData && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                            🎵
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{message.trackData.title}</h4>
                            <p className="text-sm text-gray-300">por {message.trackData.artist}</p>
                            <div className="flex space-x-2 mt-1">
                              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                                {message.trackData.genre}
                              </span>
                              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                {message.trackData.mood}
                              </span>
                            </div>
                          </div>
                          <audio controls className="w-32">
                            <source src={message.trackData.audioUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      </div>
                    )}

                    {/* SOLICITUD DE COLABORACIÓN */}
                    {message.type === 'collaboration_request' && message.collaborationData && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                            🤝
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">
                              Solicita colaboración: {message.collaborationData.type}
                            </h4>
                            <p className="text-sm text-gray-300 mt-1">
                              {message.collaborationData.description}
                            </p>
                            <div className="mt-2">
                              <p className="text-xs text-gray-400">
                                Timeline: {message.collaborationData.timeline}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* REACCIONES */}
                    <div className="flex space-x-4 mt-2">
                      <button
                        onClick={() => reactToMessage(message.id, 'like')}
                        className="flex items-center space-x-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <span>❤️</span>
                        <span>{message.reactions.likes}</span>
                      </button>
                      <button
                        onClick={() => reactToMessage(message.id, 'share')}
                        className="flex items-center space-x-1 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <span>🔄</span>
                        <span>{message.reactions.shares}</span>
                      </button>
                      <button
                        onClick={() => reactToMessage(message.id, 'comment')}
                        className="flex items-center space-x-1 text-sm text-gray-400 hover:text-green-400 transition-colors"
                      >
                        <span>💬</span>
                        <span>{message.reactions.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT DE MENSAJE */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje respetuoso..."
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !newMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowTrackShareForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🎵 Compartir Track
              </button>
              <button
                onClick={() => setShowCollaborationForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🤝 Solicitar Colaboración
              </button>
            </div>
          </div>
        )}

        {activeTab === 'top-tracks' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">🏆 Top 10 Tracks de la Semana</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topTracks.map((track, index) => (
                <div key={track.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{track.title}</h3>
                      <p className="text-sm text-gray-300">por {track.artist}</p>
                      <div className="flex space-x-2 mt-1">
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                          {track.genre}
                        </span>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          {track.mood}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Total</div>
                      <div className="text-lg font-bold text-yellow-400">{track.totalReactions}</div>
                    </div>
                  </div>
                  <div className="flex space-x-4 mt-3 text-sm text-gray-400">
                    <span>❤️ {track.likes}</span>
                    <span>🔄 {track.shares}</span>
                    <span>💬 {track.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collaborations' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">🤝 Colaboraciones Activas</h2>
            <div className="space-y-4">
              {messages
                .filter(msg => msg.type === 'collaboration_request')
                .map((message) => (
                  <div key={message.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        🤝
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold text-white">{message.username}</span>
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            {message.collaborationData?.type}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-2">{message.collaborationData?.description}</p>
                        <div className="text-sm text-gray-400">
                          Timeline: {message.collaborationData?.timeline}
                        </div>
                      </div>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Contactar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ERROR Y WARNING */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {warning && (
          <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{warning}</span>
            </div>
          </div>
        )}
      </div>

      {/* 🤖 PIXEL GUARDIAN */}
      <div className="lg:col-span-1">
        <PixelCharacterized
          userId={userId}
          sessionId={sessionId}
          tool="sanctuary"
          position="embedded"
          onSuggestionClick={(suggestion) => {
            if (suggestion.includes('compartir') || suggestion.includes('track')) {
              setShowTrackShareForm(true);
            } else if (suggestion.includes('colaboración') || suggestion.includes('colaborar')) {
              setShowCollaborationForm(true);
            }
          }}
        />
      </div>

      {/* FORMULARIOS MODALES */}
      {showTrackShareForm && <TrackShareForm />}
      {showCollaborationForm && <CollaborationForm />}
    </div>
  );
}

export default Sanctuary;
