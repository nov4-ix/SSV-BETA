-- 🛡️ ESQUEMA DEL SANCTUARIO - RED SOCIAL RESPETUOSA
-- 
-- Sistema de chat, colaboraciones y top tracks con moderación automática

-- 💬 TABLA DE MENSAJES DEL SANCTUARIO
CREATE TABLE IF NOT EXISTS sanctuary_messages (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'track_share', 'collaboration_request', 'system')) NOT NULL,
    track_data JSONB,
    collaboration_data JSONB,
    reactions JSONB DEFAULT '{"likes": 0, "shares": 0, "comments": 0}',
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🏆 TABLA DE TOP TRACKS
CREATE TABLE IF NOT EXISTS sanctuary_top_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    track_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT NOT NULL,
    mood TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    total_reactions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    rank_position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🤝 TABLA DE COLABORACIONES
CREATE TABLE IF NOT EXISTS sanctuary_collaborations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    requester_username TEXT NOT NULL,
    collaboration_type TEXT CHECK (collaboration_type IN ('vocalist', 'producer', 'lyricist', 'mixer', 'general')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    timeline TEXT NOT NULL,
    status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    participants JSONB DEFAULT '[]',
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👥 TABLA DE PARTICIPANTES EN COLABORACIONES
CREATE TABLE IF NOT EXISTS sanctuary_collaboration_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collaboration_id UUID REFERENCES sanctuary_collaborations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    role TEXT CHECK (role IN ('requester', 'participant', 'moderator')) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'active', 'completed')) DEFAULT 'pending',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 📊 TABLA DE ESTADÍSTICAS DEL SANCTUARIO
CREATE TABLE IF NOT EXISTS sanctuary_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_messages INTEGER DEFAULT 0,
    total_tracks_shared INTEGER DEFAULT 0,
    total_collaborations_requested INTEGER DEFAULT 0,
    total_collaborations_participated INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    total_shares_received INTEGER DEFAULT 0,
    total_comments_received INTEGER DEFAULT 0,
    community_score INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 🛡️ TABLA DE MODERACIÓN
CREATE TABLE IF NOT EXISTS sanctuary_moderation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT REFERENCES sanctuary_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    moderation_type TEXT CHECK (moderation_type IN ('automatic', 'manual', 'appeal')) NOT NULL,
    reason TEXT NOT NULL,
    action_taken TEXT CHECK (action_taken IN ('warning', 'message_hidden', 'user_warned', 'user_suspended', 'user_banned')) NOT NULL,
    moderator_id UUID REFERENCES auth.users(id),
    moderator_username TEXT,
    appeal_status TEXT CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🎵 TABLA DE TRACKS COMPARTIDOS
CREATE TABLE IF NOT EXISTS sanctuary_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT NOT NULL,
    mood TEXT NOT NULL,
    duration INTEGER,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    total_reactions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    plays INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 TABLA DE COMENTARIOS EN TRACKS
