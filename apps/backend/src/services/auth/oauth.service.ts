/**
 * 🔐 OAUTH SERVICE - Servicio OAuth2
 */

import { PrismaClient, User, OAuthProvider } from '@prisma/client';
import { AppError } from '../../utils/errors';
import { AuthService } from './auth.service';

const prisma = new PrismaClient();

export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider: OAuthProvider;
}

export interface OAuthResult {
  user: Omit<User, 'password'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  isNewUser: boolean;
}

export class OAuthService {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handle OAuth callback and create/login user
   */
  async handleOAuthCallback(
    profile: OAuthProfile
  ): Promise<OAuthResult> {
    const { id, email, name, avatar, provider } = profile;

    // Check if OAuth account exists
    const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId: id,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingOAuthAccount) {
      // User exists, login
      const user = existingOAuthAccount.user;
      
      if (!user.isActive) {
        throw new AppError(401, 'Account is deactivated');
      }

      const tokens = await this.authService.generateTokens(user);
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
        isNewUser: false,
      };
    }

    // Check if user exists with same email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Link OAuth account to existing user
      await prisma.oAuthAccount.create({
        data: {
          provider,
          providerId: id,
          userId: existingUser.id,
        },
      });

      const tokens = await this.authService.generateTokens(existingUser);
      const { password: _, ...userWithoutPassword } = existingUser;

      return {
        user: userWithoutPassword,
        tokens,
        isNewUser: false,
      };
    }

    // Create new user with OAuth account
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        avatar,
        role: 'USER',
        tier: 'FREE',
        emailVerified: true, // OAuth emails are considered verified
        oauthAccounts: {
          create: {
            provider,
            providerId: id,
          },
        },
      },
    });

    const tokens = await this.authService.generateTokens(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      tokens,
      isNewUser: true,
    };
  }

  /**
   * Link OAuth account to existing user
   */
  async linkOAuthAccount(
    userId: string,
    profile: OAuthProfile
  ): Promise<void> {
    const { id, provider } = profile;

    // Check if OAuth account already exists
    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId: id,
        },
      },
    });

    if (existingAccount) {
      throw new AppError(400, 'OAuth account already linked to another user');
    }

    // Check if user already has this provider linked
    const userAccount = await prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider,
      },
    });

    if (userAccount) {
      throw new AppError(400, 'OAuth account already linked to this user');
    }

    // Link account
    await prisma.oAuthAccount.create({
      data: {
        provider,
        providerId: id,
        userId,
      },
    });
  }

  /**
   * Unlink OAuth account from user
   */
  async unlinkOAuthAccount(
    userId: string,
    provider: OAuthProvider
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check if user has password (can't unlink if no other auth method)
    if (!user.password && user.oauthAccounts.length <= 1) {
      throw new AppError(400, 'Cannot unlink last authentication method');
    }

    // Remove OAuth account
    await prisma.oAuthAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    });
  }

  /**
   * Get user's linked OAuth accounts
   */
  async getUserOAuthAccounts(userId: string): Promise<OAuthAccount[]> {
    return await prisma.oAuthAccount.findMany({
      where: { userId },
    });
  }

  /**
   * Validate OAuth profile data
   */
  validateOAuthProfile(profile: any, provider: OAuthProvider): OAuthProfile {
    switch (provider) {
      case 'GOOGLE':
        return {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          provider: 'GOOGLE',
        };

      case 'FACEBOOK':
        return {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          provider: 'FACEBOOK',
        };

      case 'TIKTOK':
        return {
          id: profile.id,
          email: profile.email,
          name: profile.display_name,
          avatar: profile.avatar_url,
          provider: 'TIKTOK',
        };

      default:
        throw new AppError(400, `Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(provider: OAuthProvider): string {
    const baseUrls = {
      GOOGLE: 'https://accounts.google.com/oauth/authorize',
      FACEBOOK: 'https://www.facebook.com/v18.0/dialog/oauth',
      TIKTOK: 'https://www.tiktok.com/auth/authorize',
    };

    const clientIds = {
      GOOGLE: process.env.GOOGLE_CLIENT_ID,
      FACEBOOK: process.env.FACEBOOK_CLIENT_ID,
      TIKTOK: process.env.TIKTOK_CLIENT_ID,
    };

    const redirectUris = {
      GOOGLE: `${process.env.APP_URL}/api/auth/google/callback`,
      FACEBOOK: `${process.env.APP_URL}/api/auth/facebook/callback`,
      TIKTOK: `${process.env.APP_URL}/api/auth/tiktok/callback`,
    };

    const baseUrl = baseUrls[provider];
    const clientId = clientIds[provider];
    const redirectUri = redirectUris[provider];

    if (!clientId || !redirectUri) {
      throw new AppError(500, `OAuth provider ${provider} not configured`);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: this.getOAuthScope(provider),
      state: this.generateState(),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get OAuth scope for provider
   */
  private getOAuthScope(provider: OAuthProvider): string {
    const scopes = {
      GOOGLE: 'openid email profile',
      FACEBOOK: 'email public_profile',
      TIKTOK: 'user.info.basic',
    };

    return scopes[provider];
  }

  /**
   * Generate random state for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

export const oauthService = new OAuthService();
