/**
 * 🌐 CONFIGURACIÓN NETLIFY PARA QWEN 2
 * 
 * Configuración específica para deployment en Netlify
 * 
 * ⚠️ CONFIGURACIÓN CRÍTICA - NO MODIFICAR SIN AUTORIZACIÓN
 */

export interface NetlifyQwenConfig {
  // Netlify Functions
  functions: {
    baseURL: string;
    timeout: number;
    memory: number;
    regions: string[];
  };
  
  // Edge Functions (para baja latencia)
  edgeFunctions: {
    enabled: boolean;
    regions: string[];
    timeout: number;
  };
  
  // External API (para inferencia pesada)
  externalAPI: {
    primary: string;
    fallback: string;
    apiKey: string;
  };
  
  // Cache configuration
  cache: {
    provider: 'netlify' | 'redis' | 'memory';
    ttl: number;
    maxSize: number;
  };
  
  // Environment variables
  env: {
    QWEN_API_KEY: string;
    QWEN_MODEL: string;
    CACHE_SECRET: string;
  };
}

// 🌐 CONFIGURACIÓN NETLIFY FUNCTIONS
export const NETLIFY_FUNCTIONS_CONFIG: NetlifyQwenConfig = {
  functions: {
    baseURL: '/.netlify/functions',
    timeout: 30000, // 30 segundos
    memory: 1024, // 1GB
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1']
  },
  
  edgeFunctions: {
    enabled: true,
    regions: ['global'],
    timeout: 10000 // 10 segundos
  },
  
  externalAPI: {
    primary: 'https://api.qwen.ai/v1',
    fallback: 'https://qwen-docker.son1kverse.com',
    apiKey: process.env.QWEN_API_KEY || 'sk-qwen-netlify-xxxxxxxxxxxxxxxx'
  },
  
  cache: {
    provider: 'netlify',
    ttl: 300, // 5 minutos
    maxSize: 100 // 100MB
  },
  
  env: {
    QWEN_API_KEY: process.env.QWEN_API_KEY || 'sk-qwen-netlify-xxxxxxxxxxxxxxxx',
    QWEN_MODEL: process.env.QWEN_MODEL || 'qwen2-7b-instruct',
    CACHE_SECRET: process.env.CACHE_SECRET || 'netlify-cache-secret'
  }
};

// 🎯 ENDPOINTS DE NETLIFY FUNCTIONS
export const NETLIFY_ENDPOINTS = {
  // Optimización de prompts
  optimizePrompt: '/.netlify/functions/optimize-prompt',
  
  // Traducción
  translateText: '/.netlify/functions/translate-text',
  
  // Análisis de píxeles
  analyzePixels: '/.netlify/functions/analyze-pixels',
  
  // Generación de sugerencias
  generateSuggestions: '/.netlify/functions/generate-suggestions',
  
  // Detección de idioma
  detectLanguage: '/.netlify/functions/detect-language',
  
  // Health check
  health: '/.netlify/functions/health'
};

// 🔧 CONFIGURACIÓN DE NETLIFY.TOML
export const NETLIFY_TOML_CONFIG = `
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  QWEN_API_KEY = "sk-qwen-netlify-xxxxxxxxxxxxxxxx"
  QWEN_MODEL = "qwen2-7b-instruct"
  CACHE_SECRET = "netlify-cache-secret"

[[functions]]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[functions.optimize-prompt]
  timeout = 30

[functions.translate-text]
  timeout = 30

[functions.analyze-pixels]
  timeout = 30

[functions.generate-suggestions]
  timeout = 15

[functions.detect-language]
  timeout = 10

[functions.health]
  timeout = 5

[[edge_functions]]
  directory = "netlify/edge-functions"

[edge_functions.cache-response]
  path = "/api/cache/*"

[[redirects]]
  from = "/api/qwen/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
    Access-Control-Allow-Methods = "GET, POST, OPTIONS"
`;

// 📊 LÍMITES DE NETLIFY
export const NETLIFY_LIMITS = {
  // Functions
  functionTimeout: 30000, // 30 segundos máximo
  functionMemory: 1024, // 1GB máximo
  functionSize: 50, // 50MB máximo
  
  // Edge Functions
  edgeTimeout: 10000, // 10 segundos máximo
  edgeMemory: 128, // 128MB máximo
  
  // Requests
  requestsPerMonth: 125000, // Plan Pro
  bandwidthPerMonth: 400, // 400GB
  
  // Concurrent executions
  concurrentExecutions: 1000 // Plan Pro
};

// 🚀 CONFIGURACIÓN DE DEPLOYMENT
export const getNetlifyDeploymentConfig = () => {
  return {
    siteId: process.env.NETLIFY_SITE_ID || 'son1kverse-web-classic',
    deployHook: process.env.NETLIFY_DEPLOY_HOOK || '',
    buildCommand: 'npm run build',
    publishDirectory: 'dist',
    functionsDirectory: 'netlify/functions',
    edgeFunctionsDirectory: 'netlify/edge-functions'
  };
};

// 🧪 PROBAR CONEXIÓN CON NETLIFY
export const testNetlifyConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(NETLIFY_ENDPOINTS.health, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    return response.ok;
  } catch (error) {
    console.error('Error probando conexión con Netlify:', error);
    return false;
  }
};

// 📈 MÉTRICAS DE NETLIFY
export const getNetlifyMetrics = () => {
  return {
    functions: {
      count: Object.keys(NETLIFY_ENDPOINTS).length - 1, // Excluir health
      totalTimeout: 30000,
      totalMemory: 1024
    },
    edgeFunctions: {
      enabled: NETLIFY_FUNCTIONS_CONFIG.edgeFunctions.enabled,
      regions: NETLIFY_FUNCTIONS_CONFIG.edgeFunctions.regions
    },
    cache: {
      provider: NETLIFY_FUNCTIONS_CONFIG.cache.provider,
      ttl: NETLIFY_FUNCTIONS_CONFIG.cache.ttl
    }
  };
};

// ⚠️ ADVERTENCIA DE USO
console.warn('🌐 NETLIFY CONFIG: Configuración de Netlify inicializada');
console.warn('🎯 Functions:', Object.keys(NETLIFY_ENDPOINTS).length);
