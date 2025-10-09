import { Router } from 'express';
import { authController } from '@/api/controllers/auth.controller';
import { validate } from '@/api/middlewares/validation.middleware';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { authLimiter } from '@/api/middlewares/rate-limit.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '@/api/validators/auth.validator';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

export default router;
