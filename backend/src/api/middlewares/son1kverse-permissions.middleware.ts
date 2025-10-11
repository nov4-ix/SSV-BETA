import { Request, Response, NextFunction } from 'express';
import { SubscriptionTier } from '@prisma/client';
import { LimitsService } from '@/services/limits.service';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import { asyncHandler } from '@/utils/async-handler';

/**
 * 🔒 MIDDLEWARE DE PERMISOS SON1KVERSE
 * 
 * Middleware para verificar permisos específicos de cada herramienta
 * según el tier de suscripción del usuario
 */

declare global {
  namespace Express {
    interface Request {
      userTier?: SubscriptionTier;
    }
  }
}

/**
 * Middleware para verificar si el usuario puede descargar pistas
 */
export const requireDownloadPermission = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    
    if (!userTier) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const canDownload = LimitsService.canDownloadTracks(userTier);
    
    if (!canDownload) {
      throw new ForbiddenError(
        'Las descargas están disponibles solo para usuarios PRO y superiores. ' +
        'Los usuarios FREE pueden compartir pistas con marca de agua de Son1kverse.'
      );
    }

    next();
  }
);

/**
 * Middleware para verificar si se requiere marca de agua
 */
export const checkWatermarkRequirement = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    
    if (!userTier) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const requiresWatermark = LimitsService.requiresWatermark(userTier);
    
    // Agregar información sobre marca de agua a la respuesta
    res.locals.requiresWatermark = requiresWatermark;
    res.locals.userTier = userTier;
    
    next();
  }
);

/**
 * Middleware para verificar acceso a Qwen 2
 */
export const requireQwen2Access = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    
    if (!userTier) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const hasAccess = LimitsService.hasQwen2Access(userTier);
    
    if (!hasAccess) {
      throw new ForbiddenError(
        'El acceso a Qwen 2 está disponible solo para usuarios PRO y superiores. ' +
        'Actualiza tu suscripción para acceder a análisis avanzados con IA.'
      );
    }

    next();
  }
);

/**
 * Middleware para verificar acceso a Pixel Assistant
 */
export const requirePixelAssistant = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    
    if (!userTier) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const hasAccess = LimitsService.hasPixelAssistant(userTier);
    
    if (!hasAccess) {
      throw new ForbiddenError(
        'Pixel Assistant está disponible solo para usuarios PRO y superiores. ' +
        'Actualiza tu suscripción para acceder a asistencia inteligente.'
      );
    }

    next();
  }
);

/**
 * Middleware para verificar límites de generación de música
 */
export const checkMusicGenerationLimits = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    const userId = req.userId || req.user?.id;
    
    if (!userTier || !userId) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    // Obtener uso actual del mes (esto debería venir de la base de datos)
    const usedThisMonth = req.body.usedThisMonth || 0;
    
    const canGenerate = LimitsService.canGenerateMusic(userTier, usedThisMonth);
    
    if (!canGenerate.canGenerate) {
      throw new ForbiddenError(canGenerate.reason || 'Límite de generaciones alcanzado');
    }

    // Agregar información de límites a la respuesta
    res.locals.generationLimits = {
      canGenerate: canGenerate.canGenerate,
      remaining: canGenerate.remaining,
      tier: userTier
    };
    
    next();
  }
);

/**
 * Middleware para verificar límites de análisis de pistas
 */
export const checkTrackAnalysisLimits = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    const userId = req.userId || req.user?.id;
    
    if (!userTier || !userId) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    // Obtener uso actual del mes
    const usedThisMonth = req.body.usedThisMonth || 0;
    
    const canAnalyze = LimitsService.canAnalyzeTrack(userTier, usedThisMonth);
    
    if (!canAnalyze.canAnalyze) {
      throw new ForbiddenError(canAnalyze.reason || 'Límite de análisis alcanzado');
    }

    // Agregar información de límites a la respuesta
    res.locals.analysisLimits = {
      canAnalyze: canAnalyze.canAnalyze,
      remaining: canAnalyze.remaining,
      tier: userTier
    };
    
    next();
  }
);

/**
 * Middleware para verificar límites de posts en Sanctuary
 */
export const checkSanctuaryPostLimits = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    const userId = req.userId || req.user?.id;
    
    if (!userTier || !userId) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    // Obtener uso actual del mes
    const usedThisMonth = req.body.usedThisMonth || 0;
    
    const canPost = LimitsService.canPostInSanctuary(userTier, usedThisMonth);
    
    if (!canPost.canPost) {
      throw new ForbiddenError(canPost.reason || 'Límite de posts alcanzado');
    }

    // Agregar información de límites a la respuesta
    res.locals.postLimits = {
      canPost: canPost.canPost,
      remaining: canPost.remaining,
      tier: userTier
    };
    
    next();
  }
);

/**
 * Middleware para obtener información completa de límites del usuario
 */
export const getUserLimits = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    
    if (!userTier) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const limits = LimitsService.getTierLimits(userTier);
    
    // Agregar información completa de límites
    res.locals.userLimits = {
      tier: userTier,
      general: {
        generations: limits.generations,
        storageGB: limits.storageGB,
        features: limits.features
      },
      son1kverse: limits.son1kverse,
      permissions: {
        canDownload: LimitsService.canDownloadTracks(userTier),
        requiresWatermark: LimitsService.requiresWatermark(userTier),
        hasQwen2Access: LimitsService.hasQwen2Access(userTier),
        hasPixelAssistant: LimitsService.hasPixelAssistant(userTier)
      }
    };
    
    next();
  }
);

/**
 * Middleware para aplicar marca de agua automáticamente si es requerida
 */
export const applyWatermarkIfRequired = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userTier = req.userTier || req.user?.subscriptionTier;
    
    if (!userTier) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const requiresWatermark = LimitsService.requiresWatermark(userTier);
    
    if (requiresWatermark) {
      // Agregar marca de agua a la pista generada
      req.body.watermark = {
        text: 'Creado con Son1kverse',
        position: 'bottom-right',
        opacity: 0.7,
        fontSize: 12,
        color: '#00FFE7'
      };
    }
    
    next();
  }
);

/**
 * Middleware para verificar tier mínimo requerido
 */
export const requireMinimumTier = (minimumTier: SubscriptionTier) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userTier = req.userTier || req.user?.subscriptionTier;
      
      if (!userTier) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const tierHierarchy = {
        'FREE': 0,
        'STARTER': 1,
        'PRO': 2,
        'ENTERPRISE': 3
      };

      const userTierLevel = tierHierarchy[userTier];
      const requiredTierLevel = tierHierarchy[minimumTier];

      if (userTierLevel < requiredTierLevel) {
        throw new ForbiddenError(
          `Esta función requiere tier ${minimumTier} o superior. ` +
          `Tu tier actual es ${userTier}.`
        );
      }

      next();
    }
  );
};
