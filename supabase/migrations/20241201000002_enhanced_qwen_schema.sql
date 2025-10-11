-- 🗄️ ESQUEMA COMPLETO DE SUPABASE PARA SON1KVERSE
-- 
-- Incluye todas las tablas para análisis de audio, prompts y letras estructuradas

-- 🎵 TABLA DE ANÁLISIS DE AUDIO
CREATE TABLE IF NOT EXISTS audio_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎼 TABLA DE PROMPTS DE ARREGLO
CREATE TABLE IF NOT EXISTS arrangement_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_analysis JSONB NOT NULL,
    prompt_data JSONB NOT NULL,
    creativity_level TEXT CHECK (creativity_level IN ('conservative', 'moderate', 'creative', 'experimental')),
    target_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📝 TABLA DE LETRAS ESTRUCTURADAS
CREATE TABLE IF NOT EXISTS structured_lyrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    literary_knobs JSONB NOT NULL,
    structure_type TEXT CHECK (structure_type IN ('verse-chorus', 'verse-prechorus-chorus', 'verse-chorus-bridge', 'intro-verse-chorus-bridge', 'custom')),
    lyrics_data JSONB NOT NULL,
    style TEXT,
    genre TEXT,
    mood TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎛️ TABLA DE PROMPTS DE THE GENERATOR
CREATE TABLE IF NOT EXISTS generator_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    style TEXT,
    genre TEXT,
    mood TEXT,
    creativity_level TEXT CHECK (creativity_level IN ('conservative', 'moderate', 'creative', 'experimental')),
    prompt_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🤖 TABLA DE INTERACCIONES DE PIXEL POR HERRAMIENTA
CREATE TABLE IF NOT EXISTS pixel_tool_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool TEXT NOT NULL CHECK (tool IN ('ghost-studio', 'the-generator', 'frontend', 'nexus-visual', 'clone-station', 'nova-post', 'sanctuary')),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),
    characterization_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📊 TABLA DE ESTADÍSTICAS DE HERRAMIENTAS
CREATE TABLE IF NOT EXISTS tool_usage_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool TEXT NOT NULL CHECK (tool IN ('ghost-studio', 'the-generator', 'frontend', 'nexus-visual', 'clone-station', 'nova-post', 'sanctuary')),
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    total_time_spent INTEGER DEFAULT 0, -- en segundos
    favorite_features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool)
);

-- 🎯 TABLA DE ANÁLISIS LITERARIO
CREATE TABLE IF NOT EXISTS literary_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lyrics_id UUID REFERENCES structured_lyrics(id) ON DELETE CASCADE,
    analysis_data JSONB NOT NULL,
    complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 100),
    coherence_score INTEGER CHECK (coherence_score >= 1 AND coherence_score <= 100),
    creativity_score INTEGER CHECK (creativity_score >= 1 AND creativity_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔄 TABLA DE FLUJOS DE TRABAJO
CREATE TABLE IF NOT EXISTS workflow_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name TEXT,
    workflow_type TEXT CHECK (workflow_type IN ('audio-analysis', 'lyrics-generation', 'arrangement-creation', 'full-production')),
    steps JSONB NOT NULL,
    current_step INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📈 TABLA DE MÉTRICAS DE CREATIVIDAD
CREATE TABLE IF NOT EXISTS creativity_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool TEXT NOT NULL,
    metric_type TEXT CHECK (metric_type IN ('prompt-creativity', 'arrangement-innovation', 'lyrics-complexity', 'overall-creativity')),
    score INTEGER CHECK (score >= 1 AND score <= 100),
    context_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎨 TABLA DE PREFERENCIAS DE CARACTERIZACIÓN
CREATE TABLE IF NOT EXISTS pixel_characterization_prefs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool TEXT NOT NULL CHECK (tool IN ('ghost-studio', 'the-generator', 'frontend', 'nexus-visual', 'clone-station', 'nova-post', 'sanctuary')),
    preferred_personality JSONB,
    custom_greeting TEXT,
    favorite_suggestions JSONB,
    interaction_style TEXT CHECK (interaction_style IN ('formal', 'casual', 'technical', 'creative')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool)
);

-- 🔍 ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_audio_analysis_user_id ON audio_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_analysis_created_at ON audio_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_arrangement_prompts_user_id ON arrangement_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_structured_lyrics_user_id ON structured_lyrics(user_id);
CREATE INDEX IF NOT EXISTS idx_generator_prompts_user_id ON generator_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_pixel_tool_interactions_user_id ON pixel_tool_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pixel_tool_interactions_tool ON pixel_tool_interactions(tool);
CREATE INDEX IF NOT EXISTS idx_tool_usage_stats_user_id ON tool_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_user_id ON workflow_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_creativity_metrics_user_id ON creativity_metrics(user_id);

-- 🔒 POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE audio_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrangement_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE structured_lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE generator_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_tool_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE literary_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creativity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_characterization_prefs ENABLE ROW LEVEL SECURITY;

-- 👤 POLÍTICAS PARA USUARIOS AUTENTICADOS
CREATE POLICY "Users can view their own audio analysis" ON audio_analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio analysis" ON audio_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio analysis" ON audio_analysis
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio analysis" ON audio_analysis
    FOR DELETE USING (auth.uid() = user_id);

