/**
 * 🔐 AUTH CONTROLLER - Controlador de Autenticación
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password, and name are required',
        });
        return;
      }

      // Simulate user registration
      const user = {
        id: `user_${Date.now()}`,
        email,
        name,
        tier: 'FREE',
        createdAt: new Date().toISOString(),
      };

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user,
          message: 'User registered successfully',
        },
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
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
        return;
      }

      // Simulate user login
      const user = {
        id: `user_${Date.now()}`,
        email,
        name: 'Demo User',
        tier: 'FREE',
        createdAt: new Date().toISOString(),
      };

      const token = `jwt_token_${Date.now()}`;

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user,
          token,
          refreshToken: `refresh_${Date.now()}`,
          message: 'Login successful',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Simulate authenticated user
      const user = {
        id: `user_${Date.now()}`,
        email: 'demo@son1kvers3.com',
        name: 'Demo User',
        tier: 'FREE',
        createdAt: new Date().toISOString(),
        usage: {
          generationsUsed: 2,
          generationsRemaining: 3,
          downloadsUsed: 0,
          downloadsRemaining: 0,
          sharesUsed: 1,
          sharesRemaining: 4,
        },
      };

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
        return;
      }

      // Simulate token refresh
      const newToken = `jwt_token_${Date.now()}`;
      const newRefreshToken = `refresh_${Date.now()}`;

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
          message: 'Token refreshed successfully',
        },
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
      logger.info('User logged out');

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
