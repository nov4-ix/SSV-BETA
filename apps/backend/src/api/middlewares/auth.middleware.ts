/**
 * 🔐 AUTH MIDDLEWARE - Middleware de Autenticación
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth/auth.service';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        tier: string;
        alvaeSymbol: boolean;
      };
    }
  }
}

export class AuthMiddleware {
  /**
   * Authenticate JWT token
   */
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(401, 'Authorization header missing or invalid');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        throw new AppError(401, 'Token is required');
      }

      // Verify token
      const decoded = await authService.verifyToken(token);

      // Add user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tier: decoded.tier,
        alvaeSymbol: decoded.alvaeSymbol,
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Optional authentication - doesn't fail if no token
   */
  async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        if (token) {
          try {
            const decoded = await authService.verifyToken(token);
            req.user = {
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role,
              tier: decoded.tier,
              alvaeSymbol: decoded.alvaeSymbol,
            };
          } catch (error) {
            // Token is invalid, but we don't fail the request
            logger.warn('Invalid token in optional auth:', error);
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError(401, 'Authentication required');
        }

        const hasPermission = await authService.hasPermission(req.user.userId, permission);

        if (!hasPermission) {
          throw new AppError(403, 'Insufficient permissions');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Check if user has admin role
   */
  async requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'TESTER') {
        throw new AppError(403, 'Admin access required');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user can activate Nexus mode
   */
  async requireNexusPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const canActivate = await authService.canActivateNexus(req.user.userId);

      if (!canActivate) {
        throw new AppError(403, 'Nexus mode activation not permitted');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user has specific tier
   */
  requireTier(tier: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError(401, 'Authentication required');
        }

        const tierHierarchy = ['FREE', 'PRO', 'PREMIUM', 'ENTERPRISE'];
        const userTierIndex = tierHierarchy.indexOf(req.user.tier);
        const requiredTierIndex = tierHierarchy.indexOf(tier);

        if (userTierIndex < requiredTierIndex) {
          throw new AppError(403, `${tier} tier required`);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Check if user has alvae symbol
   */
  async requireAlvaeSymbol(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      if (!req.user.alvaeSymbol) {
        throw new AppError(403, 'Alvae symbol required');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rate limiting per user
   */
  async rateLimitPerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        // For non-authenticated users, use IP-based rate limiting
        next();
        return;
      }

      // For authenticated users, implement user-based rate limiting
      // This would typically use Redis to track requests per user
      // For now, we'll just pass through
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user is active
   */
  async requireActiveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user || !user.isActive) {
        throw new AppError(401, 'Account is deactivated');
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate user ownership
   */
  validateOwnership(resourceUserIdField: string = 'userId') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError(401, 'Authentication required');
        }

        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

        if (!resourceUserId) {
          throw new AppError(400, 'Resource user ID is required');
        }

        // Allow if user is admin or owns the resource
        if (req.user.role === 'ADMIN' || req.user.userId === resourceUserId) {
          next();
          return;
        }

        throw new AppError(403, 'Access denied');
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Log authentication events
   */
  async logAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        logger.info(`Authenticated request from user ${req.user.userId} to ${req.path}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}

export const authMiddleware = new AuthMiddleware();
