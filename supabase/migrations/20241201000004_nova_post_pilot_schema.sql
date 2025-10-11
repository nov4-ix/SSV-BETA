-- 🚀 NOVA POST PILOT - ESQUEMA DE BASE DE DATOS
-- 
-- Tablas para almacenar análisis de marketing digital y gestión de redes sociales

-- Tabla para almacenar análisis de perfiles sociales
CREATE TABLE nova_post_profile_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  analysis_type TEXT NOT NULL DEFAULT 'social_profiles',
  analysis_data JSONB NOT NULL, -- Análisis completo de perfiles sociales
  request_data JSONB NOT NULL, -- Datos de la solicitud original
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_post_profile_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile analysis." ON nova_post_profile_analysis 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile analysis." ON nova_post_profile_analysis 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabla para almacenar análisis de mercado
CREATE TABLE nova_post_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  analysis_type TEXT NOT NULL DEFAULT 'market',
  analysis_data JSONB NOT NULL, -- Análisis de mercado completo
  request_data JSONB NOT NULL, -- Datos de la solicitud original
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_post_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own market analysis." ON nova_post_analysis 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own market analysis." ON nova_post_analysis 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabla para almacenar estrategias por plataforma
CREATE TABLE nova_post_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL, -- Instagram, TikTok, YouTube, etc.
  strategy_data JSONB NOT NULL, -- Estrategia completa para la plataforma
  request_data JSONB NOT NULL, -- Datos de la solicitud original
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_post_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own platform strategies." ON nova_post_strategies 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own platform strategies." ON nova_post_strategies 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabla para almacenar ganchos virales semanales
CREATE TABLE nova_post_hooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  week TEXT NOT NULL, -- Semana del año (YYYY-WW)
  hooks_data JSONB NOT NULL, -- Ganchos virales generados
  request_data JSONB NOT NULL, -- Datos de la solicitud original
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_post_hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own viral hooks." ON nova_post_hooks 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own viral hooks." ON nova_post_hooks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabla para almacenar análisis SEO
CREATE TABLE nova_post_seo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  seo_data JSONB NOT NULL, -- Análisis SEO completo
  request_data JSONB NOT NULL, -- Datos de la solicitud original
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_post_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SEO analysis." ON nova_post_seo 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SEO analysis." ON nova_post_seo 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tabla para almacenar contenido programado
CREATE TABLE nova_post_scheduled_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL, -- Plataforma donde se publicará
  content_data JSONB NOT NULL, -- Datos del contenido (texto, imágenes, etc.)
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL, -- Cuándo se publicará
  status TEXT DEFAULT 'scheduled', -- scheduled, published, failed, cancelled
  published_at TIMESTAMP WITH TIME ZONE, -- Cuándo se publicó realmente
  error_message TEXT, -- Mensaje de error si falló
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_post_scheduled_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled content." ON nova_post_scheduled_content 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled content." ON nova_post_scheduled_content 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled content." ON nova_post_scheduled_content 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled content." ON nova_post_scheduled_content 
  FOR DELETE USING (auth.uid() = user_id);

-- Tabla para almacenar respuestas automáticas
CREATE TABLE nova_post_auto_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL, -- Plataforma donde se configuró
  response_rules JSONB NOT NULL, -- Reglas de respuesta automática
  is_active BOOLEAN DEFAULT true, -- Si está activo o no
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_post_auto_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own auto responses." ON nova_post_auto_responses 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own auto responses." ON nova_post_auto_responses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auto responses." ON nova_post_auto_responses 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auto responses." ON nova_post_auto_responses 
  FOR DELETE USING (auth.uid() = user_id);

-- Tabla para almacenar métricas de rendimiento
CREATE TABLE nova_post_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL, -- Plataforma de la métrica
  metric_type TEXT NOT NULL, -- followers, engagement, reach, etc.
  metric_value NUMERIC NOT NULL, -- Valor de la métrica
  metric_date DATE NOT NULL, -- Fecha de la métrica
  additional_data JSONB, -- Datos adicionales específicos de la métrica
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics." ON nova_post_metrics 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics." ON nova_post_metrics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Índices para optimizar consultas
CREATE INDEX idx_nova_post_profile_analysis_user_id ON nova_post_profile_analysis(user_id);
CREATE INDEX idx_nova_post_profile_analysis_created_at ON nova_post_profile_analysis(created_at);

