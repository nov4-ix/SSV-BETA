import { SubscriptionTier } from '@prisma/client';

export interface ModelLimits {
  model35: number;
  model5: number;
  total: number;
}

export interface Son1kverseLimits {
  ghostStudio: {
    trackAnalysis: number; // análisis de pistas por mes
    advancedAnalysis: boolean; // análisis avanzado con Dr. Pixel
  };
  theGenerator: {
    musicGenerations: number; // generaciones de música por mes
    sunoTokens: number; // tokens Suno disponibles
    pixelAssistance: boolean; // asistencia de Pixel Generator
    downloads: boolean; // descargas incluidas
    watermarkRequired: boolean; // marca de agua obligatoria
  };
  sanctuary: {
    postsPerMonth: number; // posts en red social
    collaborations: number; // colaboraciones
    pixelModeration: boolean; // moderación con Pixel Guardian
  };
  qwen2Access: boolean; // acceso a Qwen 2
  pixelAssistant: boolean; // asistencia de Pixel
  prioritySupport: boolean; // soporte prioritario
}

export interface TierLimits {
  generations: ModelLimits;
  storageGB: number;
  son1kverse: Son1kverseLimits;
  features: string[];
}

export class LimitsService {
  private static readonly TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
    FREE: {
      generations: {
        model35: 3,
        model5: 2,
        total: 5,
      },
      storageGB: 1,
      son1kverse: {
        ghostStudio: {
          trackAnalysis: 5, // 5 análisis básicos por mes
          advancedAnalysis: false, // sin análisis avanzado
        },
        theGenerator: {
          musicGenerations: 3, // 3 generaciones de música por mes
          sunoTokens: 10, // 10 tokens Suno por mes
          pixelAssistance: false, // sin asistencia de Pixel
          downloads: false, // sin descargas - solo compartir con marca de agua
          watermarkRequired: true, // marca de agua obligatoria
        },
        sanctuary: {
          postsPerMonth: 10, // 10 posts por mes
          collaborations: 2, // 2 colaboraciones por mes
          pixelModeration: false, // moderación básica
        },
        qwen2Access: false, // sin acceso a Qwen 2
        pixelAssistant: false, // sin Pixel Assistant
        prioritySupport: false, // soporte estándar
      },
      features: [
        'Generación básica',
        'Almacenamiento limitado',
        'Soporte por email',
        'Ghost Studio básico',
        'The Generator limitado',
        'Sanctuary básico',
      ],
    },
    PRO: {
      generations: {
        model35: 100,
        model5: 100,
        total: 200,
      },
      storageGB: 10,
      son1kverse: {
        ghostStudio: {
          trackAnalysis: 50, // 50 análisis por mes
          advancedAnalysis: true, // análisis avanzado con Dr. Pixel
        },
        theGenerator: {
          musicGenerations: 25, // 25 generaciones de música por mes
          sunoTokens: 100, // 100 tokens Suno por mes
          pixelAssistance: true, // asistencia de Pixel Generator
          downloads: true, // descargas incluidas
          watermarkRequired: false, // sin marca de agua
        },
        sanctuary: {
          postsPerMonth: 100, // 100 posts por mes
          collaborations: 10, // 10 colaboraciones por mes
          pixelModeration: true, // moderación con Pixel Guardian
        },
        qwen2Access: true, // acceso completo a Qwen 2
        pixelAssistant: true, // Pixel Assistant completo
        prioritySupport: true, // soporte prioritario
      },
      features: [
        'Generación avanzada',
        'Almacenamiento amplio',
        'Soporte prioritario',
        'Acceso completo a funciones',
        'Ghost Studio Pro con Dr. Pixel',
        'The Generator Pro con descargas',
        'Sanctuary Pro con Pixel Guardian',
        'Qwen 2 + Pixel Assistant',
      ],
    },
    ENTERPRISE: {
      generations: {
        model35: -1, // Ilimitado
        model5: 300,  // 300 generaciones
        total: -1,   // Ilimitado (porque 3.5 es ilimitado)
      },
      storageGB: -1, // Ilimitado
      son1kverse: {
        ghostStudio: {
          trackAnalysis: -1, // análisis ilimitados
          advancedAnalysis: true, // análisis avanzado con Dr. Pixel
        },
        theGenerator: {
          musicGenerations: -1, // generaciones ilimitadas
          sunoTokens: 1000, // 1000 tokens Suno por mes
          pixelAssistance: true, // asistencia completa de Pixel Generator
          downloads: true, // descargas ilimitadas
          watermarkRequired: false, // sin marca de agua
        },
        sanctuary: {
          postsPerMonth: -1, // posts ilimitados
          collaborations: -1, // colaboraciones ilimitadas
          pixelModeration: true, // moderación avanzada con Pixel Guardian
        },
        qwen2Access: true, // acceso completo a Qwen 2
        pixelAssistant: true, // Pixel Assistant completo
        prioritySupport: true, // soporte 24/7
      },
      features: [
        'Modelo 3.5 ilimitado',
        '300 generaciones modelo 5',
        'Almacenamiento ilimitado',
        'API personalizada',
        'Soporte 24/7',
        'Integración empresarial',
        'Ghost Studio Enterprise ilimitado',
        'The Generator Enterprise con descargas ilimitadas',
        'Sanctuary Enterprise ilimitado',
        'Qwen 2 + Pixel Assistant completo',
      ],
    },
  };

  static getTierLimits(tier: SubscriptionTier): TierLimits {
    return this.TIER_LIMITS[tier];
  }

  static canGenerate(
    tier: SubscriptionTier,
    model: '3.5' | '5',
    usedThisMonth: { model35: number; model5: number }
  ): { canGenerate: boolean; remaining: number; reason?: string } {
    const limits = this.getTierLimits(tier);
    
    const modelKey = model === '3.5' ? 'model35' : 'model5';
    const limit = limits.generations[modelKey];
    const used = usedThisMonth[modelKey];
    
    // Modelo 3.5 ilimitado para ENTERPRISE
    if (tier === 'ENTERPRISE' && model === '3.5') {
      return { canGenerate: true, remaining: -1 };
    }
    
    // Verificar límite para modelo 5 de ENTERPRISE o cualquier modelo de otros tiers
    const remaining = limit - used;

    if (remaining <= 0) {
      return {
        canGenerate: false,
        remaining: 0,
        reason: `Límite de ${limit} generaciones con modelo ${model} alcanzado este mes`,
      };
    }

    return { canGenerate: true, remaining };
  }

  static getRemainingGenerations(
    tier: SubscriptionTier,
    usedThisMonth: { model35: number; model5: number }
  ): { model35: number; model5: number; total: number } {
    const limits = this.getTierLimits(tier);
    
    // ENTERPRISE: modelo 3.5 ilimitado, modelo 5 con límite
    if (tier === 'ENTERPRISE') {
      const remaining5 = Math.max(0, limits.generations.model5 - usedThisMonth.model5);
      return { model35: -1, model5: remaining5, total: -1 };
    }

    const remaining35 = Math.max(0, limits.generations.model35 - usedThisMonth.model35);
    const remaining5 = Math.max(0, limits.generations.model5 - usedThisMonth.model5);
    const total = remaining35 + remaining5;

    return { model35: remaining35, model5: remaining5, total };
  }

  static getStorageLimit(tier: SubscriptionTier): number {
    const limits = this.getTierLimits(tier);
    return limits.storageGB;
  }

  static getFeatures(tier: SubscriptionTier): string[] {
    const limits = this.getTierLimits(tier);
    return limits.features;
  }

  static isUnlimited(tier: SubscriptionTier): boolean {
    return tier === 'ENTERPRISE';
  }

  // === MÉTODOS ESPECÍFICOS PARA SON1KVERSE ===

  /**
   * Verificar si el usuario puede descargar pistas
   */
  static canDownloadTracks(tier: SubscriptionTier): boolean {
    const limits = this.getTierLimits(tier);
    return limits.son1kverse.theGenerator.downloads;
  }

  /**
   * Verificar si se requiere marca de agua
   */
  static requiresWatermark(tier: SubscriptionTier): boolean {
    const limits = this.getTierLimits(tier);
    return limits.son1kverse.theGenerator.watermarkRequired;
  }

  /**
   * Verificar si el usuario tiene acceso a Qwen 2
   */
  static hasQwen2Access(tier: SubscriptionTier): boolean {
    const limits = this.getTierLimits(tier);
    return limits.son1kverse.qwen2Access;
  }

  /**
   * Verificar si el usuario tiene Pixel Assistant
   */
  static hasPixelAssistant(tier: SubscriptionTier): boolean {
    const limits = this.getTierLimits(tier);
    return limits.son1kverse.pixelAssistant;
  }

  /**
   * Obtener límites específicos de Ghost Studio
   */
  static getGhostStudioLimits(tier: SubscriptionTier) {
    const limits = this.getTierLimits(tier);
    return limits.son1kverse.ghostStudio;
  }

  /**
   * Obtener límites específicos de The Generator
   */
  static getTheGeneratorLimits(tier: SubscriptionTier) {
    const limits = this.getTierLimits(tier);
    return limits.son1kverse.theGenerator;
  }

  /**
   * Obtener límites específicos de Sanctuary
   */
  static getSanctuaryLimits(tier: SubscriptionTier) {
    const limits = this.getTierLimits(tier);
    return limits.son1kverse.sanctuary;
  }

  /**
   * Verificar si puede generar música con límites específicos
   */
  static canGenerateMusic(
    tier: SubscriptionTier,
    usedThisMonth: number
  ): { canGenerate: boolean; remaining: number; reason?: string } {
    const limits = this.getTheGeneratorLimits(tier);
    const limit = limits.musicGenerations;
    const remaining = limit - usedThisMonth;

    // Enterprise tiene generaciones ilimitadas
    if (tier === 'ENTERPRISE') {
      return { canGenerate: true, remaining: -1 };
    }

    if (remaining <= 0) {
      return {
        canGenerate: false,
        remaining: 0,
        reason: `Límite de ${limit} generaciones de música alcanzado este mes`,
      };
    }

    return { canGenerate: true, remaining };
  }

  /**
   * Verificar si puede analizar pistas en Ghost Studio
   */
  static canAnalyzeTrack(
    tier: SubscriptionTier,
    usedThisMonth: number
  ): { canAnalyze: boolean; remaining: number; reason?: string } {
    const limits = this.getGhostStudioLimits(tier);
    const limit = limits.trackAnalysis;
    const remaining = limit - usedThisMonth;

    // Enterprise tiene análisis ilimitados
    if (tier === 'ENTERPRISE') {
      return { canAnalyze: true, remaining: -1 };
    }

    if (remaining <= 0) {
      return {
        canAnalyze: false,
        remaining: 0,
        reason: `Límite de ${limit} análisis de pistas alcanzado este mes`,
      };
    }

    return { canAnalyze: true, remaining };
  }

  /**
   * Verificar si puede hacer posts en Sanctuary
   */
  static canPostInSanctuary(
    tier: SubscriptionTier,
    usedThisMonth: number
  ): { canPost: boolean; remaining: number; reason?: string } {
    const limits = this.getSanctuaryLimits(tier);
    const limit = limits.postsPerMonth;
    const remaining = limit - usedThisMonth;

    // Enterprise tiene posts ilimitados
    if (tier === 'ENTERPRISE') {
      return { canPost: true, remaining: -1 };
    }

    if (remaining <= 0) {
      return {
        canPost: false,
        remaining: 0,
        reason: `Límite de ${limit} posts alcanzado este mes`,
      };
    }

    return { canPost: true, remaining };
  }
}
