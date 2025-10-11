-- 🚀 SUPABASE SCHEMA PARA QWEN 2 INTEGRATION
-- 
-- Esquema de base de datos para almacenar interacciones de IA
-- con Qwen 2 en Son1kverse

-- 📊 TABLA DE RESPUESTAS DE IA
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'lyrics', 'translation', 'smart_prompt', 'pixel_response'
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 TABLA DE INTERACCIONES DE PIXEL
CREATE TABLE IF NOT EXISTS pixel_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context VARCHAR(50) NOT NULL, -- 'music', 'general', 'help', 'creative'
  personality_metrics JSONB, -- {enthusiasm, creativity, helpfulness}
  metadata JSONB, -- {responseTime, confidence, etc}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 TABLA DE GENERACIONES MUSICALES
CREATE TABLE IF NOT EXISTS music_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  style VARCHAR(100),
  genre VARCHAR(100),
  mood VARCHAR(100),
  lyrics TEXT,
  suno_task_id VARCHAR(100),
  audio_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 TABLA DE SESIONES DE USUARIO
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  preferences JSONB, -- {musicStyle, experience, language}
  activity_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 TABLA DE CACHE DE IA
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  input_hash VARCHAR(64) NOT NULL,
  output_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔍 ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_type ON ai_responses(type);
CREATE INDEX IF NOT EXISTS idx_ai_responses_created_at ON ai_responses(created_at);

CREATE INDEX IF NOT EXISTS idx_pixel_interactions_user_id ON pixel_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pixel_interactions_session_id ON pixel_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_pixel_interactions_context ON pixel_interactions(context);

CREATE INDEX IF NOT EXISTS idx_music_generations_user_id ON music_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_music_generations_created_at ON music_generations(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at);

-- 🔐 POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_responses
CREATE POLICY "Users can view their own ai_responses" ON ai_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai_responses" ON ai_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai_responses" ON ai_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para pixel_interactions
CREATE POLICY "Users can view their own pixel_interactions" ON pixel_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pixel_interactions" ON pixel_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para music_generations
CREATE POLICY "Users can view their own music_generations" ON music_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music_generations" ON music_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music_generations" ON music_generations
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_sessions
CREATE POLICY "Users can view their own user_sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para ai_cache (solo lectura para usuarios)
CREATE POLICY "Users can view ai_cache" ON ai_cache
  FOR SELECT USING (true);

-- 🔄 FUNCIONES DE UTILIDAD
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_ai_responses_updated_at 
  BEFORE UPDATE ON ai_responses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 🧹 FUNCIÓN PARA LIMPIAR CACHE EXPIRADO
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 📊 FUNCIÓN PARA OBTENER ESTADÍSTICAS DE USUARIO
CREATE OR REPLACE FUNCTION get_user_ai_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_interactions', (
      SELECT COUNT(*) FROM pixel_interactions WHERE user_id = user_uuid
    ),
    'total_generations', (
      SELECT COUNT(*) FROM music_generations WHERE user_id = user_uuid
    ),
    'total_responses', (
      SELECT COUNT(*) FROM ai_responses WHERE user_id = user_uuid
    ),
    'favorite_context', (
      SELECT context FROM pixel_interactions 
      WHERE user_id = user_uuid 
      GROUP BY context 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    'last_activity', (
      SELECT MAX(created_at) FROM pixel_interactions WHERE user_id = user_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 🎯 FUNCIÓN PARA OBTENER SUGERENCIAS PERSONALIZADAS
CREATE OR REPLACE FUNCTION get_personalized_suggestions(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'preferred_genres', (
      SELECT array_agg(DISTINCT genre) 
      FROM music_generations 
      WHERE user_id = user_uuid AND genre IS NOT NULL
    ),
    'preferred_styles', (
      SELECT array_agg(DISTINCT style) 
      FROM music_generations 
      WHERE user_id = user_uuid AND style IS NOT NULL
    ),
    'common_moods', (
      SELECT array_agg(DISTINCT mood) 
      FROM music_generations 
      WHERE user_id = user_uuid AND mood IS NOT NULL
    ),
    'activity_pattern', (
      SELECT json_build_object(
        'most_active_hour', EXTRACT(HOUR FROM created_at),
        'most_active_day', EXTRACT(DOW FROM created_at)
      )
      FROM pixel_interactions 
      WHERE user_id = user_uuid 
      GROUP BY EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at)
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 📈 VISTA PARA ANÁLISIS DE USO
CREATE OR REPLACE VIEW ai_usage_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  type,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_responses
GROUP BY DATE_TRUNC('day', created_at), type
ORDER BY date DESC;

-- 🎵 VISTA PARA ANÁLISIS MUSICAL
CREATE OR REPLACE VIEW music_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  genre,
  style,
  mood,
  COUNT(*) as generation_count,
  COUNT(DISTINCT user_id) as unique_users
FROM music_generations
GROUP BY DATE_TRUNC('day', created_at), genre, style, mood
ORDER BY date DESC;

-- 🔄 TAREA PROGRAMADA PARA LIMPIAR CACHE (requiere pg_cron)
-- SELECT cron.schedule('clean-cache', '0 2 * * *', 'SELECT clean_expired_cache();');

-- 📝 COMENTARIOS
COMMENT ON TABLE ai_responses IS 'Almacena todas las respuestas generadas por Qwen 2';
COMMENT ON TABLE pixel_interactions IS 'Registra las interacciones del asistente virtual Pixel';
COMMENT ON TABLE music_generations IS 'Guarda las generaciones musicales y sus metadatos';
COMMENT ON TABLE user_sessions IS 'Mantiene el estado de las sesiones de usuario';
COMMENT ON TABLE ai_cache IS 'Cache para optimizar respuestas frecuentes';

COMMENT ON FUNCTION get_user_ai_stats(UUID) IS 'Obtiene estadísticas de uso de IA para un usuario';
COMMENT ON FUNCTION get_personalized_suggestions(UUID) IS 'Genera sugerencias personalizadas basadas en el historial';
COMMENT ON FUNCTION clean_expired_cache() IS 'Limpia entradas de cache expiradas';
