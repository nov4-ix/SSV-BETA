# 🗄️ CONFIGURACIÓN SUPABASE PARA SON1KVERSE
# 
# Instrucciones para configurar Supabase en la nube

## 📋 PASOS PARA CONFIGURAR SUPABASE

### 1. Crear Proyecto en Supabase Cloud
1. Ir a https://supabase.com/
2. Crear cuenta o iniciar sesión
3. Crear nuevo proyecto:
   - Nombre: `son1kverse`
   - Región: `us-east-1`
   - Contraseña: `son1kverse2024!`
4. Anotar:
   - Project URL: `https://[project-id].supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Configurar Base de Datos
Ejecutar las migraciones SQL en el SQL Editor de Supabase:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'FREE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de generaciones musicales
CREATE TABLE generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  prompt TEXT NOT NULL,
  style TEXT,
  genre TEXT,
  key TEXT,
  instruments TEXT[],
  status TEXT DEFAULT 'PENDING',
  audio_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pistas
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  bpm INTEGER,
  key TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'COMPLETED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de colaboraciones
CREATE TABLE collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES tracks(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de análisis de audio
CREATE TABLE audio_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES tracks(id),
  bpm INTEGER,
  key TEXT,
  genre TEXT,
  mood TEXT,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own generations" ON generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tracks" ON tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tracks" ON tracks FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. Configurar Storage Buckets
En Supabase Dashboard > Storage:
1. Crear bucket `generated-audio` (público)
2. Crear bucket `user-uploads` (privado)
3. Crear bucket `ai-cache` (privado)

### 4. Variables de Entorno para Netlify
```bash
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Probar Conexión
```bash
curl -X GET "https://[project-id].supabase.co/rest/v1/users" \
  -H "apikey: [anon-key]" \
  -H "Authorization: Bearer [anon-key]"
```

## 🎯 RESULTADO ESPERADO
- Base de datos PostgreSQL funcionando
- RLS habilitado y configurado
- Storage buckets creados
- Variables de entorno configuradas en Netlify
- Funciones de Netlify conectadas a Supabase
