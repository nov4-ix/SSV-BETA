#!/bin/bash

# 🌌 SON1KVERSE - DEPLOYMENT DE SUBDOMINIOS
# 
# Script para deployar todas las herramientas en sus subdominios correspondientes

set -e

echo "🌌 Iniciando deployment de subdominios Son1kverse..."
echo "================================================"

# 📁 Verificar estructura del proyecto
echo "📁 Verificando estructura del proyecto..."
if [ ! -d "apps/web-classic" ]; then
    echo "❌ Error: No se encontró el directorio apps/web-classic"
    exit 1
fi

if [ ! -d "netlify/functions" ]; then
    echo "❌ Error: No se encontró el directorio netlify/functions"
    exit 1
fi

echo "✅ Estructura del proyecto verificada"

# 🔨 Construir proyecto web-classic
echo "🔨 Construyendo proyecto web-classic..."
cd apps/web-classic

if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json en web-classic"
    exit 1
fi

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build falló"
    exit 1
fi

echo "✅ Build completado exitosamente"

# 📦 Preparar deployment
echo "📦 Preparando deployment..."
cd ../..

# Crear directorio de deployment si no existe
mkdir -p deployment

# Copiar archivos construidos
echo "📋 Copiando archivos construidos..."
cp -r apps/web-classic/dist/* deployment/

# Copiar funciones de Netlify
echo "📋 Copiando funciones de Netlify..."
cp -r netlify/functions deployment/netlify/

# Copiar configuración de subdominios
echo "📋 Copiando configuración de subdominios..."
cp netlify-subdomains.toml deployment/netlify.toml

# Crear archivo de configuración de subdominios
echo "📋 Creando configuración de subdominios..."
cat > deployment/subdomains.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "ready_for_subdomain_deployment",
  "subdomains": {
    "main": "son1kvers3.com",
    "ghost-studio": "ghost-studio.son1kvers3.com",
    "nova-post-pilot": "nova-post-pilot.son1kvers3.com",
    "sanctuary": "sanctuary.son1kvers3.com",
    "the-generator": "the-generator.son1kvers3.com",
    "pixel": "pixel.son1kvers3.com",
    "suno": "suno.son1kvers3.com",
    "letras": "letras.son1kvers3.com",
    "prompts": "prompts.son1kvers3.com"
  },
  "tools": {
    "ghost-studio": {
      "name": "Ghost Studio",
      "description": "Análisis de audio y arreglos inteligentes",
      "icon": "🎵",
      "color": "blue"
    },
    "nova-post-pilot": {
      "name": "Nova Post Pilot",
      "description": "Marketing digital y gestión de redes sociales",
      "icon": "🚀",
      "color": "orange"
    },
    "sanctuary": {
      "name": "Sanctuary",
      "description": "Red social creativa y comunidad",
      "icon": "🛡️",
      "color": "indigo"
    },
    "the-generator": {
      "name": "The Generator",
      "description": "Letras con perillas literarias y estructura sólida",
      "icon": "🎛️",
      "color": "purple"
    },
    "pixel": {
      "name": "Pixel",
      "description": "Asistente virtual inteligente con aprendizaje adaptativo",
      "icon": "🤖",
      "color": "purple"
    },
    "suno": {
      "name": "Suno",
      "description": "Generación musical con IA",
      "icon": "🎼",
      "color": "green"
    },
    "letras": {
      "name": "Letras",
      "description": "Generación inteligente de letras",
      "icon": "📝",
      "color": "pink"
    },
    "prompts": {
      "name": "Prompts",
      "description": "Optimización inteligente de prompts",
      "icon": "🧠",
      "color": "cyan"
    }
  },
  "functions": [
    "analyze-audio.ts",
    "arrangement-prompt.ts",
    "structured-lyrics.ts",
    "generator-prompt.ts",
    "sanctuary-chat.ts",
    "nova-post-pilot.ts",
    "pixel-assistant.ts",
    "qwen-lyrics.ts",
    "qwen-smart-prompts.ts",
    "qwen-translate.ts",
    "optimize-prompt.ts"
  ],
  "deployment_instructions": {
    "netlify": {
      "steps": [
        "1. Configurar variables de entorno en Netlify Dashboard",
        "2. Conectar repositorio GitHub",
        "3. Configurar dominio principal: son1kvers3.com",
        "4. Configurar subdominios en DNS",
        "5. Deployar con netlify.toml configurado"
      ],
      "environment_variables": [
        "QWEN_API_KEY",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUNO_API_KEY",
        "SUNO_BASE_URL",
        "SUNO_POLLING_URL"
      ]
    },
    "dns_configuration": {
      "main_domain": "son1kvers3.com",
      "subdomains": [
        "ghost-studio.son1kvers3.com",
        "nova-post-pilot.son1kvers3.com",
        "sanctuary.son1kvers3.com",
        "the-generator.son1kvers3.com",
        "pixel.son1kvers3.com",
        "suno.son1kvers3.com",
        "letras.son1kvers3.com",
        "prompts.son1kvers3.com"
      ],
      "cname_records": "Todos los subdominios deben apuntar a tu sitio de Netlify"
    }
  }
}
EOF

# Mostrar estructura de deployment
echo "📊 Estructura de deployment:"
ls -la deployment/

echo ""
echo "🎉 DEPLOYMENT DE SUBDOMINIOS PREPARADO"
echo "======================================"
echo ""
echo "✅ Componentes listos:"
echo "   📁 Frontend construido: Completado"
echo "   🔧 Funciones de Netlify: $(ls deployment/netlify/functions/ | wc -l) funciones"
echo "   🌐 Configuración de subdominios: netlify.toml"
echo "   📋 Configuración JSON: subdomains.json"
echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "   1. Configurar variables de entorno en Netlify Dashboard"
echo "   2. Conectar repositorio GitHub a Netlify"
echo "   3. Configurar dominio principal: son1kvers3.com"
echo "   4. Configurar subdominios en DNS:"
echo "      - ghost-studio.son1kvers3.com"
echo "      - nova-post-pilot.son1kvers3.com"
echo "      - sanctuary.son1kvers3.com"
echo "      - the-generator.son1kvers3.com"
echo "      - pixel.son1kvers3.com"
echo "      - suno.son1kvers3.com"
echo "      - letras.son1kvers3.com"
echo "      - prompts.son1kvers3.com"
echo "   5. Deployar con: netlify deploy --dir=deployment"
echo ""
echo "🌌 Son1kverse está listo para revolucionar la creación musical!"
echo "   Cada herramienta tendrá su propio subdominio dedicado."

