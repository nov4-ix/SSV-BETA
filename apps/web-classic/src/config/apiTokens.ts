/**
 * ⚠️ CONFIGURACIÓN CRÍTICA DE IA MUSICAL
 * 
 * NO MODIFICAR SIN LEER SUNO_INTEGRATION_DOCS.md
 * 
 * Esta configuración es el corazón de la integración con el motor de IA musical
 * a través de la extensión de Chrome.
 */

export interface SunoConfig {
  BASE_URL: string;
  POLLING_URL: string;
  AUTH_TOKEN: string;
  HEADERS: Record<string, string>;
}

// ⚠️ CONFIGURACIÓN PRINCIPAL - NO CAMBIAR ESTRUCTURA
export const SUNO_CONFIG: SunoConfig = {
  // Endpoints críticos - NO MODIFICAR
  BASE_URL: 'https://ai.imgkits.com/suno',
  POLLING_URL: 'https://usa.imgkits.com/node-api/suno',
  
  // Token de autenticación - ACTUALIZAR SOLO EL VALOR
  AUTH_TOKEN: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // ⚠️ ACTUALIZAR ESTE TOKEN
  
  // Headers OBLIGATORIOS - NO MODIFICAR ESTRUCTURA
  HEADERS: {
    'Content-Type': 'application/json',
    'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // ⚠️ ACTUALIZAR ESTE TOKEN
    'channel': 'node-api',              // ⚠️ REQUERIDO - NO CAMBIAR
    'origin': 'https://www.livepolls.app',     // ⚠️ REQUERIDO - NO CAMBIAR
    'referer': 'https://www.livepolls.app/'    // ⚠️ REQUERIDO - NO CAMBIAR
  }
};

// ⚠️ VALIDACIÓN DE CONFIGURACIÓN
export const validateSunoConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Verificar que todos los campos requeridos estén presentes
  if (!SUNO_CONFIG.BASE_URL) errors.push('BASE_URL es requerido');
  if (!SUNO_CONFIG.POLLING_URL) errors.push('POLLING_URL es requerido');
  if (!SUNO_CONFIG.AUTH_TOKEN) errors.push('AUTH_TOKEN es requerido');
  
  // Verificar headers críticos
  if (!SUNO_CONFIG.HEADERS.authorization) errors.push('Header authorization es requerido');
  if (!SUNO_CONFIG.HEADERS.channel) errors.push('Header channel es requerido');
  if (!SUNO_CONFIG.HEADERS.origin) errors.push('Header origin es requerido');
  if (!SUNO_CONFIG.HEADERS.referer) errors.push('Header referer es requerido');
  
  // Verificar que el token no sea el placeholder
  if (SUNO_CONFIG.AUTH_TOKEN.includes('...')) {
    errors.push('AUTH_TOKEN debe ser actualizado con un token real');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔄 ACTUALIZACIÓN SEGURA DE TOKEN
export const updateSunoToken = (newToken: string): void => {
  if (!newToken || newToken.trim() === '') {
    throw new Error('Token no puede estar vacío');
  }
  
  // Actualizar token en configuración
  SUNO_CONFIG.AUTH_TOKEN = newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`;
  SUNO_CONFIG.HEADERS.authorization = SUNO_CONFIG.AUTH_TOKEN;
  
  console.log('✅ Token de IA musical actualizado correctamente');
};

// 🔍 OBTENER CONFIGURACIÓN ACTUAL
export const getSunoConfig = (): SunoConfig => {
  const validation = validateSunoConfig();
  
  if (!validation.isValid) {
    console.error('❌ Configuración de IA musical inválida:', validation.errors);
    throw new Error(`Configuración de IA musical inválida: ${validation.errors.join(', ')}`);
  }
  
  return SUNO_CONFIG;
};

// 📊 ESTADO DE LA CONFIGURACIÓN
export const getSunoConfigStatus = () => {
  const validation = validateSunoConfig();
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    hasToken: !!SUNO_CONFIG.AUTH_TOKEN && !SUNO_CONFIG.AUTH_TOKEN.includes('...'),
    endpoints: {
      base: SUNO_CONFIG.BASE_URL,
      polling: SUNO_CONFIG.POLLING_URL
    },
    headersCount: Object.keys(SUNO_CONFIG.HEADERS).length
  };
};

// ⚠️ ADVERTENCIA DE SEGURIDAD
if (typeof window !== 'undefined') {
  console.warn('🔒 IA MUSICAL CONFIG: Esta configuración contiene tokens sensibles');
  console.warn('📖 Para más información, consulta: SUNO_INTEGRATION_DOCS.md');
}
