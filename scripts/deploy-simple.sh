#!/bin/bash
# 🚀 SCRIPT DE DEPLOYMENT SIMPLIFICADO PARA SON1KVERSE
# 
# Despliega las funciones de Qwen 2 en Netlify

echo "🌌 Iniciando deployment de Son1kverse..."
echo "========================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml no encontrado. Ejecuta desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar que las funciones están presentes
echo "📁 Verificando funciones de Netlify..."
if [ ! -d "netlify/functions" ]; then
    echo "❌ Error: Directorio netlify/functions no encontrado"
    exit 1
fi

echo "✅ Funciones encontradas:"
ls -la netlify/functions/

# Construir el proyecto web-classic
echo ""
echo "🔨 Construyendo proyecto web-classic..."
cd apps/web-classic
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la construcción del proyecto web-classic"
    exit 1
fi

cd ../..

# Verificar que el build fue exitoso
if [ ! -d "apps/web-classic/dist" ]; then
    echo "❌ Error: Directorio dist no encontrado después del build"
    exit 1
fi

echo "✅ Build completado exitosamente"

# Crear directorio de deployment
echo ""
echo "📦 Preparando para deployment..."
mkdir -p deployment
cp -r apps/web-classic/dist/* deployment/
cp -r netlify deployment/

# Verificar estructura de deployment
echo "📋 Estructura de deployment:"
ls -la deployment/

# Crear archivo de estado
echo "📊 Creando archivo de estado..."
cat > deployment-status.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "ready_for_deployment",
  "components": {
    "netlify_functions": "ready",
    "frontend_build": "ready",
    "deployment_folder": "ready"
  },
  "functions": [
    "optimize-prompt.ts",
    "pixel-assistant.ts", 
    "qwen-lyrics.ts",
    "qwen-smart-prompts.ts",
    "qwen-translate.ts"
  ],
  "next_steps": [
    "Configure environment variables in Netlify dashboard",
    "Deploy to Netlify",
    "Test Qwen 2 functions",
    "Test Pixel learning system"
  ]
}
EOF

echo "✅ Estado guardado en deployment-status.json"

# Mostrar resumen
echo ""
echo "🎉 DEPLOYMENT PREPARADO"
echo "========================"
echo ""
echo "✅ Componentes listos:"
echo "   📁 Funciones de Netlify: $(ls netlify/functions/ | wc -l) funciones"
echo "   🔨 Build del proyecto: Completado"
echo "   📦 Carpeta de deployment: Creada"
echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "   1. Configurar variables de entorno en Netlify:"
echo "      - QWEN_API_KEY=tu_api_key_real"
echo "      - SUPABASE_URL=tu_url_supabase"
echo "      - SUPABASE_SERVICE_ROLE_KEY=tu_service_key"
echo "      - SUNO_API_KEY=tu_suno_token"
echo ""
echo "   2. Desplegar a Netlify:"
echo "      - Subir la carpeta 'deployment' a Netlify"
echo "      - O usar: netlify deploy --dir=deployment"
echo ""
echo "   3. Probar las funciones:"
echo "      - Probar funciones de Qwen 2"
echo "      - Probar Pixel learning system"
echo "      - Probar generación de letras"
echo "      - Probar traducción automática"
echo ""
echo "🌌 Son1kverse está listo para revolucionar la creación musical!"