CREATE INDEX idx_nova_post_analysis_user_id ON nova_post_analysis(user_id);
CREATE INDEX idx_nova_post_analysis_created_at ON nova_post_analysis(created_at);

CREATE INDEX idx_nova_post_strategies_user_id ON nova_post_strategies(user_id);
CREATE INDEX idx_nova_post_strategies_platform ON nova_post_strategies(platform);

CREATE INDEX idx_nova_post_hooks_user_id ON nova_post_hooks(user_id);
CREATE INDEX idx_nova_post_hooks_week ON nova_post_hooks(week);

CREATE INDEX idx_nova_post_seo_user_id ON nova_post_seo(user_id);
CREATE INDEX idx_nova_post_seo_created_at ON nova_post_seo(created_at);

CREATE INDEX idx_nova_post_scheduled_content_user_id ON nova_post_scheduled_content(user_id);
CREATE INDEX idx_nova_post_scheduled_content_scheduled_time ON nova_post_scheduled_content(scheduled_time);
CREATE INDEX idx_nova_post_scheduled_content_status ON nova_post_scheduled_content(status);

CREATE INDEX idx_nova_post_auto_responses_user_id ON nova_post_auto_responses(user_id);
CREATE INDEX idx_nova_post_auto_responses_platform ON nova_post_auto_responses(platform);
CREATE INDEX idx_nova_post_auto_responses_is_active ON nova_post_auto_responses(is_active);

CREATE INDEX idx_nova_post_metrics_user_id ON nova_post_metrics(user_id);
CREATE INDEX idx_nova_post_metrics_platform ON nova_post_metrics(platform);
CREATE INDEX idx_nova_post_metrics_metric_date ON nova_post_metrics(metric_date);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en auto_responses
CREATE TRIGGER update_nova_post_auto_responses_updated_at 
  BEFORE UPDATE ON nova_post_auto_responses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener métricas agregadas por usuario
CREATE OR REPLACE FUNCTION get_user_metrics_summary(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  platform TEXT,
  metric_type TEXT,
  current_value NUMERIC,
  previous_value NUMERIC,
  growth_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH current_metrics AS (
    SELECT 
      platform,
      metric_type,
      AVG(metric_value) as current_value
    FROM nova_post_metrics 
    WHERE user_id = p_user_id 
      AND metric_date >= CURRENT_DATE - INTERVAL '%s days' % p_days
    GROUP BY platform, metric_type
  ),
  previous_metrics AS (
    SELECT 
      platform,
      metric_type,
      AVG(metric_value) as previous_value
    FROM nova_post_metrics 
    WHERE user_id = p_user_id 
      AND metric_date >= CURRENT_DATE - INTERVAL '%s days' % (p_days * 2)
      AND metric_date < CURRENT_DATE - INTERVAL '%s days' % p_days
    GROUP BY platform, metric_type
  )
  SELECT 
    COALESCE(c.platform, p.platform) as platform,
    COALESCE(c.metric_type, p.metric_type) as metric_type,
    COALESCE(c.current_value, 0) as current_value,
    COALESCE(p.previous_value, 0) as previous_value,
    CASE 
      WHEN COALESCE(p.previous_value, 0) = 0 THEN 0
      ELSE ROUND(((COALESCE(c.current_value, 0) - COALESCE(p.previous_value, 0)) / COALESCE(p.previous_value, 0)) * 100, 2)
    END as growth_percentage
  FROM current_metrics c
  FULL OUTER JOIN previous_metrics p ON c.platform = p.platform AND c.metric_type = p.metric_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE nova_post_profile_analysis IS 'Almacena análisis detallados de perfiles sociales del usuario';
COMMENT ON TABLE nova_post_analysis IS 'Almacena análisis de mercado y audiencia objetivo';
COMMENT ON TABLE nova_post_strategies IS 'Almacena estrategias específicas por plataforma social';
COMMENT ON TABLE nova_post_hooks IS 'Almacena ganchos virales generados semanalmente';
COMMENT ON TABLE nova_post_seo IS 'Almacena análisis SEO y hashtags';
COMMENT ON TABLE nova_post_scheduled_content IS 'Almacena contenido programado para publicación automática';
COMMENT ON TABLE nova_post_auto_responses IS 'Almacena configuraciones de respuestas automáticas';
COMMENT ON TABLE nova_post_metrics IS 'Almacena métricas de rendimiento de redes sociales';
