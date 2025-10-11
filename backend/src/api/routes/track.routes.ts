import { Router } from 'express';
import { trackController } from '@/api/controllers/track.controller';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { 
  requireDownloadPermission,
  checkWatermarkRequirement,
  getUserLimits,
  requireMinimumTier
} from '@/api/middlewares/son1kverse-permissions.middleware';

/**
 * 🎵 RUTAS DE TRACKS SON1KVERSE
 * 
 * Rutas para manejar descargas, compartir y marcas de agua
 * según el tier de suscripción del usuario
 */

const router = Router();

// === RUTAS PROTEGIDAS ===

/**
 * GET /api/tracks/:trackId/preview
 * Obtener vista previa de pista (todos los tiers)
 */
router.get(
  '/:trackId/preview',
  authenticate,
  checkWatermarkRequirement,
  trackController.getTrackPreview
);

/**
 * GET /api/tracks/:trackId/download
 * Descargar pista (solo PRO+)
 */
router.get(
  '/:trackId/download',
  authenticate,
  requireDownloadPermission,
  trackController.downloadTrack
);

/**
 * POST /api/tracks/:trackId/share
 * Compartir pista (todos los tiers)
 */
router.post(
  '/:trackId/share',
  authenticate,
  checkWatermarkRequirement,
  trackController.shareTrack
);

/**
 * GET /api/tracks/user/limits
 * Obtener límites del usuario
 */
router.get(
  '/user/limits',
  authenticate,
  getUserLimits,
  trackController.getUserLimits
);

/**
 * GET /api/tracks/user/usage
 * Obtener estadísticas de uso del usuario
 */
router.get(
  '/user/usage',
  authenticate,
  trackController.getUserUsageStats
);

// === RUTAS DE ADMINISTRACIÓN ===

/**
 * GET /api/tracks/admin/stats
 * Estadísticas generales (solo ADMIN)
 */
router.get(
  '/admin/stats',
  authenticate,
  requireMinimumTier('ADMIN'),
  async (req, res) => {
    // Implementar estadísticas de administración
    res.json({
      success: true,
      stats: {
        totalTracks: 1250,
        freeUsers: 850,
        proUsers: 300,
        enterpriseUsers: 100,
        downloadsThisMonth: 5000,
        sharesThisMonth: 12000,
        watermarkApplications: 8500
      }
    });
  }
);

/**
 * GET /api/tracks/admin/watermark-stats
 * Estadísticas de marcas de agua (solo ADMIN)
 */
router.get(
  '/admin/watermark-stats',
  authenticate,
  requireMinimumTier('ADMIN'),
  async (req, res) => {
    res.json({
      success: true,
      watermarkStats: {
        totalWatermarked: 8500,
        byTier: {
          FREE: 7500,
          STARTER: 800,
          PRO: 200,
          ENTERPRISE: 0
        },
        platforms: {
          instagram: 4000,
          twitter: 2500,
          tiktok: 1500,
          youtube: 500
        }
      }
    });
  }
);

// === RUTAS PÚBLICAS ===

/**
 * GET /api/tracks/tiers
 * Obtener información de tiers (público)
 */
router.get('/tiers', async (req, res) => {
  const tiers = {
    FREE: {
      name: 'Free',
      price: 0,
      features: [
        '3 generaciones de música por mes',
        'Compartir con marca de agua Son1kverse',
        'Ghost Studio básico',
        'Sanctuary básico',
        'Soporte por email'
      ],
      limitations: [
        'Sin descargas',
        'Marca de agua obligatoria',
        'Sin Pixel Assistant',
        'Sin acceso a Qwen 2'
      ]
    },
    PRO: {
      name: 'Pro',
      price: 29,
      features: [
        '25 generaciones de música por mes',
        'Descargas ilimitadas',
        'Sin marca de agua',
        'Ghost Studio Pro con Dr. Pixel',
        'The Generator Pro con Pixel Generator',
        'Sanctuary Pro con Pixel Guardian',
        'Qwen 2 + Pixel Assistant completo',
        'Soporte prioritario'
      ],
      limitations: []
    },
    ENTERPRISE: {
      name: 'Enterprise',
      price: 99,
      features: [
        'Generaciones ilimitadas',
        'Descargas ilimitadas',
        'Sin marca de agua',
        'Todas las herramientas ilimitadas',
        'Pixel Assistant completo',
        'Qwen 2 avanzado',
        'API personalizada',
        'Soporte 24/7',
        'Integración empresarial'
      ],
      limitations: []
    }
  };

  res.json({
    success: true,
    tiers,
    currentPromotion: {
      active: true,
      message: '🎉 ¡Oferta de lanzamiento! 50% de descuento en el primer mes',
      discount: 50,
      validUntil: '2024-02-29'
    }
  });
});

/**
 * GET /api/tracks/watermark-preview
 * Vista previa de marca de agua (público)
 */
router.get('/watermark-preview', async (req, res) => {
  const watermarkPreview = {
    FREE: {
      text: 'Creado con Son1kverse',
      position: 'bottom-right',
      opacity: 0.8,
      color: '#00FFE7',
      example: 'https://son1kverse.com/watermark-preview/free.png'
    },
    STARTER: {
      text: 'Son1kverse Starter',
      position: 'bottom-right',
      opacity: 0.6,
      color: '#B84DFF',
      example: 'https://son1kverse.com/watermark-preview/starter.png'
    },
    PRO: {
      text: 'Sin marca de agua',
      position: 'none',
      opacity: 0,
      color: 'transparent',
      example: 'https://son1kverse.com/watermark-preview/pro.png'
    }
  };

  res.json({
    success: true,
    watermarkPreview,
    note: 'Los usuarios PRO y superiores no tienen marca de agua en sus pistas'
  });
});

export default router;
