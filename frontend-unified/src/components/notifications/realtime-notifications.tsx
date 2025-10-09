import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { 
  Music, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Play
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'generation_completed' | 'generation_failed' | 'user_joined' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  data?: {
    generationId?: string;
    audioUrl?: string;
    userId?: string;
    error?: string;
  };
}

interface RealtimeNotificationsProps {
  userId?: string;
  onGenerationComplete?: (generationId: string, audioUrl: string) => void;
}

export function RealtimeNotifications({ 
  userId, 
  onGenerationComplete 
}: RealtimeNotificationsProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to realtime notifications');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from realtime notifications');
    });

    // Listen for generation updates
    newSocket.on('generation_completed', (data: {
      generationId: string;
      audioUrl: string;
      prompt: string;
      duration: number;
    }) => {
      const notification: Notification = {
        id: `gen_complete_${data.generationId}`,
        type: 'generation_completed',
        title: '🎵 Generación Completada',
        message: `"${data.prompt.substring(0, 50)}..." está lista`,
        timestamp: new Date().toISOString(),
        data: {
          generationId: data.generationId,
          audioUrl: data.audioUrl,
        },
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      
      // Show toast notification
      toast.success(
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4" />
          <span>Tu música está lista!</span>
        </div>,
        {
          duration: 5000,
          action: {
            label: 'Reproducir',
            onClick: () => {
              if (data.audioUrl) {
                const audio = new Audio(data.audioUrl);
                audio.play();
              }
            },
          },
        }
      );

      // Call callback if provided
      if (onGenerationComplete) {
        onGenerationComplete(data.generationId, data.audioUrl);
      }
    });

    newSocket.on('generation_failed', (data: {
      generationId: string;
      error: string;
      prompt: string;
    }) => {
      const notification: Notification = {
        id: `gen_failed_${data.generationId}`,
        type: 'generation_failed',
        title: '❌ Generación Fallida',
        message: `"${data.prompt.substring(0, 50)}..." falló`,
        timestamp: new Date().toISOString(),
        data: {
          generationId: data.generationId,
          error: data.error,
        },
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          <span>Generación fallida: {data.error}</span>
        </div>,
        { duration: 5000 }
      );
    });

    newSocket.on('user_joined', (data: {
      userId: string;
      username: string;
    }) => {
      const notification: Notification = {
        id: `user_${data.userId}`,
        type: 'user_joined',
        title: '👋 Nuevo Usuario',
        message: `${data.username} se unió a la plataforma`,
        timestamp: new Date().toISOString(),
        data: {
          userId: data.userId,
        },
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      
      toast.success(
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>{data.username} se unió!</span>
        </div>,
        { duration: 3000 }
      );
    });

    newSocket.on('system_alert', (data: {
      level: 'info' | 'warning' | 'error';
      message: string;
    }) => {
      const notification: Notification = {
        id: `system_${Date.now()}`,
        type: 'system_alert',
        title: '🔔 Alerta del Sistema',
        message: data.message,
        timestamp: new Date().toISOString(),
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      
      const toastFn = data.level === 'error' ? toast.error : 
                     data.level === 'warning' ? toast.error : toast.success;
      
      toastFn(
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{data.message}</span>
        </div>,
        { duration: 5000 }
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, onGenerationComplete]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'generation_completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'generation_failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'user_joined':
        return <User className="w-5 h-5 text-blue-400" />;
      case 'system_alert':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Music className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="realtime-notifications">
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          isConnected 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="fixed top-16 right-4 z-40 max-w-sm">
          <AnimatePresence>
            {notifications.slice(0, 3).map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 300, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 mb-3 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {notification.type === 'generation_completed' && notification.data?.audioUrl && (
                          <button
                            onClick={() => {
                              const audio = new Audio(notification.data!.audioUrl!);
                              audio.play();
                            }}
                            className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="p-1 bg-gray-700/50 text-gray-400 rounded hover:bg-gray-600/50 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
