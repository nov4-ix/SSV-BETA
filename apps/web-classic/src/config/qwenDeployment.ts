/**
 * 🚀 CONFIGURACIÓN DE DEPLOYMENT QWEN 2
 * 
 * Configuración flexible para múltiples backends de Qwen 2
 * 
 * ⚠️ CONFIGURACIÓN CRÍTICA - NO MODIFICAR SIN AUTORIZACIÓN
 */

export type QwenBackend = 'docker' | 'serverless' | 'cloud' | 'hybrid';

export interface QwenDeploymentConfig {
  backend: QwenBackend;
  endpoints: {
    primary: string;
    fallback?: string;
    health?: string;
  };
  authentication: {
    type: 'api_key' | 'bearer' | 'none';
    credentials: string;
  };
  model: {
    name: string;
    version: string;
    size: string;
  };
  performance: {
    maxConcurrentRequests: number;
    timeout: number;
    retryAttempts: number;
  };
  storage?: {
    provider: 's3' | 'cloudflare-r2' | 'gcs';
    bucket: string;
    region: string;
  };
}

// 🐳 CONFIGURACIÓN DOCKER (Recomendada para producción)
export const DOCKER_CONFIG: QwenDeploymentConfig = {
  backend: 'docker',
  endpoints: {
    primary: 'https://qwen-api.son1kverse.com',
    health: 'https://qwen-api.son1kverse.com/health'
  },
  authentication: {
    type: 'api_key',
    credentials: 'sk-qwen-docker-xxxxxxxxxxxxxxxx'
  },
  model: {
    name: 'qwen2-7b-instruct',
    version: '1.0.0',
    size: '7B'
  },
  performance: {
    maxConcurrentRequests: 10,
    timeout: 30000,
    retryAttempts: 3
  }
};

// ☁️ CONFIGURACIÓN SERVERLESS (Para desarrollo/testing)
export const SERVERLESS_CONFIG: QwenDeploymentConfig = {
  backend: 'serverless',
  endpoints: {
    primary: 'https://qwen-inference.son1kverse.workers.dev',
    fallback: 'https://api.qwen.ai/v1',
    health: 'https://qwen-inference.son1kverse.workers.dev/health'
  },
  authentication: {
    type: 'bearer',
    credentials: 'Bearer sk-qwen-serverless-xxxxxxxxxxxxxxxx'
  },
  model: {
    name: 'qwen2-1.5b-instruct',
    version: '1.0.0',
    size: '1.5B'
  },
  performance: {
    maxConcurrentRequests: 5,
    timeout: 60000,
    retryAttempts: 2
  },
  storage: {
    provider: 'cloudflare-r2',
    bucket: 'son1kverse-models',
    region: 'auto'
  }
};

// 🌐 CONFIGURACIÓN CLOUD (API pública)
export const CLOUD_CONFIG: QwenDeploymentConfig = {
  backend: 'cloud',
  endpoints: {
    primary: 'https://api.qwen.ai/v1',
    health: 'https://api.qwen.ai/v1/health'
  },
  authentication: {
    type: 'api_key',
    credentials: 'sk-qwen-cloud-xxxxxxxxxxxxxxxx'
  },
  model: {
    name: 'qwen2-7b-instruct',
    version: 'latest',
    size: '7B'
  },
  performance: {
    maxConcurrentRequests: 3,
    timeout: 45000,
    retryAttempts: 2
  }
};

// 🔄 CONFIGURACIÓN HÍBRIDA (Mejor de ambos mundos)
export const HYBRID_CONFIG: QwenDeploymentConfig = {
  backend: 'hybrid',
  endpoints: {
    primary: 'https://qwen-api.son1kverse.com',
    fallback: 'https://api.qwen.ai/v1',
    health: 'https://qwen-api.son1kverse.com/health'
  },
  authentication: {
    type: 'api_key',
    credentials: 'sk-qwen-hybrid-xxxxxxxxxxxxxxxx'
  },
  model: {
    name: 'qwen2-7b-instruct',
    version: '1.0.0',
    size: '7B'
  },
  performance: {
    maxConcurrentRequests: 15,
    timeout: 30000,
    retryAttempts: 3
  },
  storage: {
    provider: 'cloudflare-r2',
    bucket: 'son1kverse-models',
    region: 'auto'
  }
};

// 🎯 CONFIGURACIÓN ACTIVA (Cambiar según el entorno)
export const getActiveConfig = (): QwenDeploymentConfig => {
  const env = process.env.NODE_ENV || 'development';
  const backend = (process.env.QWEN_BACKEND as QwenBackend) || 'hybrid';

  switch (backend) {
    case 'docker':
      return DOCKER_CONFIG;
    case 'serverless':
      return SERVERLESS_CONFIG;
    case 'cloud':
      return CLOUD_CONFIG;
    case 'hybrid':
    default:
      return HYBRID_CONFIG;
  }
};

// 🔧 CONFIGURACIÓN DINÁMICA
export const updateDeploymentConfig = (updates: Partial<QwenDeploymentConfig>): void => {
  const config = getActiveConfig();
  Object.assign(config, updates);
  console.log('✅ Configuración de deployment actualizada');
};

// 📊 ESTADO DEL DEPLOYMENT
export const getDeploymentStatus = () => {
  const config = getActiveConfig();
  
  return {
    backend: config.backend,
    model: config.model.name,
    endpoints: Object.keys(config.endpoints).length,
    hasFallback: !!config.endpoints.fallback,
    hasStorage: !!config.storage,
    maxConcurrentRequests: config.performance.maxConcurrentRequests,
    timeout: config.performance.timeout
  };
};

// 🧪 PROBAR CONEXIÓN
export const testDeploymentConnection = async (): Promise<boolean> => {
  const config = getActiveConfig();
  
  try {
    const response = await fetch(config.endpoints.health || config.endpoints.primary, {
      method: 'GET',
      headers: {
        'Authorization': config.authentication.credentials,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(config.performance.timeout)
    });

    return response.ok;
  } catch (error) {
    console.error('Error probando conexión:', error);
    return false;
  }
};

// ⚠️ ADVERTENCIA DE USO
console.warn('🚀 QWEN DEPLOYMENT: Configuración de deployment inicializada');
console.warn('🎯 Backend activo:', getActiveConfig().backend);
