/**
 * 🚀 CONFIGURACIÓN SUPABASE PARA SON1KVERSE
 * 
 * Configuración completa para Supabase + Qwen 2 + Píxeles adaptativos
 * 
 * ⚠️ CONFIGURACIÓN CRÍTICA - NO MODIFICAR SIN AUTORIZACIÓN
 */

export interface SupabaseConfig {
  // Supabase Core
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  
  // Edge Functions
  edgeFunctions: {
    baseURL: string;
    qwenInference: string;
    pixelAnalysis: string;
    promptOptimization: string;
    translation: string;
    suggestions: string;
  };
  
  // Database
  database: {
    schema: string;
    tables: {
      users: string;
      pixelInteractions: string;
      aiResponses: string;
      musicGenerations: string;
      userSessions: string;
    };
  };
  
  // Storage
  storage: {
    buckets: {
      models: string;
      audio: string;
      cache: string;
      uploads: string;
    };
  };
  
  // Real-time
  realtime: {
    channels: {
      pixelUpdates: string;
      userSessions: string;
      aiResponses: string;
      musicGeneration: string;
    };
  };
  
  // Vector Search
  vectorSearch: {
    enabled: boolean;
    dimensions: number;
    indexName: string;
  };
}

// 🌐 CONFIGURACIÓN SUPABASE
export const SUPABASE_CONFIG: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://son1kverse.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  
  edgeFunctions: {
    baseURL: 'https://son1kverse.supabase.co/functions/v1',
    qwenInference: '/qwen-inference',
    pixelAnalysis: '/pixel-analysis',
    promptOptimization: '/optimize-prompt',
    translation: '/translate-text',
    suggestions: '/generate-suggestions'
  },
  
  database: {
    schema: 'public',
    tables: {
      users: 'users',
      pixelInteractions: 'pixel_interactions',
      aiResponses: 'ai_responses',
      musicGenerations: 'music_generations',
      userSessions: 'user_sessions'
    }
  },
  
  storage: {
    buckets: {
      models: 'qwen-models',
      audio: 'generated-audio',
      cache: 'ai-cache',
      uploads: 'user-uploads'
    }
  },
  
  realtime: {
    channels: {
      pixelUpdates: 'pixel-behavior',
      userSessions: 'user-sessions',
      aiResponses: 'ai-responses',
      musicGeneration: 'music-generation'
    }
  },
  
  vectorSearch: {
    enabled: true,
    dimensions: 1536, // OpenAI embeddings
    indexName: 'prompt_embeddings'
  }
};

// 🎯 ENDPOINTS COMPLETOS
export const SUPABASE_ENDPOINTS = {
  // Edge Functions
  qwenInference: `${SUPABASE_CONFIG.url}/functions/v1${SUPABASE_CONFIG.edgeFunctions.qwenInference}`,
  pixelAnalysis: `${SUPABASE_CONFIG.url}/functions/v1${SUPABASE_CONFIG.edgeFunctions.pixelAnalysis}`,
  promptOptimization: `${SUPABASE_CONFIG.url}/functions/v1${SUPABASE_CONFIG.edgeFunctions.promptOptimization}`,
  translation: `${SUPABASE_CONFIG.url}/functions/v1${SUPABASE_CONFIG.edgeFunctions.translation}`,
  suggestions: `${SUPABASE_CONFIG.url}/functions/v1${SUPABASE_CONFIG.edgeFunctions.suggestions}`,
  
  // Database
  database: `${SUPABASE_CONFIG.url}/rest/v1`,
  
  // Storage
  storage: `${SUPABASE_CONFIG.url}/storage/v1`,
  
  // Auth
  auth: `${SUPABASE_CONFIG.url}/auth/v1`
};

