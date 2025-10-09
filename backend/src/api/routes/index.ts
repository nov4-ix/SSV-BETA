import { Router } from 'express';
import authRoutes from './auth.routes';
import generationRoutes from './generation.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/generations', generationRoutes);

export default router;
