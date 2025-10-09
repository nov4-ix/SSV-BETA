/**
 * 🚀 CLIENTE SUPABASE PARA SON1KVERSE
 * 
 * Cliente principal para conectar con Supabase
 * 
 * ⚠️ CONFIGURACIÓN CRÍTICA - NO MODIFICAR SIN AUTORIZACIÓN
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabaseConfig';

// 🌐 CLIENTE SUPABASE PRINCIPAL
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// 🔐 CLIENTE CON SERVICE ROLE (solo para Edge Functions)
export const supabaseAdmin = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 🎯 HELPERS PARA SON1KVERSE

/**
 * 🔍 OBTENER USUARIO ACTUAL
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
  return user;
};

/**
 * 📊 REGISTRAR INTERACCIÓN DE PÍXEL
 */
export const logPixelInteraction = async (interaction: {
  pixelId: string;
  type: 'click' | 'hover' | 'scroll';
  positionX?: number;
  positionY?: number;
  pageUrl?: string;
  deviceInfo?: any;
}) => {
  try {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from(SUPABASE_CONFIG.database.tables.pixelInteractions)
      .insert({
        user_id: user?.id || null,
        pixel_id: interaction.pixelId,
        interaction_type: interaction.type,
        position_x: interaction.positionX,
        position_y: interaction.positionY,
        page_url: interaction.pageUrl || window.location.href,
        device_info: interaction.deviceInfo || {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${screen.width}x${screen.height}`
        },
        session_id: getSessionId()
      });

    if (error) {
      console.error('Error registrando interacción de píxel:', error);
    }

    return { data, error };
  } catch (error) {
    console.error('Error en logPixelInteraction:', error);
    return { data: null, error };
  }
};

/**
 * 🎵 REGISTRAR GENERACIÓN MUSICAL
 */
export const logMusicGeneration = async (generation: {
  prompt: string;
  style?: string;
  model: '3.5' | '5';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  taskId?: string;
  errorMessage?: string;
}) => {
  try {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from(SUPABASE_CONFIG.database.tables.musicGenerations)
      .insert({
        user_id: user?.id || null,
        prompt: generation.prompt,
        style: generation.style,
        model: generation.model,
        status: generation.status,
        audio_url: generation.audioUrl,
        task_id: generation.taskId,
        error_message: generation.errorMessage
      });

    if (error) {
      console.error('Error registrando generación musical:', error);
    }

    return { data, error };
  } catch (error) {
    console.error('Error en logMusicGeneration:', error);
    return { data: null, error };
  }
};

/**
 * 🧠 REGISTRAR RESPUESTA DE IA
 */
export const logAIResponse = async (response: {
  prompt: string;
  response: string;
  model: string;
  context?: string;
  confidence?: number;
  processingTime?: number;
  tokensUsed?: number;
}) => {
  try {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from(SUPABASE_CONFIG.database.tables.aiResponses)
      .insert({
        user_id: user?.id || null,
        prompt: response.prompt,
        response: response.response,
        model: response.model,
        context: response.context,
        confidence: response.confidence,
        processing_time: response.processingTime,
        tokens_used: response.tokensUsed
      });

    if (error) {
      console.error('Error registrando respuesta de IA:', error);
    }

    return { data, error };
  } catch (error) {
    console.error('Error en logAIResponse:', error);
    return { data: null, error };
  }
};

/**
 * 📡 SUSCRIBIRSE A ACTUALIZACIONES EN TIEMPO REAL
 */
export const subscribeToPixelUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel(SUPABASE_CONFIG.realtime.channels.pixelUpdates)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: SUPABASE_CONFIG.database.schema,
      table: SUPABASE_CONFIG.database.tables.pixelInteractions
    }, callback)
    .subscribe();
};

/**
 * 🎵 SUSCRIBIRSE A GENERACIONES MUSICALES
 */
export const subscribeToMusicGenerations = (callback: (payload: any) => void) => {
  return supabase
    .channel(SUPABASE_CONFIG.realtime.channels.musicGeneration)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: SUPABASE_CONFIG.database.schema,
      table: SUPABASE_CONFIG.database.tables.musicGenerations
    }, callback)
    .subscribe();
};

/**
 * 🆔 OBTENER ID DE SESIÓN
 */
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('son1kverse_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('son1kverse_session_id', sessionId);
  }
  return sessionId;
};

/**
 * 🧪 PROBAR CONEXIÓN CON SUPABASE
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Error probando conexión con Supabase:', error);
    return false;
  }
};

/**
 * 📊 OBTENER ESTADÍSTICAS DE USUARIO
 */
export const getUserStats = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const [pixelInteractions, musicGenerations, aiResponses] = await Promise.all([
      supabase
        .from(SUPABASE_CONFIG.database.tables.pixelInteractions)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id),
      
      supabase
        .from(SUPABASE_CONFIG.database.tables.musicGenerations)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id),
      
      supabase
        .from(SUPABASE_CONFIG.database.tables.aiResponses)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
    ]);

    return {
      pixelInteractions: pixelInteractions.count || 0,
      musicGenerations: musicGenerations.count || 0,
      aiResponses: aiResponses.count || 0,
      lastActivity: new Date()
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de usuario:', error);
    return null;
  }
};

// ⚠️ ADVERTENCIA DE USO
console.warn('🚀 SUPABASE CLIENT: Cliente de Supabase inicializado');
console.warn('🎯 URL:', SUPABASE_CONFIG.url);
