/**
 * 🔐 AUTH SERVICE - Servicio de Autenticación
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, UserRole, UserTier } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tier: UserTier;
  alvaeSymbol: boolean;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: Omit<User, 'password'>;
  tokens: AuthTokens;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(400, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        tier: 'FREE',
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password } = credentials;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(401, 'Account is deactivated');
    }

    // Verify password
    if (!user.password) {
      throw new AppError(401, 'Please use OAuth to login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Generate JWT tokens for user
   */
  async generateTokens(user: User): Promise<AuthTokens> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
      alvaeSymbol: user.alvaeSymbol,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshExpiresIn,
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'Invalid refresh token');
      }

      return await this.generateTokens(user);
    } catch (error) {
      throw new AppError(401, 'Invalid refresh token');
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'User not found or inactive');
      }

      return decoded;
    } catch (error) {
      throw new AppError(401, 'Invalid token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: Partial<Pick<User, 'name' | 'avatar'>>
  ): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new AppError(400, 'User not found or no password set');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new AppError(400, 'Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    // Soft delete - mark as inactive
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  /**
   * Check if user has permission
   */
  async hasPermission(
    userId: string,
    permission: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminUsers: true,
      },
    });

    if (!user) {
      return false;
    }

    // Check admin permissions
    if (user.adminUsers.length > 0) {
      const adminUser = user.adminUsers[0];
      return adminUser.permissions.includes(permission);
    }

    // Check tier-based permissions
    const tierPermissions = this.getTierPermissions(user.tier);
    return tierPermissions.includes(permission);
  }

  /**
   * Get permissions for user tier (Modelo corregido)
   */
  private getTierPermissions(tier: UserTier): string[] {
    const permissions = {
      FREE: [
        'generate:music:limited', // Solo 5 generaciones totales
        'download:audio:blocked', // No pueden descargar
        'share:social:watermark', // Solo compartir con marca de agua
        'tool:pixel-basic', // Solo acceso básico a pixel
        'feature:basic-generation',
        'feature:watermark-share',
      ],
      PRO: [
        'generate:music',
        'generate:lyrics',
        'download:audio:extended', // 10 downloads
        'share:social:limited', // 5 shares
        'chat:message',
        'marketing:schedule',
        'tool:pixel-basic',
        'tool:music-generator',
        'tool:ghost-studio',
        'tool:nova-post',
        'feature:basic-generation',
        'feature:lyrics',
        'feature:projects',
        'feature:marketing',
      ],
      PREMIUM: [
        'generate:music',
        'generate:lyrics',
        'download:audio:premium', // 25 downloads
        'share:social:premium', // 15 shares
        'chat:message',
        'chat:create_room',
        'marketing:schedule',
        'marketing:analytics',
        'collaborate:project',
        'export:project',
        'tool:pixel-basic',
        'tool:music-generator',
        'tool:ghost-studio',
        'tool:nova-post',
        'tool:sanctuary-social',
        'tool:nexus-visual',
        'feature:basic-generation',
        'feature:lyrics',
        'feature:projects',
        'feature:marketing',
        'feature:collaboration',
        'nexus:activate',
      ],
      ENTERPRISE: [
        // All permissions
        'generate:music',
        'generate:lyrics',
        'download:audio:unlimited',
        'share:social:unlimited',
        'chat:message',
        'chat:create_room',
        'chat:moderate',
        'marketing:schedule',
        'marketing:analytics',
        'collaborate:project',
        'export:project',
        'tool:all',
        'feature:all',
        'nexus:activate',
        'admin:panel',
        'admin:users',
        'admin:config',
      ],
    };

    return permissions[tier] || [];
  }

  /**
   * Check if user can activate Nexus mode
   */
  async canActivateNexus(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // Check if user has alvae symbol or is admin/tester
    if (user.alvaeSymbol || user.role === 'ADMIN' || user.role === 'TESTER') {
      return true;
    }

    // Check if user has nexus permission
    return await this.hasPermission(userId, 'nexus:activate');
  }
}

export const authService = new AuthService();
