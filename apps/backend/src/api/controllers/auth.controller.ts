/**
 * 🔐 AUTH CONTROLLER - Controlador de Autenticación
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../../services/auth/auth.service';
import { oauthService } from '../../services/auth/oauth.service';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { name, email, password } = validatedData;

      const result = await authService.register({
        name,
        email,
        password,
      });

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      const result = await authService.login({
        email,
        password,
      });

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError(400, 'Refresh token is required');
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(userId, validatedData);

      logger.info(`User profile updated: ${userId}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const validatedData = changePasswordSchema.parse(req.body);
      const { currentPassword, newPassword } = validatedData;

      await authService.changePassword(userId, currentPassword, newPassword);

      logger.info(`User password changed: ${userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      await authService.deleteAccount(userId);

      logger.info(`User account deleted: ${userId}`);

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return success
      
      logger.info(`User logged out: ${req.user?.userId}`);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get OAuth authorization URL
   */
  async getOAuthUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider } = req.params;

      if (!['google', 'facebook', 'tiktok'].includes(provider)) {
        throw new AppError(400, 'Invalid OAuth provider');
      }

      const authUrl = oauthService.getAuthorizationUrl(provider.toUpperCase() as any);

      res.json({
        success: true,
        data: { authUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;

      if (!code) {
        throw new AppError(400, 'Authorization code is required');
      }

      // In a real implementation, you would:
      // 1. Exchange code for access token
      // 2. Get user profile from OAuth provider
      // 3. Create or login user

      // For now, we'll return a mock response
      res.json({
        success: true,
        message: 'OAuth callback handled successfully',
        data: {
          provider,
          code,
          state,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user can activate Nexus mode
   */
  async checkNexusPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const canActivate = await authService.canActivateNexus(userId);

      res.json({
        success: true,
        data: { canActivate },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user permissions
   */
  async getPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const user = await authService.getUserById(userId);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Get permissions based on user tier and role
      const permissions = await this.getUserPermissions(user);

      res.json({
        success: true,
        data: { permissions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user permissions based on tier and role
   */
  private async getUserPermissions(user: any): Promise<string[]> {
    const permissions: string[] = [];

    // Add tier-based permissions
    const tierPermissions = this.getTierPermissions(user.tier);
    permissions.push(...tierPermissions);

    // Add role-based permissions
    if (user.role === 'ADMIN' || user.role === 'TESTER') {
      permissions.push('admin:panel', 'nexus:activate');
    }

    // Add alvae symbol permissions
    if (user.alvaeSymbol) {
      permissions.push('nexus:activate', 'admin:panel');
    }

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Get tier-based permissions
   */
  private getTierPermissions(tier: string): string[] {
    const permissions = {
      FREE: [
        'generate:music',
        'download:audio',
        'chat:message',
      ],
      PRO: [
        'generate:music',
        'generate:lyrics',
        'download:audio',
        'create:project',
        'chat:message',
        'marketing:schedule',
      ],
      PREMIUM: [
        'generate:music',
        'generate:lyrics',
        'download:audio',
        'create:project',
        'collaborate:project',
        'export:project',
        'chat:message',
        'chat:create_room',
        'marketing:schedule',
        'marketing:analytics',
        'nexus:activate',
      ],
      ENTERPRISE: [
        'generate:music',
        'generate:lyrics',
        'download:audio',
        'create:project',
        'collaborate:project',
        'export:project',
        'chat:message',
        'chat:create_room',
        'chat:moderate',
        'marketing:schedule',
        'marketing:analytics',
        'nexus:activate',
        'admin:panel',
        'admin:users',
        'admin:config',
      ],
    };

    return permissions[tier as keyof typeof permissions] || permissions.FREE;
  }
}

export const authController = new AuthController();
