import { PrismaClient } from '@prisma/client';
import { stripeService } from './stripe.service';
import { logger } from '@/utils/logger';
import { AppError, NotFoundError, ValidationError } from '@/utils/errors';

// 🏆 ALVAE ACCOUNTS SERVICE 🏆

export interface CreateAlvaeAccountRequest {
  email: string;
  name: string;
  role: 'ALVAE_FOUNDER' | 'ALVAE_PARTNER' | 'ALVAE_TESTER' | 'ALVAE_ADMIN';
  tier: 'ALVAE_FOUNDER' | 'ALVAE_PARTNER' | 'ALVAE_TESTER' | 'ALVAE_ADMIN';
  alvaeSymbol: string;
  alvaeColor: string;
  permissions: string[];
  isBlindado: boolean;
}

export interface AlvaeAccountResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  tier: string;
  alvaeSymbol: string;
  alvaeColor: string;
  permissions: string[];
  stripeCustomerId?: string;
  subscriptionStatus: string;
  isBlindado: boolean;
  createdAt: Date;
  lastActive: Date;
}

export class AlvaeAccountsService {
  constructor(private prisma: PrismaClient) {}

  // 🏆 CREAR CUENTA ALVAE 🏆
  async createAlvaeAccount(request: CreateAlvaeAccountRequest): Promise<AlvaeAccountResponse> {
    try {
      logger.info({ email: request.email, role: request.role }, 'Creating ALVAE account');

      // Verificar que el email no exista
      const existingUser = await this.prisma.user.findUnique({
        where: { email: request.email },
      });

      if (existingUser) {
        throw new ValidationError('Email already exists');
      }

      // Crear customer en Stripe
      const stripeCustomer = await stripeService.createAlvaeCustomer({
        email: request.email,
        name: request.name,
        alvaeRole: request.role,
        alvaeTier: request.tier,
        alvaeSymbol: request.alvaeSymbol,
      });

      // Crear usuario en la base de datos
      const user = await this.prisma.user.create({
        data: {
          email: request.email,
          name: request.name,
          role: 'ADMIN', // Todas las cuentas ALVAE son admin
          subscriptionTier: this.mapAlvaeTierToSubscriptionTier(request.tier),
          stripeCustomerId: stripeCustomer.id,
          generationsLimit: this.getAlvaeGenerationsLimit(request.tier),
          isEmailVerified: true,
          isActive: true,
        },
      });

      // Crear registro ALVAE específico
      const alvaeAccount = await this.prisma.alvaeAccount.create({
        data: {
          userId: user.id,
          role: request.role,
          tier: request.tier,
          alvaeSymbol: request.alvaeSymbol,
          alvaeColor: request.alvaeColor,
          permissions: request.permissions,
          isBlindado: request.isBlindado,
          stripeCustomerId: stripeCustomer.id,
        },
      });

      logger.info({ userId: user.id, alvaeId: alvaeAccount.id }, 'ALVAE account created successfully');

      return this.mapToResponse(user, alvaeAccount);

    } catch (error) {
      logger.error({ error, request }, 'Failed to create ALVAE account');
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to create ALVAE account');
    }
  }

