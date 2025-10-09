import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { UnauthorizedError } from '@/utils/errors';

interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'access' } as TokenPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
  
  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' } as TokenPayload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }
  
  generateTokenPair(userId: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId),
    };
  }
  
  verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;
      
      if (payload.type !== 'access') {
        throw new UnauthorizedError('Invalid token type');
      }
      
      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      throw error;
    }
  }
  
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
      
      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid token type');
      }
      
      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      throw error;
    }
  }
}

export const jwtService = new JWTService();
