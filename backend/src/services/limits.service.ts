import { SubscriptionTier } from '@prisma/client';

export interface ModelLimits {
  model35: number;
  model5: number;
  total: number;
}

export interface TierLimits {
  generations: ModelLimits;
  storageGB: number;
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
      features: [
        'Generación básica',
        'Almacenamiento limitado',
        'Soporte por email',
      ],
    },
    PRO: {
      generations: {
        model35: 100,
        model5: 100,
        total: 200,
      },
      storageGB: 10,
      features: [
        'Generación avanzada',
        'Almacenamiento amplio',
        'Soporte prioritario',
        'Acceso completo a funciones',
      ],
    },
    ENTERPRISE: {
      generations: {
        model35: -1, // Ilimitado
        model5: 300,  // 300 generaciones
        total: -1,   // Ilimitado (porque 3.5 es ilimitado)
      },
      storageGB: -1, // Ilimitado
      features: [
        'Modelo 3.5 ilimitado',
        '300 generaciones modelo 5',
        'Almacenamiento ilimitado',
        'API personalizada',
        'Soporte 24/7',
        'Integración empresarial',
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
}