  // 🏆 OBTENER CUENTA ALVAE 🏆
  async getAlvaeAccount(userId: string): Promise<AlvaeAccountResponse | null> {
    try {
      const alvaeAccount = await this.prisma.alvaeAccount.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!alvaeAccount) return null;

      return this.mapToResponse(alvaeAccount.user, alvaeAccount);

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get ALVAE account');
      return null;
    }
  }

  // 🏆 LISTAR CUENTAS ALVAE 🏆
  async listAlvaeAccounts(): Promise<AlvaeAccountResponse[]> {
    try {
      const alvaeAccounts = await this.prisma.alvaeAccount.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });

      return alvaeAccounts.map(account => this.mapToResponse(account.user, account));

    } catch (error) {
      logger.error({ error }, 'Failed to list ALVAE accounts');
      return [];
    }
  }

  // 🏆 ACTUALIZAR CUENTA ALVAE 🏆
  async updateAlvaeAccount(userId: string, updates: Partial<CreateAlvaeAccountRequest>): Promise<AlvaeAccountResponse> {
    try {
      logger.info({ userId, updates }, 'Updating ALVAE account');

      const alvaeAccount = await this.prisma.alvaeAccount.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!alvaeAccount) {
        throw new NotFoundError('ALVAE account not found');
      }

      // Actualizar usuario si es necesario
      if (updates.email || updates.name) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            ...(updates.email && { email: updates.email }),
            ...(updates.name && { name: updates.name }),
          },
        });
      }

      // Actualizar cuenta ALVAE
      const updatedAlvaeAccount = await this.prisma.alvaeAccount.update({
        where: { userId },
        data: {
          ...(updates.role && { role: updates.role }),
          ...(updates.tier && { tier: updates.tier }),
          ...(updates.alvaeSymbol && { alvaeSymbol: updates.alvaeSymbol }),
          ...(updates.alvaeColor && { alvaeColor: updates.alvaeColor }),
          ...(updates.permissions && { permissions: updates.permissions }),
          ...(updates.isBlindado !== undefined && { isBlindado: updates.isBlindado }),
        },
        include: { user: true },
      });

      logger.info({ userId }, 'ALVAE account updated successfully');

      return this.mapToResponse(updatedAlvaeAccount.user, updatedAlvaeAccount);

    } catch (error) {
      logger.error({ error, userId }, 'Failed to update ALVAE account');
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update ALVAE account');
    }
  }

  // 🏆 ELIMINAR CUENTA ALVAE 🏆
  async deleteAlvaeAccount(userId: string): Promise<boolean> {
    try {
      logger.info({ userId }, 'Deleting ALVAE account');

      const alvaeAccount = await this.prisma.alvaeAccount.findUnique({
        where: { userId },
      });

      if (!alvaeAccount) {
        throw new NotFoundError('ALVAE account not found');
      }

      // Cancelar suscripción en Stripe si existe
      if (alvaeAccount.stripeCustomerId) {
        await stripeService.cancelAlvaeSubscription(alvaeAccount.stripeCustomerId, true);
      }

      // Eliminar cuenta ALVAE
      await this.prisma.alvaeAccount.delete({
        where: { userId },
      });

      // Eliminar usuario
      await this.prisma.user.delete({
        where: { id: userId },
      });

      logger.info({ userId }, 'ALVAE account deleted successfully');
      return true;

    } catch (error) {
      logger.error({ error, userId }, 'Failed to delete ALVAE account');
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to delete ALVAE account');
    }
  }

  // 🏆 VERIFICAR PERMISOS ALVAE 🏆
  async checkAlvaePermissions(userId: string, requiredPermission: string): Promise<boolean> {
    try {
      const alvaeAccount = await this.prisma.alvaeAccount.findUnique({
        where: { userId },
      });

      if (!alvaeAccount) return false;

      return alvaeAccount.permissions.includes(requiredPermission) || 
             alvaeAccount.permissions.includes('all');

    } catch (error) {
      logger.error({ error, userId }, 'Failed to check ALVAE permissions');
      return false;
    }
  }

  // 🏆 OBTENER ESTADÍSTICAS ALVAE 🏆
  async getAlvaeStats(): Promise<{
    total: number;
    founders: number;
    partners: number;
    testers: number;
    admins: number;
    active: number;
    blindado: number;
  }> {
    try {
      const accounts = await this.prisma.alvaeAccount.findMany({
        include: { user: true },
      });

      const stats = {
        total: accounts.length,
        founders: accounts.filter(a => a.role === 'ALVAE_FOUNDER').length,
        partners: accounts.filter(a => a.role === 'ALVAE_PARTNER').length,
        testers: accounts.filter(a => a.role === 'ALVAE_TESTER').length,
        admins: accounts.filter(a => a.role === 'ALVAE_ADMIN').length,
        active: accounts.filter(a => a.user.isActive).length,
        blindado: accounts.filter(a => a.isBlindado).length,
      };

      return stats;

    } catch (error) {
      logger.error({ error }, 'Failed to get ALVAE stats');
      return {
        total: 0,
        founders: 0,
        partners: 0,
        testers: 0,
        admins: 0,
        active: 0,
        blindado: 0,
      };
    }
  }

  // 🏆 MAPPER FUNCTIONS 🏆
  private mapToResponse(user: any, alvaeAccount: any): AlvaeAccountResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: alvaeAccount.role,
      tier: alvaeAccount.tier,
      alvaeSymbol: alvaeAccount.alvaeSymbol,
      alvaeColor: alvaeAccount.alvaeColor,
      permissions: alvaeAccount.permissions,
      stripeCustomerId: alvaeAccount.stripeCustomerId,
      subscriptionStatus: user.subscriptionTier.toLowerCase(),
      isBlindado: alvaeAccount.isBlindado,
      createdAt: user.createdAt,
      lastActive: user.lastLoginAt || user.createdAt,
    };
  }

  private mapAlvaeTierToSubscriptionTier(tier: string): 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' {
    switch (tier) {
      case 'ALVAE_FOUNDER':
      case 'ALVAE_PARTNER':
        return 'ENTERPRISE';
      case 'ALVAE_TESTER':
        return 'PRO';
      case 'ALVAE_ADMIN':
        return 'PRO';
      default:
        return 'FREE';
    }
  }

  private getAlvaeGenerationsLimit(tier: string): number {
    switch (tier) {
      case 'ALVAE_FOUNDER':
        return 10000; // Ilimitado prácticamente
      case 'ALVAE_PARTNER':
        return 5000;
      case 'ALVAE_TESTER':
        return 1000;
      case 'ALVAE_ADMIN':
        return 2000;
      default:
        return 10;
    }
  }
}
