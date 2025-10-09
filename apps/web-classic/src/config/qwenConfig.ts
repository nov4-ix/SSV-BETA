/**
 * 🧠 CONFIGURACIÓN QWEN 2
 * 
 * Configuración para el motor de IA Qwen 2
 * 
 * ⚠️ CONFIGURACIÓN CRÍTICA - NO MODIFICAR SIN AUTORIZACIÓN
 */

export interface QwenConfig {
  API_BASE_URL: string;
  API_KEY: string;
  MODEL: string;
  MAX_TOKENS: number;
  TEMPERATURE: number;
  TOP_P: number;
  TIMEOUT: number;
}

// ⚠️ CONFIGURACIÓN PRINCIPAL - NO CAMBIAR ESTRUCTURA
export const QWEN_CONFIG: QwenConfig = {
  // Endpoint de Qwen 2
  API_BASE_URL: 'https://api.qwen.ai/v1',
  
  // API Key - ACTUALIZAR SOLO EL VALOR
  API_KEY: 'sk-qwen-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // ⚠️ ACTUALIZAR ESTA KEY
  
  // Modelo Qwen 2 a usar
  MODEL: 'qwen2-7b-instruct', // Puede ser: qwen2-1.5b, qwen2-7b, qwen2-72b
  
  // Parámetros de generación
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
  TIMEOUT: 30000 // 30 segundos
};

// 🎯 PROMPTS OPTIMIZADOS PARA QWEN 2
export const QWEN_PROMPTS = {
  // Optimización de prompts musicales
  MUSIC_OPTIMIZATION: `Eres un experto en generación de música con IA. Tu tarea es optimizar el siguiente prompt para obtener mejores resultados en generación musical.

Prompt original: "{originalPrompt}"

Contexto: {context}
Audiencia objetivo: {targetAudience}
Optimización: {optimization}

Instrucciones:
1. Mejora la claridad y especificidad del prompt
2. Agrega detalles musicales relevantes si faltan
3. Mantén el estilo y intención original
4. Optimiza para {optimization}
5. Responde SOLO con el prompt optimizado

Prompt optimizado:`,

  // Traducción inteligente
  TRANSLATION: `Eres un traductor experto especializado en términos musicales y creativos. Traduce el siguiente texto manteniendo el contexto y la intención original.

Texto original: "{text}"
Idioma origen: {fromLanguage}
Idioma destino: {toLanguage}
Contexto: {context}

Instrucciones:
1. Traduce manteniendo el significado musical
2. Preserva términos técnicos cuando sea apropiado
3. Adapta el estilo al idioma destino
4. Responde SOLO con la traducción

Traducción:`,

  // Análisis de píxeles adaptativos
  PIXEL_ANALYSIS: `Eres un experto en UX/UI y análisis de comportamiento de usuario. Analiza los siguientes datos y proporciona recomendaciones para optimizar la experiencia.

Comportamiento del usuario:
- Clicks: {clicks}
- Hovers: {hovers}
- Scrolls: {scrolls}
- Tiempo invertido: {timeSpent}ms
- Preferencias: {preferences}

Contexto:
- Página: {page}
- Sección: {section}
- Dispositivo: {device}
- Hora del día: {timeOfDay}

Proporciona recomendaciones específicas para:
1. Ajustes de color (primary, secondary, accent)
2. Optimizaciones de layout (spacing, size, position)
3. Mejoras de interacción (animations, transitions, feedback)

Responde en formato JSON con las recomendaciones.`,

  // Generación de sugerencias
  SUGGESTIONS: `Basándote en el prompt musical "{prompt}", genera 3 sugerencias específicas para mejorarlo:

1. Una sugerencia sobre instrumentos
2. Una sugerencia sobre mood/atmósfera
3. Una sugerencia sobre estructura/tempo

Responde SOLO con las 3 sugerencias, una por línea.`,

  // Detección de idioma
  LANGUAGE_DETECTION: `Detecta el idioma del siguiente texto y responde SOLO con el código de idioma (es, en, fr, de, it, pt, etc.):

Texto: "{text}"

Idioma detectado:`
};

// 🌍 IDIOMAS SOPORTADOS
export const SUPPORTED_LANGUAGES = {
  'es': 'Español',
  'en': 'English',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'ja': '日本語',
  'ko': '한국어',
  'zh': '中文',
  'ru': 'Русский'
};

// 🎵 CONTEXTOS MUSICALES
export const MUSIC_CONTEXTS = {
  'music': 'Generación musical',
  'general': 'Uso general',
  'creative': 'Contenido creativo',
  'technical': 'Términos técnicos',
  'marketing': 'Contenido de marketing'
};

// 👥 AUDIENCIAS OBJETIVO
export const TARGET_AUDIENCES = {
  'beginner': 'Principiante',
  'intermediate': 'Intermedio',
  'expert': 'Experto',
  'professional': 'Profesional'
};

// ⚡ OPTIMIZACIONES
export const OPTIMIZATIONS = {
  'quality': 'Máxima calidad',
  'speed': 'Velocidad',
  'balance': 'Equilibrio',
  'creativity': 'Creatividad'
};

// ⚠️ VALIDACIÓN DE CONFIGURACIÓN
export const validateQwenConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!QWEN_CONFIG.API_BASE_URL) errors.push('API_BASE_URL es requerido');
  if (!QWEN_CONFIG.API_KEY) errors.push('API_KEY es requerido');
  if (!QWEN_CONFIG.MODEL) errors.push('MODEL es requerido');
  
  if (QWEN_CONFIG.API_KEY.includes('xxxxxxxx')) {
    errors.push('API_KEY debe ser actualizada con una key real');
  }
  
  if (QWEN_CONFIG.MAX_TOKENS < 100 || QWEN_CONFIG.MAX_TOKENS > 4096) {
    errors.push('MAX_TOKENS debe estar entre 100 y 4096');
  }
  
  if (QWEN_CONFIG.TEMPERATURE < 0 || QWEN_CONFIG.TEMPERATURE > 2) {
    errors.push('TEMPERATURE debe estar entre 0 y 2');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔄 ACTUALIZACIÓN SEGURA DE CONFIGURACIÓN
export const updateQwenConfig = (updates: Partial<QwenConfig>): void => {
  Object.assign(QWEN_CONFIG, updates);
  console.log('✅ Configuración de Qwen 2 actualizada');
};

// 🔍 OBTENER CONFIGURACIÓN ACTUAL
export const getQwenConfig = (): QwenConfig => {
  const validation = validateQwenConfig();
  
  if (!validation.isValid) {
    console.error('❌ Configuración de Qwen 2 inválida:', validation.errors);
    throw new Error(`Configuración de Qwen 2 inválida: ${validation.errors.join(', ')}`);
  }
  
  return QWEN_CONFIG;
};

// 📊 ESTADO DE LA CONFIGURACIÓN
export const getQwenConfigStatus = () => {
  const validation = validateQwenConfig();
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    hasApiKey: !!QWEN_CONFIG.API_KEY && !QWEN_CONFIG.API_KEY.includes('xxxxxxxx'),
    model: QWEN_CONFIG.MODEL,
    maxTokens: QWEN_CONFIG.MAX_TOKENS,
    temperature: QWEN_CONFIG.TEMPERATURE
  };
};

// ⚠️ ADVERTENCIA DE SEGURIDAD
if (typeof window !== 'undefined') {
  console.warn('🔒 QWEN CONFIG: Esta configuración contiene API keys sensibles');
  console.warn('📖 Para más información, consulta la documentación de Qwen 2');
}
