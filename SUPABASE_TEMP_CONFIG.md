# 🗄️ CONFIGURACIÓN TEMPORAL DE SUPABASE
# 
# Proyecto temporal para testing de Son1kVerse

## 📋 INFORMACIÓN DEL PROYECTO TEMPORAL

**Project ID:** `son1kverse-temp`
**URL:** `https://son1kverse-temp.supabase.co`
**Region:** `us-east-1`

## 🔑 CLAVES API TEMPORALES

```bash
# Anon Key (pública)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbjFrdmVyc2UtdGVtcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk3MDkyMDAwLCJleHAiOjIwMTI2NjgwMDB9.temp-anon-key

# Service Role Key (privada)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbjFrdmVyc2UtdGVtcCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTcwOTIwMDAsImV4cCI6MjAxMjY2ODAwMH0.temp-service-key
```

## 🗄️ ESQUEMA DE BASE DE DATOS BÁSICO

```sql
-- Tabla de usuarios básica
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de generaciones básica
CREATE TABLE generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON generations FOR SELECT USING (true);
```

## 🔧 VARIABLES DE ENTORNO PARA NETLIFY

```bash
SUPABASE_URL=https://son1kverse-temp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbjFrdmVyc2UtdGVtcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk3MDkyMDAwLCJleHAiOjIwMTI2NjgwMDB9.temp-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbjFrdmVyc2UtdGVtcCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTcwOTIwMDAsImV4cCI6MjAxMjY2ODAwMH0.temp-service-key
```

## 🧪 COMANDOS DE PRUEBA

```bash
# Probar conexión
curl -X GET "https://son1kverse-temp.supabase.co/rest/v1/users" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbjFrdmVyc2UtdGVtcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk3MDkyMDAwLCJleHAiOjIwMTI2NjgwMDB9.temp-anon-key"

# Probar función de Netlify
curl -X POST "https://son1k.netlify.app/.netlify/functions/pixel-assistant" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola Pixel", "context": "test"}'
```

## ⚠️ NOTA IMPORTANTE
Este es un proyecto temporal para testing. Para producción, crear un proyecto real en Supabase con:
1. Contraseña segura para la base de datos
2. Claves API reales
3. Políticas RLS apropiadas
4. Buckets de storage configurados
