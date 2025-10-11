#!/bin/bash
# 🗄️ SCRIPT DE CONFIGURACIÓN DE SUPABASE
# 
# Configura Supabase con el esquema de Qwen 2

echo "🗄️ Configurando Supabase para Son1kverse..."

# Verificar que Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
fi

# Verificar autenticación
echo "🔐 Verificando autenticación con Supabase..."
if ! supabase status &> /dev/null; then
    echo "🔑 Iniciando proceso de autenticación..."
    supabase login
fi

# Crear proyecto si no existe
echo "🏗️ Configurando proyecto de Supabase..."
if [ ! -f "supabase/config.toml" ]; then
    echo "📁 Inicializando proyecto de Supabase..."
    supabase init
fi

# Aplicar migraciones
echo "🔄 Aplicando esquema de base de datos..."
if [ -f "supabase/qwen-schema.sql" ]; then
    echo "📊 Ejecutando esquema de Qwen 2..."
    supabase db reset --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" < supabase/qwen-schema.sql
else
    echo "❌ Error: supabase/qwen-schema.sql no encontrado"
    exit 1
fi

# Configurar variables de entorno
echo "🔧 Configurando variables de entorno..."
supabase secrets set QWEN_API_KEY="sk-qwen-netlify-xxxxxxxxxxxxxxxx"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Generar tipos TypeScript
echo "📝 Generando tipos TypeScript..."
supabase gen types typescript --local > apps/web-classic/src/types/supabase.ts

# Verificar configuración
echo "✅ Verificando configuración..."
supabase status

echo "🎉 ¡Supabase configurado exitosamente!"
echo "📝 Próximos pasos:"
echo "   1. Configurar las variables de entorno reales"
echo "   2. Probar las funciones de Edge Functions"
echo "   3. Verificar las políticas de seguridad (RLS)"
echo "   4. Probar la integración con las funciones de Netlify"