CREATE TABLE IF NOT EXISTS sanctuary_track_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    track_id UUID REFERENCES sanctuary_tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    comment TEXT NOT NULL,
    parent_comment_id UUID REFERENCES sanctuary_track_comments(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔔 TABLA DE NOTIFICACIONES
CREATE TABLE IF NOT EXISTS sanctuary_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('message', 'collaboration_request', 'track_like', 'track_share', 'track_comment', 'collaboration_update', 'moderation')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🏅 TABLA DE LOGROS DEL SANCTUARIO
CREATE TABLE IF NOT EXISTS sanctuary_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type TEXT CHECK (achievement_type IN ('first_track', 'collaboration_master', 'community_helper', 'top_contributor', 'respectful_member')) NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔍 ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_sanctuary_messages_user_id ON sanctuary_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sanctuary_messages_type ON sanctuary_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_sanctuary_messages_created_at ON sanctuary_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sanctuary_messages_moderated ON sanctuary_messages(is_moderated);

CREATE INDEX IF NOT EXISTS idx_sanctuary_top_tracks_week ON sanctuary_top_tracks(week_start, week_end);
CREATE INDEX IF NOT EXISTS idx_sanctuary_top_tracks_rank ON sanctuary_top_tracks(rank_position);
CREATE INDEX IF NOT EXISTS idx_sanctuary_top_tracks_reactions ON sanctuary_top_tracks(total_reactions);

CREATE INDEX IF NOT EXISTS idx_sanctuary_collaborations_requester ON sanctuary_collaborations(requester_id);
CREATE INDEX IF NOT EXISTS idx_sanctuary_collaborations_status ON sanctuary_collaborations(status);
CREATE INDEX IF NOT EXISTS idx_sanctuary_collaborations_type ON sanctuary_collaborations(collaboration_type);

CREATE INDEX IF NOT EXISTS idx_sanctuary_tracks_user_id ON sanctuary_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_sanctuary_tracks_genre ON sanctuary_tracks(genre);
CREATE INDEX IF NOT EXISTS idx_sanctuary_tracks_mood ON sanctuary_tracks(mood);
CREATE INDEX IF NOT EXISTS idx_sanctuary_tracks_featured ON sanctuary_tracks(is_featured);
CREATE INDEX IF NOT EXISTS idx_sanctuary_tracks_reactions ON sanctuary_tracks(total_reactions);

CREATE INDEX IF NOT EXISTS idx_sanctuary_notifications_user_id ON sanctuary_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_sanctuary_notifications_read ON sanctuary_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_sanctuary_notifications_type ON sanctuary_notifications(notification_type);

-- 🔒 POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE sanctuary_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_top_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_track_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctuary_achievements ENABLE ROW LEVEL SECURITY;

-- 👤 POLÍTICAS PARA MENSAJES DEL SANCTUARIO
CREATE POLICY "Users can view sanctuary messages" ON sanctuary_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own sanctuary messages" ON sanctuary_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sanctuary messages" ON sanctuary_messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sanctuary messages" ON sanctuary_messages
    FOR DELETE USING (auth.uid() = user_id);

-- 🏆 POLÍTICAS PARA TOP TRACKS
CREATE POLICY "Users can view top tracks" ON sanctuary_top_tracks
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage top tracks" ON sanctuary_top_tracks
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 🤝 POLÍTICAS PARA COLABORACIONES
CREATE POLICY "Users can view collaborations" ON sanctuary_collaborations
    FOR SELECT USING (true);

CREATE POLICY "Users can create collaborations" ON sanctuary_collaborations
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own collaborations" ON sanctuary_collaborations
    FOR UPDATE USING (auth.uid() = requester_id);

CREATE POLICY "Users can delete their own collaborations" ON sanctuary_collaborations
    FOR DELETE USING (auth.uid() = requester_id);

-- 👥 POLÍTICAS PARA PARTICIPANTES
CREATE POLICY "Users can view collaboration participants" ON sanctuary_collaboration_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join collaborations" ON sanctuary_collaboration_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON sanctuary_collaboration_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- 📊 POLÍTICAS PARA ESTADÍSTICAS
CREATE POLICY "Users can view their own stats" ON sanctuary_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON sanctuary_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON sanctuary_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 🛡️ POLÍTICAS PARA MODERACIÓN
CREATE POLICY "Users can view moderation for their messages" ON sanctuary_moderation
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Moderators can manage moderation" ON sanctuary_moderation
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- 🎵 POLÍTICAS PARA TRACKS
CREATE POLICY "Users can view sanctuary tracks" ON sanctuary_tracks
    FOR SELECT USING (true);

CREATE POLICY "Users can create sanctuary tracks" ON sanctuary_tracks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sanctuary tracks" ON sanctuary_tracks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sanctuary tracks" ON sanctuary_tracks
    FOR DELETE USING (auth.uid() = user_id);

-- 💬 POLÍTICAS PARA COMENTARIOS
CREATE POLICY "Users can view track comments" ON sanctuary_track_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create track comments" ON sanctuary_track_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own track comments" ON sanctuary_track_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own track comments" ON sanctuary_track_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 🔔 POLÍTICAS PARA NOTIFICACIONES
CREATE POLICY "Users can view their own notifications" ON sanctuary_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON sanctuary_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON sanctuary_notifications
    FOR INSERT WITH CHECK (true);

-- 🏅 POLÍTICAS PARA LOGROS
CREATE POLICY "Users can view their own achievements" ON sanctuary_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" ON sanctuary_achievements
    FOR INSERT WITH CHECK (true);

-- 🔄 FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA
CREATE OR REPLACE FUNCTION update_sanctuary_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 🎯 TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
CREATE TRIGGER update_sanctuary_messages_updated_at BEFORE UPDATE ON sanctuary_messages
    FOR EACH ROW EXECUTE FUNCTION update_sanctuary_updated_at_column();

CREATE TRIGGER update_sanctuary_top_tracks_updated_at BEFORE UPDATE ON sanctuary_top_tracks
    FOR EACH ROW EXECUTE FUNCTION update_sanctuary_updated_at_column();

CREATE TRIGGER update_sanctuary_collaborations_updated_at BEFORE UPDATE ON sanctuary_collaborations
    FOR EACH ROW EXECUTE FUNCTION update_sanctuary_updated_at_column();

CREATE TRIGGER update_sanctuary_stats_updated_at BEFORE UPDATE ON sanctuary_stats
    FOR EACH ROW EXECUTE FUNCTION update_sanctuary_updated_at_column();

CREATE TRIGGER update_sanctuary_tracks_updated_at BEFORE UPDATE ON sanctuary_tracks
    FOR EACH ROW EXECUTE FUNCTION update_sanctuary_updated_at_column();

CREATE TRIGGER update_sanctuary_track_comments_updated_at BEFORE UPDATE ON sanctuary_track_comments
    FOR EACH ROW EXECUTE FUNCTION update_sanctuary_updated_at_column();

-- 📊 FUNCIONES DE UTILIDAD DEL SANCTUARIO
CREATE OR REPLACE FUNCTION get_user_sanctuary_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_messages', COALESCE(total_messages, 0),
        'total_tracks_shared', COALESCE(total_tracks_shared, 0),
        'total_collaborations_requested', COALESCE(total_collaborations_requested, 0),
        'total_collaborations_participated', COALESCE(total_collaborations_participated, 0),
        'total_likes_received', COALESCE(total_likes_received, 0),
        'total_shares_received', COALESCE(total_shares_received, 0),
        'total_comments_received', COALESCE(total_comments_received, 0),
        'community_score', COALESCE(community_score, 0)
    ) INTO stats
    FROM sanctuary_stats
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(stats, '{"total_messages": 0, "total_tracks_shared": 0, "total_collaborations_requested": 0, "total_collaborations_participated": 0, "total_likes_received": 0, "total_shares_received": 0, "total_comments_received": 0, "community_score": 0}'::json);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_top_tracks_this_week()
RETURNS TABLE (
    track_id TEXT,
    title TEXT,
    artist TEXT,
    genre TEXT,
    mood TEXT,
    audio_url TEXT,
    cover_url TEXT,
    total_reactions INTEGER,
    likes INTEGER,
    shares INTEGER,
    comments INTEGER,
    rank_position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.track_id,
        st.title,
        st.artist,
        st.genre,
        st.mood,
        st.audio_url,
        st.cover_url,
        st.total_reactions,
        st.likes,
        st.shares,
        st.comments,
        st.rank_position
    FROM sanctuary_top_tracks st
    WHERE st.week_start <= CURRENT_DATE 
    AND st.week_end >= CURRENT_DATE
    ORDER BY st.rank_position ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_track_reactions(track_uuid UUID, reaction_type TEXT)
RETURNS VOID AS $$
BEGIN
    IF reaction_type = 'like' THEN
        UPDATE sanctuary_tracks 
        SET likes = likes + 1, total_reactions = total_reactions + 1
        WHERE id = track_uuid;
    ELSIF reaction_type = 'share' THEN
        UPDATE sanctuary_tracks 
        SET shares = shares + 1, total_reactions = total_reactions + 1
        WHERE id = track_uuid;
    ELSIF reaction_type = 'comment' THEN
        UPDATE sanctuary_tracks 
        SET comments = comments + 1, total_reactions = total_reactions + 1
        WHERE id = track_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 🎵 COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE sanctuary_messages IS 'Mensajes del chat del Santuario con moderación automática';
COMMENT ON TABLE sanctuary_top_tracks IS 'Top 10 tracks de la semana basado en reacciones';
COMMENT ON TABLE sanctuary_collaborations IS 'Solicitudes de colaboración entre usuarios';
COMMENT ON TABLE sanctuary_collaboration_participants IS 'Participantes en colaboraciones';
COMMENT ON TABLE sanctuary_stats IS 'Estadísticas de participación en el Santuario';
COMMENT ON TABLE sanctuary_moderation IS 'Registro de moderación y acciones tomadas';
COMMENT ON TABLE sanctuary_tracks IS 'Tracks compartidos en el Santuario';
COMMENT ON TABLE sanctuary_track_comments IS 'Comentarios en tracks compartidos';
COMMENT ON TABLE sanctuary_notifications IS 'Notificaciones del Santuario';
COMMENT ON TABLE sanctuary_achievements IS 'Logros y reconocimientos del Santuario';
