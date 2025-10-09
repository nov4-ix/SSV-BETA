import { prisma } from '@/config/database.config';
import { hashPassword, comparePassword } from '@/utils/crypto';
import { jwtService } from './jwt.service';
import { 
  UnauthorizedError, 
  ConflictError, 
  NotFoundError,
  ValidationError 
} from '@/utils/errors';
import { User } from '@prisma/client';

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Hash password
    const passwordHash = await hashPassword(data.password);
    
    // Create user with FREE tier limits
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        subscriptionTier: 'FREE',
        generationsLimit: 5, // FREE: 3 modelo 3.5 + 2 modelo 5
        storageLimit: BigInt(1073741824), // 1GB
      },
    });
    
    // Generate tokens
    const tokens = jwtService.generateTokenPair(user.id);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    
    // Remove sensitive data
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      tokens,
    };
  }
  
  async login(data: LoginData): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    // Generate tokens
    const tokens = jwtService.generateTokenPair(user.id);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    
    // Remove sensitive data
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      tokens,
    };
  }
  
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    const payload = jwtService.verifyRefreshToken(refreshToken);
    
    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    
    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    
    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedError('Refresh token expired');
    }
    
    // Generate new access token
    const accessToken = jwtService.generateAccessToken(payload.userId);
    
    return { accessToken };
  }
  
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } else {
      // Logout from all devices
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }
  
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        subscriptionTier: true,
        generationsUsedThisMonth: true,
        generationsLimit: true,
        storageUsedBytes: true,
        storageLimit: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    return user;
  }
  
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
  
  async cleanupExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}

export const authService = new AuthService();
