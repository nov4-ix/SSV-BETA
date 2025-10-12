import { Router } from 'express';
import authRoutes from './v1/auth.routes';
import generationRoutes from './v1/generation.routes';
import sunoRoutes from './suno.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/generations', generationRoutes);
router.use('/suno', sunoRoutes);

export default router;
