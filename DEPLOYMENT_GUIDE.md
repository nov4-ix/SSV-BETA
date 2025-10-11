# 🚀 GUÍA DE DEPLOYMENT PARA SON1KVERSE
# 
# Instrucciones completas para desplegar Son1kverse en Netlify

## 📋 RESUMEN DEL DEPLOYMENT

✅ **Componentes listos:**
- 📁 Funciones de Netlify: 5 funciones
- 🔨 Build del proyecto: Completado
- 📦 Carpeta de deployment: Creada

## 🎯 FUNCIONES IMPLEMENTADAS

### 1. **optimize-prompt.ts**
- **Propósito**: Optimiza prompts musicales con Qwen 2
- **Endpoint**: `/.netlify/functions/optimize-prompt`
- **Método**: POST
- **Input**: `{ prompt: string, context: string }`
- **Output**: `{ optimizedPrompt: string, improvements: string[] }`

### 2. **pixel-assistant.ts**
- **Propósito**: Asistente virtual Pixel con personalidad profunda
- **Endpoint**: `/.netlify/functions/pixel-assistant`
- **Método**: POST
- **Input**: `{ message: string, context: string, userId?: string }`
- **Output**: `{ response: string, personality: object, suggestions: string[] }`

### 3. **qwen-lyrics.ts**
- **Propósito**: Genera letras con coherencia narrativa
- **Endpoint**: `/.netlify/functions/qwen-lyrics`
- **Método**: POST
- **Input**: `{ prompt: string, style: string, genre: string, mood: string }`
- **Output**: `{ lyrics: string, structure: object, metadata: object }`

### 4. **qwen-smart-prompts.ts**
- **Propósito**: Genera prompts inteligentes para música
- **Endpoint**: `/.netlify/functions/qwen-smart-prompts`
- **Método**: POST
- **Input**: `{ originalPrompt: string, context: string }`
- **Output**: `{ enhancedPrompt: string, improvements: string[] }`

### 5. **qwen-translate.ts**
- **Propósito**: Traduce texto español-inglés para Suno
- **Endpoint**: `/.netlify/functions/qwen-translate`
- **Método**: POST
- **Input**: `{ text: string, sourceLanguage: string, targetLanguage: string }`
- **Output**: `{ translatedText: string, confidence: number }`

## 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

### Variables requeridas en Netlify:

```bash
# 🔑 API KEYS
QWEN_API_KEY=sk-qwen-netlify-xxxxxxxxxxxxxxxx
QWEN_MODEL=qwen2-7b-instruct

# 🗄️ SUPABASE
SUPABASE_URL=https://son1kverse.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 🎵 SUNO (para integración)
SUNO_API_KEY=Bearer REEMPLAZA_AQUI_TU_TOKEN
SUNO_BASE_URL=https://ai.imgkits.com/suno
SUNO_POLLING_URL=https://usa.imgkits.com/node-api/suno

# 🔧 CONFIGURACIÓN
CACHE_SECRET=netlify-cache-secret
NODE_ENV=production

# 📊 LÍMITES
MAX_REQUEST_SIZE=10485760
REQUEST_TIMEOUT=30000
CACHE_TTL=300
```

## 🚀 PASOS DE DEPLOYMENT

### Opción 1: Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Autenticarse
netlify login

# Desplegar
netlify deploy --dir=deployment --prod
```

### Opción 2: Netlify Dashboard
1. Ir a [netlify.com](https://netlify.com)
2. Crear nuevo sitio
3. Arrastrar la carpeta `deployment` al área de deployment
4. Configurar variables de entorno en Site Settings > Environment Variables
5. Desplegar

### Opción 3: Git Integration
1. Conectar repositorio Git
2. Configurar build settings:
   - Build command: `npm run build`
   - Publish directory: `deployment`
3. Configurar variables de entorno
4. Desplegar

## 🧪 PRUEBAS DE FUNCIONES

### 1. Probar Pixel Assistant
```bash
curl -X POST https://tu-sitio.netlify.app/.netlify/functions/pixel-assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola Pixel, háblame sobre el creador de Son1kverse", "context": "general"}'
```

### 2. Probar Generación de Letras
```bash
curl -X POST https://tu-sitio.netlify.app/.netlify/functions/qwen-lyrics \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Una canción sobre la resistencia", "style": "rock", "genre": "alternative", "mood": "rebellious"}'
```

### 3. Probar Traducción
```bash
curl -X POST https://tu-sitio.netlify.app/.netlify/functions/qwen-translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Una canción sobre la resistencia", "sourceLanguage": "es", "targetLanguage": "en"}'
```

### 4. Probar Prompts Inteligentes
```bash
curl -X POST https://tu-sitio.netlify.app/.netlify/functions/qwen-smart-prompts \
  -H "Content-Type: application/json" \
  -d '{"originalPrompt": "música triste", "context": "music"}'
```

## 🔍 MONITOREO Y DEBUGGING

### Logs de Netlify
- Ir a Site Settings > Functions
- Ver logs en tiempo real
- Monitorear errores y rendimiento

### Métricas importantes
- Tiempo de respuesta de funciones
- Uso de memoria
- Errores por función
- Límites de rate limiting

## 🎯 INTEGRACIÓN CON FRONTEND

### Configuración en el frontend
```typescript
// apps/web-classic/src/config/qwenFrontendConfig.ts
export const QWEN_ENDPOINTS = {
  baseUrl: '/.netlify/functions',
  lyrics: '/.netlify/functions/qwen-lyrics',
  translate: '/.netlify/functions/qwen-translate',
  pixel: '/.netlify/functions/pixel-assistant',
  smartPrompts: '/.netlify/functions/qwen-smart-prompts',
  optimizePrompt: '/.netlify/functions/optimize-prompt'
};
```

### Uso en componentes
```typescript
import { qwenService } from '../services/qwenService';

// Generar letras
const lyrics = await qwenService.generateLyrics({
  prompt: "Una canción sobre la resistencia",
  style: "rock",
  genre: "alternative",
  mood: "rebellious",
  language: "es",
  length: "medium"
});

// Interactuar con Pixel
const pixelResponse = await qwenService.interactWithPixel({
  message: "Hola Pixel",
  context: "general"
});
```

## 🎉 RESULTADO FINAL

Una vez desplegado, tendrás:

✅ **Sistema completo de IA** con Qwen 2
✅ **Pixel Assistant** con personalidad profunda
✅ **Generación de letras** con coherencia narrativa
✅ **Traducción automática** para Suno
✅ **Prompts inteligentes** para música
✅ **Sistema de aprendizaje** personalizado
✅ **Integración completa** con Son1kverse

## 🌌 PRÓXIMOS PASOS

1. **Configurar Supabase** con el esquema de base de datos
2. **Probar todas las funciones** con datos reales
3. **Integrar con Suno** para el flujo completo
4. **Optimizar rendimiento** según uso real
5. **Implementar analytics** y monitoreo

¡Son1kverse está listo para revolucionar la creación musical! 🎵