-- 🎼 POLÍTICAS PARA PROMPTS DE ARREGLO
CREATE POLICY "Users can view their own arrangement prompts" ON arrangement_prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own arrangement prompts" ON arrangement_prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own arrangement prompts" ON arrangement_prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own arrangement prompts" ON arrangement_prompts
    FOR DELETE USING (auth.uid() = user_id);

-- 📝 POLÍTICAS PARA LETRAS ESTRUCTURADAS
CREATE POLICY "Users can view their own structured lyrics" ON structured_lyrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own structured lyrics" ON structured_lyrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own structured lyrics" ON structured_lyrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own structured lyrics" ON structured_lyrics
    FOR DELETE USING (auth.uid() = user_id);

-- 🎛️ POLÍTICAS PARA PROMPTS DE THE GENERATOR
CREATE POLICY "Users can view their own generator prompts" ON generator_prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generator prompts" ON generator_prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generator prompts" ON generator_prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generator prompts" ON generator_prompts
    FOR DELETE USING (auth.uid() = user_id);

-- 🤖 POLÍTICAS PARA INTERACCIONES DE PIXEL
CREATE POLICY "Users can view their own pixel interactions" ON pixel_tool_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pixel interactions" ON pixel_tool_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pixel interactions" ON pixel_tool_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pixel interactions" ON pixel_tool_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- 📊 POLÍTICAS PARA ESTADÍSTICAS DE HERRAMIENTAS
CREATE POLICY "Users can view their own tool usage stats" ON tool_usage_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool usage stats" ON tool_usage_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool usage stats" ON tool_usage_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tool usage stats" ON tool_usage_stats
    FOR DELETE USING (auth.uid() = user_id);

-- 🎯 POLÍTICAS PARA ANÁLISIS LITERARIO
CREATE POLICY "Users can view their own literary analysis" ON literary_analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own literary analysis" ON literary_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own literary analysis" ON literary_analysis
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own literary analysis" ON literary_analysis
    FOR DELETE USING (auth.uid() = user_id);

-- 🔄 POLÍTICAS PARA SESIONES DE FLUJO DE TRABAJO
CREATE POLICY "Users can view their own workflow sessions" ON workflow_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow sessions" ON workflow_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow sessions" ON workflow_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow sessions" ON workflow_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- 📈 POLÍTICAS PARA MÉTRICAS DE CREATIVIDAD
CREATE POLICY "Users can view their own creativity metrics" ON creativity_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creativity metrics" ON creativity_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creativity metrics" ON creativity_metrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creativity metrics" ON creativity_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- 🎨 POLÍTICAS PARA PREFERENCIAS DE CARACTERIZACIÓN
CREATE POLICY "Users can view their own characterization prefs" ON pixel_characterization_prefs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own characterization prefs" ON pixel_characterization_prefs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characterization prefs" ON pixel_characterization_prefs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characterization prefs" ON pixel_characterization_prefs
    FOR DELETE USING (auth.uid() = user_id);

-- 🔄 FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 🎯 TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
CREATE TRIGGER update_audio_analysis_updated_at BEFORE UPDATE ON audio_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arrangement_prompts_updated_at BEFORE UPDATE ON arrangement_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_structured_lyrics_updated_at BEFORE UPDATE ON structured_lyrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generator_prompts_updated_at BEFORE UPDATE ON generator_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_usage_stats_updated_at BEFORE UPDATE ON tool_usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_sessions_updated_at BEFORE UPDATE ON workflow_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pixel_characterization_prefs_updated_at BEFORE UPDATE ON pixel_characterization_prefs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 📊 FUNCIONES DE UTILIDAD
CREATE OR REPLACE FUNCTION get_user_creativity_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    avg_score INTEGER;
BEGIN
    SELECT AVG(score)::INTEGER INTO avg_score
    FROM creativity_metrics
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tool_usage_count(user_uuid UUID, tool_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    usage_count INTEGER;
BEGIN
    SELECT usage_count INTO usage_count
    FROM tool_usage_stats
    WHERE user_id = user_uuid AND tool = tool_name;
    
    RETURN COALESCE(usage_count, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_pixel_interaction_count(user_uuid UUID, tool_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    interaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO interaction_count
    FROM pixel_tool_interactions
    WHERE user_id = user_uuid AND tool = tool_name;
    
    RETURN interaction_count;
END;
$$ LANGUAGE plpgsql;

-- 🎵 COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE audio_analysis IS 'Almacena análisis de pistas de audio con BPM, tonalidad, géneros y arreglos';
COMMENT ON TABLE arrangement_prompts IS 'Guarda prompts inteligentes para arreglos musicales';
COMMENT ON TABLE structured_lyrics IS 'Almacena letras generadas con estructura sólida';
COMMENT ON TABLE generator_prompts IS 'Guarda prompts creativos para The Generator';
COMMENT ON TABLE pixel_tool_interactions IS 'Registra interacciones de Pixel por herramienta';
COMMENT ON TABLE tool_usage_stats IS 'Estadísticas de uso de herramientas por usuario';
COMMENT ON TABLE literary_analysis IS 'Análisis literario de letras generadas';
COMMENT ON TABLE workflow_sessions IS 'Sesiones de flujo de trabajo creativo';
COMMENT ON TABLE creativity_metrics IS 'Métricas de creatividad por herramienta';
COMMENT ON TABLE pixel_characterization_prefs IS 'Preferencias de caracterización de Pixel por herramienta';
