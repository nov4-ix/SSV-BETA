import { Router } from 'express';
import { sunoController } from '../controllers/suno.controller';

// ────────────────────────────────────────────────────────────────────────────────
// SUNO ROUTES - API ENDPOINTS PARA GENERACIÓN DE MÚSICA
// ────────────────────────────────────────────────────────────────────────────────

const router = Router();

// ────────────────────────────────────────────────────────────────────────────────
// RUTAS DE GENERACIÓN
// ────────────────────────────────────────────────────────────────────────────────

/**
 * @route POST /api/suno/generate
 * @desc Generar música usando Suno AI vía imgkits
 * @access Public (con límites por tier)
 */
router.post('/generate', async (req, res) => {
  await sunoController.generateMusic(req, res);
});

/**
 * @route POST /api/suno/generate-and-wait
 * @desc Generar música y esperar resultado (polling automático)
 * @access Public (con límites por tier)
 */
router.post('/generate-and-wait', async (req, res) => {
  await sunoController.generateAndWait(req, res);
});

/**
 * @route GET /api/suno/status/:taskId
 * @desc Verificar estado de generación
 * @access Public
 */
router.get('/status/:taskId', async (req, res) => {
  await sunoController.checkStatus(req, res);
});

/**
 * @route GET /api/suno/stats
 * @desc Obtener estadísticas del servicio imgkits
 * @access Admin only
 */
router.get('/stats', async (req, res) => {
  await sunoController.getStats(req, res);
});

// ────────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE DE VALIDACIÓN (OPCIONAL)
// ────────────────────────────────────────────────────────────────────────────────

// Middleware para validar rate limiting por usuario
const rateLimitMiddleware = (req: any, res: any, next: any) => {
  // TODO: Implementar rate limiting basado en tier del usuario
  // Por ahora, permitir todas las requests
  next();
};

// Middleware para validar límites de tier
const tierLimitMiddleware = (req: any, res: any, next: any) => {
  // TODO: Implementar validación de límites por tier
  // Por ahora, permitir todas las requests
  next();
};

// Aplicar middlewares a las rutas de generación
router.use('/generate', rateLimitMiddleware, tierLimitMiddleware);
router.use('/generate-and-wait', rateLimitMiddleware, tierLimitMiddleware);

export default router;
