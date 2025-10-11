/**
 * 🌐 CONFIGURACIÓN DEL FRONTEND PARA QWEN 2
 * 
 * Configuración para integrar el frontend con las funciones de Netlify
 */

// 🎯 CONFIGURACIÓN DE ENDPOINTS
export const QWEN_ENDPOINTS = {
  // Funciones de Netlify
  baseUrl: '/.netlify/functions',
  
  // Endpoints específicos
  lyrics: '/.netlify/functions/qwen-lyrics',
  translate: '/.netlify/functions/qwen-translate',
  pixel: '/.netlify/functions/pixel-assistant',
  smartPrompts: '/.netlify/functions/qwen-smart-prompts',
  optimizePrompt: '/.netlify/functions/optimize-prompt',
  
  // Endpoints de desarrollo (fallback)
  devBaseUrl: 'http://localhost:8888/.netlify/functions',
  devLyrics: 'http://localhost:8888/.netlify/functions/qwen-lyrics',
  devTranslate: 'http://localhost:8888/.netlify/functions/qwen-translate',
  devPixel: 'http://localhost:8888/.netlify/functions/pixel-assistant',
  devSmartPrompts: 'http://localhost:8888/.netlify/functions/qwen-smart-prompts',
  devOptimizePrompt: 'http://localhost:8888/.netlify/functions/optimize-prompt'
};

// 🔧 CONFIGURACIÓN DE DESARROLLO
export const DEV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  useLocalFunctions: process.env.VITE_USE_LOCAL_FUNCTIONS === 'true',
  netlifyDevPort: 8888
};

// 🎯 FUNCIÓN PARA OBTENER URL BASE
export function getBaseUrl(): string {
  if (DEV_CONFIG.isDevelopment && DEV_CONFIG.useLocalFunctions) {
    return QWEN_ENDPOINTS.devBaseUrl;
  }
  return QWEN_ENDPOINTS.baseUrl;
}

// 🎯 FUNCIÓN PARA OBTENER ENDPOINT COMPLETO
export function getEndpoint(functionName: keyof typeof QWEN_ENDPOINTS): string {
  if (DEV_CONFIG.isDevelopment && DEV_CONFIG.useLocalFunctions) {
    const devKey = `dev${functionName.charAt(0).toUpperCase()}${functionName.slice(1)}` as keyof typeof QWEN_ENDPOINTS;
    return QWEN_ENDPOINTS[devKey] || QWEN_ENDPOINTS[functionName];
  }
  return QWEN_ENDPOINTS[functionName];
}

// 🔧 CONFIGURACIÓN DE TIMEOUTS
export const TIMEOUT_CONFIG = {
  default: 30000, // 30 segundos
  lyrics: 45000,  // 45 segundos (generación de letras puede tardar más)
  translate: 15000, // 15 segundos
  pixel: 20000,   // 20 segundos
  smartPrompts: 25000, // 25 segundos
  optimizePrompt: 20000 // 20 segundos
};

// 🔄 CONFIGURACIÓN DE REINTENTOS
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
  backoffMultiplier: 2
};

// 📊 CONFIGURACIÓN DE CACHE
export const CACHE_CONFIG = {
  enabled: true,
  defaultTTL: 300000, // 5 minutos
  maxSize: 100, // 100 entradas
  lyricsTTL: 600000, // 10 minutos
  translateTTL: 1800000, // 30 minutos
  pixelTTL: 60000, // 1 minuto
  smartPromptsTTL: 900000 // 15 minutos
};

// 🎯 CONFIGURACIÓN DE ERRORES
export const ERROR_CONFIG = {
  showUserFriendlyErrors: true,
  logErrorsToConsole: true,
  fallbackMessages: {
    network: 'Error de conexión. Verifica tu internet.',
    timeout: 'La operación tardó demasiado. Inténtalo de nuevo.',
    server: 'Error del servidor. Inténtalo más tarde.',
    unknown: 'Error inesperado. Inténtalo de nuevo.'
  }
};

// 🎵 CONFIGURACIÓN ESPECÍFICA DE SON1KVERSE
export const SON1KVERSE_CONFIG = {
  appName: 'Son1kverse',
  version: '1.0.0',
  pixelPersonality: {
    name: 'Pixel',
    role: 'Asistente virtual y compañero',
    creator: 'José Jaimes (NOV4-IX)',
    philosophy: 'Lo imperfecto también es sagrado'
  },
  features: {
    smartPrompts: true,
    lyricsGeneration: true,
    translation: true,
    pixelLearning: true,
    sunoIntegration: true
  }
};

// 🎯 CONFIGURACIÓN COMPLETA
export const QWEN_CONFIG = {
  endpoints: QWEN_ENDPOINTS,
  dev: DEV_CONFIG,
  timeouts: TIMEOUT_CONFIG,
  retry: RETRY_CONFIG,
  cache: CACHE_CONFIG,
  errors: ERROR_CONFIG,
  son1kverse: SON1KVERSE_CONFIG
};

export default QWEN_CONFIG;
