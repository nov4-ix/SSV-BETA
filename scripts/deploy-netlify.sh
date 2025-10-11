#!/bin/bash
# 🚀 SCRIPT DE DEPLOYMENT PARA NETLIFY
# 
# Despliega las funciones de Qwen 2 en Netlify

echo "🌐 Iniciando deployment de Son1kverse en Netlify..."

# Verificar que estamos en el directorio correcto
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml no encontrado. Ejecuta desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar que Netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo "📦 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

# Verificar autenticación
echo "🔐 Verificando autenticación con Netlify..."
if ! netlify status &> /dev/null; then
    echo "🔑 Iniciando proceso de autenticación..."
    netlify login
fi

# Construir el proyecto
echo "🔨 Construyendo el proyecto..."
npm run build

# Verificar que las funciones están presentes
echo "📁 Verificando funciones de Netlify..."
if [ ! -d "netlify/functions" ]; then
    echo "❌ Error: Directorio netlify/functions no encontrado"
    exit 1
fi

# Listar funciones disponibles
echo "📋 Funciones disponibles:"
ls -la netlify/functions/

# Desplegar
echo "🚀 Desplegando a Netlify..."
netlify deploy --prod

# Verificar deployment
echo "✅ Deployment completado!"
echo "🌐 URL del sitio:"
netlify status

echo "🎉 ¡Son1kverse desplegado exitosamente en Netlify!"
echo "📝 Próximos pasos:"
echo "   1. Configurar variables de entorno en el dashboard de Netlify"
echo "   2. Configurar Supabase con el esquema de base de datos"
echo "   3. Probar las funciones de Qwen 2"
echo "   4. Integrar Pixel con el sistema de aprendizaje"
