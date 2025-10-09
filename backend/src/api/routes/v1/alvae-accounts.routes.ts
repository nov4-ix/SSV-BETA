import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AlvaeAccountsController } from '../controllers/alvae-accounts.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/auth.middleware';
import { rateLimit } from '../middlewares/rate-limit.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { z } from 'zod';

// 🏆 ALVAE ACCOUNTS ROUTES 🏆

const router = Router();
const prisma = new PrismaClient();
const alvaeController = new AlvaeAccountsController(prisma);

// Validación schemas
const createAlvaeAccountSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ALVAE_FOUNDER', 'ALVAE_PARTNER', 'ALVAE_TESTER', 'ALVAE_ADMIN']),
  tier: z.enum(['ALVAE_FOUNDER', 'ALVAE_PARTNER', 'ALVAE_TESTER', 'ALVAE_ADMIN']),
  alvaeSymbol: z.string().min(1, 'ALVAE symbol is required'),
  alvaeColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  isBlindado: z.boolean().optional().default(false),
});

const updateAlvaeAccountSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['ALVAE_FOUNDER', 'ALVAE_PARTNER', 'ALVAE_TESTER', 'ALVAE_ADMIN']).optional(),
  tier: z.enum(['ALVAE_FOUNDER', 'ALVAE_PARTNER', 'ALVAE_TESTER', 'ALVAE_ADMIN']).optional(),
  alvaeSymbol: z.string().min(1, 'ALVAE symbol is required').optional(),
  alvaeColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required').optional(),
  isBlindado: z.boolean().optional(),
});

const userIdSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

const permissionQuerySchema = z.object({
  permission: z.string().min(1, 'Permission is required'),
});

// 🏆 RUTAS ALVAE 🏆

// Crear cuenta ALVAE (solo para super admins)
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']), // Solo admins pueden crear cuentas ALVAE
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validateBody(createAlvaeAccountSchema),
  alvaeController.createAlvaeAccount
);

// Obtener cuenta ALVAE específica
router.get(
  '/:userId',
  authenticate,
  authorize(['ADMIN']), // Solo admins pueden ver cuentas ALVAE
  validateParams(userIdSchema),
  alvaeController.getAlvaeAccount
);

// Listar todas las cuentas ALVAE
router.get(
  '/',
  authenticate,
  authorize(['ADMIN']), // Solo admins pueden listar cuentas ALVAE
  rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
  alvaeController.listAlvaeAccounts
);

// Actualizar cuenta ALVAE
router.put(
  '/:userId',
  authenticate,
  authorize(['ADMIN']), // Solo admins pueden actualizar cuentas ALVAE
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  validateParams(userIdSchema),
  validateBody(updateAlvaeAccountSchema),
  alvaeController.updateAlvaeAccount
);

// Eliminar cuenta ALVAE
router.delete(
  '/:userId',
  authenticate,
  authorize(['ADMIN']), // Solo admins pueden eliminar cuentas ALVAE
  rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 requests per 15 minutes
  validateParams(userIdSchema),
  alvaeController.deleteAlvaeAccount
);

// Verificar permisos ALVAE
router.get(
  '/:userId/permissions',
  authenticate,
  authorize(['ADMIN']), // Solo admins pueden verificar permisos
  validateParams(userIdSchema),
  validateQuery(permissionQuerySchema),
  alvaeController.checkAlvaePermissions
);

// Obtener estadísticas ALVAE
router.get(
  '/stats/overview',
  authenticate,
  authorize(['ADMIN']), // Solo admins pueden ver estadísticas
  rateLimit({ windowMs: 60 * 1000, max: 20 }), // 20 requests per minute
  alvaeController.getAlvaeStats
);

// Inicializar cuentas ALVAE predefinidas (solo para super admin)
router.post(
  '/initialize',
  authenticate,
  authorize(['ADMIN']), // Solo super admins pueden inicializar
  rateLimit({ windowMs: 60 * 60 * 1000, max: 1 }), // 1 request per hour
  alvaeController.initializeAlvaeAccounts
);

export default router;
