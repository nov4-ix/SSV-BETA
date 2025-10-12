/**
 * 🎵 SUNO CONFIGURATION - CONFIGURACIÓN OPTIMIZADA PARA SUNO
 * 
 * Configuración específica para mejorar la respuesta de Suno
 */

export const SUNO_CONFIG = {
  // Configuración de prompts optimizados
  PROMPT_OPTIMIZATION: {
    // Agregar palabras clave que mejoran la calidad
    QUALITY_KEYWORDS: [
      'high quality',
      'professional',
      'studio quality',
      'crystal clear',
      'well mixed',
      'balanced',
      'dynamic'
    ],
    
    // Estilos que funcionan mejor con Suno
    RECOMMENDED_STYLES: [
      'pop',
      'rock',
      'electronic',
      'acoustic',
      'jazz',
      'blues',
      'folk',
      'indie',
      'alternative',
      'ambient'
    ],
    
    // Configuración de género vocal
    VOCAL_CONFIG: {
      male: 'male vocals, deep voice',
      female: 'female vocals, clear voice',
      mixed: 'mixed vocals, harmonies'
    },
    
    // Configuración de instrumentos
    INSTRUMENTAL_CONFIG: {
      true: 'instrumental only, no vocals',
      false: 'with vocals, melodic'
    }
  },
  
  // Configuración de timeout y reintentos
  TIMEOUT_CONFIG: {
    GENERATION_TIMEOUT: 120000, // 2 minutos
    POLLING_INTERVAL: 3000,    // 3 segundos
    MAX_POLLING_ATTEMPTS: 40,  // 2 minutos máximo
    RETRY_ATTEMPTS: 3
  },
  
  // Configuración de prompts por defecto
  DEFAULT_PROMPTS: {
    POP: 'upbeat pop song, catchy melody, modern production',
    ROCK: 'energetic rock song, powerful guitars, driving rhythm',
    ELECTRONIC: 'electronic dance music, synthesizers, beat drop',
    ACOUSTIC: 'acoustic guitar, intimate vocals, organic sound',
    JAZZ: 'smooth jazz, saxophone, sophisticated harmony',
    BLUES: 'blues song, soulful vocals, guitar solo',
    FOLK: 'folk music, acoustic instruments, storytelling',
    INDIE: 'indie rock, alternative sound, creative arrangement',
    AMBIENT: 'ambient music, atmospheric, peaceful'
  }
};

/**
 * Optimiza un prompt para Suno
 */
export function optimizePromptForSuno(prompt: string, style?: string, gender?: string, instrumental?: boolean): string {
  let optimizedPrompt = prompt.trim();
  
  // Agregar palabras de calidad
  if (!optimizedPrompt.includes('quality') && !optimizedPrompt.includes('professional')) {
    optimizedPrompt += ', high quality';
  }
  
  // Agregar estilo si se especifica
  if (style && SUNO_CONFIG.PROMPT_OPTIMIZATION.RECOMMENDED_STYLES.includes(style.toLowerCase())) {
    optimizedPrompt += `, ${style} style`;
  }
  
  // Agregar configuración de género
  if (gender && gender !== 'mixed') {
    const vocalConfig = SUNO_CONFIG.PROMPT_OPTIMIZATION.VOCAL_CONFIG[gender as keyof typeof SUNO_CONFIG.PROMPT_OPTIMIZATION.VOCAL_CONFIG];
    if (vocalConfig) {
      optimizedPrompt += `, ${vocalConfig}`;
    }
  }
  
  // Agregar configuración instrumental
  if (instrumental !== undefined) {
    const instrumentalConfig = SUNO_CONFIG.PROMPT_OPTIMIZATION.INSTRUMENTAL_CONFIG[instrumental.toString() as keyof typeof SUNO_CONFIG.PROMPT_OPTIMIZATION.INSTRUMENTAL_CONFIG];
    if (instrumentalConfig) {
      optimizedPrompt += `, ${instrumentalConfig}`;
    }
  }
  
  return optimizedPrompt;
}

/**
 * Obtiene un prompt por defecto basado en el estilo
 */
export function getDefaultPromptForStyle(style: string): string {
  const upperStyle = style.toUpperCase() as keyof typeof SUNO_CONFIG.DEFAULT_PROMPTS;
  return SUNO_CONFIG.DEFAULT_PROMPTS[upperStyle] || SUNO_CONFIG.DEFAULT_PROMPTS.POP;
}

/**
 * Valida si un prompt es adecuado para Suno
 */
export function validatePromptForSuno(prompt: string): { isValid: boolean; suggestions: string[] } {
  const suggestions: string[] = [];
  
  if (prompt.length < 10) {
    suggestions.push('El prompt debe tener al menos 10 caracteres');
  }
  
  if (prompt.length > 500) {
    suggestions.push('El prompt es muy largo, considera acortarlo');
  }
  
  // Verificar si contiene palabras problemáticas
  const problematicWords = ['copyright', 'trademark', 'brand', 'commercial'];
  const hasProblematicWords = problematicWords.some(word => 
    prompt.toLowerCase().includes(word)
  );
  
  if (hasProblematicWords) {
    suggestions.push('Evita palabras relacionadas con derechos de autor');
  }
  
  return {
    isValid: suggestions.length === 0,
    suggestions
  };
}

