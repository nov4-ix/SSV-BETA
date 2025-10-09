import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth/auth.service';
import { asyncHandler } from '@/utils/async-handler';
import { sendSuccess, sendCreated } from '@/utils/responses';

export class AuthController {
  register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.register(req.body);
      sendCreated(res, result, 'User registered successfully');
    }
  );
  
  login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 200, 'Login successful');
    }
  );
  
  refreshToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      sendSuccess(res, result);
    }
  );
  
  logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;
      await authService.logout(req.userId!, refreshToken);
      sendSuccess(res, null, 200, 'Logout successful');
    }
  );
  
  getProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const profile = await authService.getProfile(req.userId!);
      sendSuccess(res, profile);
    }
  );
}

export const authController = new AuthController();