// 📊 ESQUEMA DE BASE DE DATOS
export const DATABASE_SCHEMA = {
  // Tabla de interacciones de píxeles
  pixelInteractions: `
    CREATE TABLE IF NOT EXISTS pixel_interactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      pixel_id VARCHAR(50) NOT NULL,
      interaction_type VARCHAR(20) NOT NULL, -- click, hover, scroll
      position_x INTEGER,
      position_y INTEGER,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      session_id VARCHAR(100),
      page_url VARCHAR(500),
      device_info JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_pixel_interactions_user_id ON pixel_interactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_pixel_interactions_timestamp ON pixel_interactions(timestamp);
    CREATE INDEX IF NOT EXISTS idx_pixel_interactions_pixel_id ON pixel_interactions(pixel_id);
  `,
  
  // Tabla de respuestas de IA
  aiResponses: `
    CREATE TABLE IF NOT EXISTS ai_responses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      model VARCHAR(50) NOT NULL,
      context VARCHAR(20),
      confidence DECIMAL(3,2),
      processing_time INTEGER, -- ms
      tokens_used INTEGER,
      cost DECIMAL(10,6),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Índices
    CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_responses_created_at ON ai_responses(created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_responses_model ON ai_responses(model);
  `,
  
  // Tabla de generaciones musicales
  musicGenerations: `
    CREATE TABLE IF NOT EXISTS music_generations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      prompt TEXT NOT NULL,
      style VARCHAR(50),
      model VARCHAR(10), -- 3.5, 5
      status VARCHAR(20) DEFAULT 'pending',
      audio_url TEXT,
      waveform_url TEXT,
      duration INTEGER,
      file_size BIGINT,
      task_id VARCHAR(100),
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Índices
    CREATE INDEX IF NOT EXISTS idx_music_generations_user_id ON music_generations(user_id);
    CREATE INDEX IF NOT EXISTS idx_music_generations_status ON music_generations(status);
    CREATE INDEX IF NOT EXISTS idx_music_generations_created_at ON music_generations(created_at);
  `,
  
  // Tabla de sesiones de usuario
  userSessions: `
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      session_id VARCHAR(100) UNIQUE NOT NULL,
      device_info JSONB,
      browser_info JSONB,
      location_info JSONB,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ended_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT true,
      interactions_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Índices
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
  `
};

// 🔧 CONFIGURACIÓN DE EDGE FUNCTIONS
export const EDGE_FUNCTIONS_CONFIG = {
  // Timeout y memoria
  timeout: 30000, // 30 segundos
  memory: 256, // 256MB
  
  // Variables de entorno
  env: {
    QWEN_API_KEY: process.env.QWEN_API_KEY || 'sk-qwen-supabase-xxxxxxxxxxxxxxxx',
    QWEN_MODEL: process.env.QWEN_MODEL || 'qwen2-7b-instruct',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'sk-openai-xxxxxxxxxxxxxxxx'
  },
  
  // Regiones
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1']
};

// 🧪 PROBAR CONEXIÓN CON SUPABASE
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      },
      signal: AbortSignal.timeout(5000)
    });

    return response.ok;
  } catch (error) {
    console.error('Error probando conexión con Supabase:', error);
    return false;
  }
};

// 📊 MÉTRICAS DE SUPABASE
export const getSupabaseMetrics = () => {
  return {
    database: {
      tables: Object.keys(SUPABASE_CONFIG.database.tables).length,
      schema: SUPABASE_CONFIG.database.schema
    },
    edgeFunctions: {
      count: Object.keys(SUPABASE_CONFIG.edgeFunctions).length - 1, // Excluir baseURL
      timeout: EDGE_FUNCTIONS_CONFIG.timeout,
      memory: EDGE_FUNCTIONS_CONFIG.memory
    },
    storage: {
      buckets: Object.keys(SUPABASE_CONFIG.storage.buckets).length
    },
    realtime: {
      channels: Object.keys(SUPABASE_CONFIG.realtime.channels).length
    },
    vectorSearch: {
      enabled: SUPABASE_CONFIG.vectorSearch.enabled,
      dimensions: SUPABASE_CONFIG.vectorSearch.dimensions
    }
  };
};

// ⚠️ ADVERTENCIA DE USO
console.warn('🚀 SUPABASE CONFIG: Configuración de Supabase inicializada');
console.warn('🎯 Edge Functions:', Object.keys(SUPABASE_CONFIG.edgeFunctions).length - 1);
console.warn('📊 Tablas:', Object.keys(SUPABASE_CONFIG.database.tables).length);
