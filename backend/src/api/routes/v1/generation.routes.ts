import { Router } from 'express';
import { generationController } from '@/api/controllers/generation.controller';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { validate } from '@/api/middlewares/validation.middleware';
import { generationLimiter } from '@/api/middlewares/rate-limit.middleware';
import {
  createGenerationSchema,
  listGenerationsSchema,
  generationIdSchema,
} from '@/api/validators/generation.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  generationLimiter,
  validate(createGenerationSchema),
  generationController.create
);

router.get(
  '/',
  authenticate,
  validate(listGenerationsSchema),
  generationController.list
);

router.get(
  '/:id',
  authenticate,
  validate(generationIdSchema),
  generationController.getStatus
);

router.delete(
  '/:id',
  authenticate,
  validate(generationIdSchema),
  generationController.cancel
);

export default router;
