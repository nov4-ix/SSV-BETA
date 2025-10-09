import { Router } from 'express';
import { PixelController } from '@/api/controllers/pixel.controller';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { apiLimiter } from '@/api/middlewares/rate-limit.middleware';

const router = Router();

// 🧠 PIXEL AI ROUTES - RUTAS DE APRENDIZAJE ADAPTATIVO 🧠

// Aplicar autenticación y rate limiting a todas las rutas
router.use(authenticate);
router.use(apiLimiter);

// 📊 CAPTURAR COMPORTAMIENTOS DEL USUARIO
// POST /api/v1/pixel/capture-behaviors
router.post('/capture-behaviors', PixelController.captureBehaviors);

// 🧠 OBTENER INSIGHTS DEL USUARIO
// GET /api/v1/pixel/insights/:userId
router.get('/insights/:userId', PixelController.getInsights);

// 🎯 OBTENER RECOMENDACIONES PERSONALIZADAS
// GET /api/v1/pixel/recommendations/:userId
router.get('/recommendations/:userId', PixelController.getRecommendations);

// 📈 ACTUALIZAR SATISFACCIÓN DEL USUARIO
// PUT /api/v1/pixel/satisfaction
router.put('/satisfaction', PixelController.updateSatisfaction);

// 📊 OBTENER ESTADÍSTICAS DE APRENDIZAJE
// GET /api/v1/pixel/stats/:userId
router.get('/stats/:userId', PixelController.getLearningStats);

// 🔄 REINICIAR APRENDIZAJE DEL USUARIO
// DELETE /api/v1/pixel/reset/:userId
router.delete('/reset/:userId', PixelController.resetLearning);

// 🎯 OBTENER RECOMENDACIÓN CONTEXTUAL
// GET /api/v1/pixel/contextual/:userId?context=navigation
router.get('/contextual/:userId', PixelController.getContextualRecommendation);

// 🧠 OBTENER INSIGHT POR CATEGORÍA
// GET /api/v1/pixel/category/:userId?category=music
router.get('/category/:userId', PixelController.getInsightByCategory);

export default router;