import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AlvaeAccountsService } from '@/services/admin/alvae-accounts.service';
import { asyncHandler } from '@/utils/async-handler';
import { sendSuccess, sendError } from '@/utils/responses';
import { logger } from '@/utils/logger';
import { AppError, ValidationError, NotFoundError } from '@/utils/errors';

// 🏆 ALVAE ACCOUNTS CONTROLLER 🏆

export class AlvaeAccountsController {
  private alvaeService: AlvaeAccountsService;

  constructor(private prisma: PrismaClient) {
    this.alvaeService = new AlvaeAccountsService(prisma);
  }

  // 🏆 CREAR CUENTA ALVAE 🏆
  createAlvaeAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, role, tier, alvaeSymbol, alvaeColor, permissions, isBlindado } = req.body;

    // Validar campos requeridos
    if (!email || !name || !role || !tier || !alvaeSymbol || !alvaeColor || !permissions) {
      throw new ValidationError('Missing required fields');
    }

    // Validar rol ALVAE
    const validRoles = ['ALVAE_FOUNDER', 'ALVAE_PARTNER', 'ALVAE_TESTER', 'ALVAE_ADMIN'];
    if (!validRoles.includes(role)) {
      throw new ValidationError('Invalid ALVAE role');
    }

    // Validar tier ALVAE
    const validTiers = ['ALVAE_FOUNDER', 'ALVAE_PARTNER', 'ALVAE_TESTER', 'ALVAE_ADMIN'];
    if (!validTiers.includes(tier)) {
      throw new ValidationError('Invalid ALVAE tier');
    }

    const accountData = {
      email,
      name,
      role,
      tier,
      alvaeSymbol,
      alvaeColor,
      permissions: Array.isArray(permissions) ? permissions : [permissions],
      isBlindado: Boolean(isBlindado),
    };

    const alvaeAccount = await this.alvaeService.createAlvaeAccount(accountData);

    logger.info({ 
      userId: alvaeAccount.id, 
      email: alvaeAccount.email, 
      role: alvaeAccount.role 
    }, 'ALVAE account created via API');

    sendSuccess(res, {
      message: 'ALVAE account created successfully',
      data: alvaeAccount,
    }, 201);
  });

  // 🏆 OBTENER CUENTA ALVAE 🏆
  getAlvaeAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const alvaeAccount = await this.alvaeService.getAlvaeAccount(userId);

    if (!alvaeAccount) {
      throw new NotFoundError('ALVAE account not found');
    }

    sendSuccess(res, {
      message: 'ALVAE account retrieved successfully',
      data: alvaeAccount,
    });
  });

  // 🏆 LISTAR CUENTAS ALVAE 🏆
  listAlvaeAccounts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const alvaeAccounts = await this.alvaeService.listAlvaeAccounts();

    logger.info({ count: alvaeAccounts.length }, 'ALVAE accounts listed via API');

    sendSuccess(res, {
      message: 'ALVAE accounts retrieved successfully',
      data: alvaeAccounts,
      count: alvaeAccounts.length,
    });
  });

  // 🏆 ACTUALIZAR CUENTA ALVAE 🏆
  updateAlvaeAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const updates = req.body;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Validar campos si se proporcionan
    if (updates.role) {
      const validRoles = ['ALVAE_FOUNDER', 'ALVAE_PARTNER', 'ALVAE_TESTER', 'ALVAE_ADMIN'];
      if (!validRoles.includes(updates.role)) {
        throw new ValidationError('Invalid ALVAE role');
      }
    }

    if (updates.tier) {
      const validTiers = ['ALVAE_FOUNDER', 'ALVAE_PARTNER', 'ALVAE_TESTER', 'ALVAE_ADMIN'];
      if (!validTiers.includes(updates.tier)) {
        throw new ValidationError('Invalid ALVAE tier');
      }
    }

    const alvaeAccount = await this.alvaeService.updateAlvaeAccount(userId, updates);

    logger.info({ userId }, 'ALVAE account updated via API');

    sendSuccess(res, {
      message: 'ALVAE account updated successfully',
      data: alvaeAccount,
    });
  });

  // 🏆 ELIMINAR CUENTA ALVAE 🏆
  deleteAlvaeAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const success = await this.alvaeService.deleteAlvaeAccount(userId);

    if (!success) {
      throw new AppError(500, 'Failed to delete ALVAE account');
    }

    logger.info({ userId }, 'ALVAE account deleted via API');

    sendSuccess(res, {
      message: 'ALVAE account deleted successfully',
    });
  });

  // 🏆 VERIFICAR PERMISOS ALVAE 🏆
  checkAlvaePermissions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { permission } = req.query;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    if (!permission) {
      throw new ValidationError('Permission is required');
    }

    const hasPermission = await this.alvaeService.checkAlvaePermissions(userId, permission as string);

    sendSuccess(res, {
      message: 'Permission check completed',
      data: {
        userId,
        permission,
        hasPermission,
      },
    });
  });

  // 🏆 OBTENER ESTADÍSTICAS ALVAE 🏆
  getAlvaeStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await this.alvaeService.getAlvaeStats();

    logger.info({ stats }, 'ALVAE stats retrieved via API');

    sendSuccess(res, {
      message: 'ALVAE statistics retrieved successfully',
      data: stats,
    });
  });

  // 🏆 INICIALIZAR CUENTAS ALVAE PREDEFINIDAS 🏆
  initializeAlvaeAccounts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const predefinedAccounts = [
      // FOUNDER
      {
        email: 'founder@son1kverse.com',
        name: 'Son1kVerse Founder',
        role: 'ALVAE_FOUNDER' as const,
        tier: 'ALVAE_FOUNDER' as const,
        alvaeSymbol: '👑',
        alvaeColor: '#FFD700',
        permissions: ['all', 'admin', 'billing', 'users', 'analytics', 'system'],
        isBlindado: true,
      },
      // PARTNER
      {
        email: 'partner@son1kverse.com',
        name: 'Son1kVerse Partner',
        role: 'ALVAE_PARTNER' as const,
        tier: 'ALVAE_PARTNER' as const,
        alvaeSymbol: '🤝',
        alvaeColor: '#00FFE7',
        permissions: ['admin', 'billing', 'users', 'analytics'],
        isBlindado: true,
      },
      // TESTERS (10 cuentas)
      ...Array.from({ length: 10 }, (_, i) => ({
        email: `tester${i + 1}@son1kverse.com`,
        name: `ALVAE Tester ${i + 1}`,
        role: 'ALVAE_TESTER' as const,
        tier: 'ALVAE_TESTER' as const,
        alvaeSymbol: '🧪',
        alvaeColor: '#B84DFF',
        permissions: ['test', 'feedback', 'report'],
        isBlindado: false,
      })),
    ];

    const createdAccounts = [];

    for (const accountData of predefinedAccounts) {
      try {
        // Verificar si ya existe
        const existing = await this.alvaeService.getAlvaeAccount(accountData.email);
        if (!existing) {
          const account = await this.alvaeService.createAlvaeAccount(accountData);
          createdAccounts.push(account);
        }
      } catch (error) {
        logger.error({ error, accountData }, 'Failed to create predefined ALVAE account');
      }
    }

    logger.info({ 
      total: predefinedAccounts.length, 
      created: createdAccounts.length 
    }, 'ALVAE accounts initialization completed');

    sendSuccess(res, {
      message: 'ALVAE accounts initialization completed',
      data: {
        total: predefinedAccounts.length,
        created: createdAccounts.length,
        accounts: createdAccounts,
      },
    });
  });
}
