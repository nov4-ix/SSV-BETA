/**
 * 📥 DOWNLOAD & SHARE SERVICE - Servicio de Descargas y Compartir
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface DownloadLimit {
  tier: string;
  dailyDownloads: number;
  monthlyDownloads: number;
}

export interface ShareLimit {
  tier: string;
  dailyShares: number;
  monthlyShares: number;
}

export interface ToolAccess {
  tier: string;
  allowedTools: string[];
  restrictedTools: string[];
}

export class DownloadShareService {
  /**
   * Get download limits by tier (Modelo corregido)
   */
  getDownloadLimits(tier: string): DownloadLimit {
    const limits = {
      FREE: {
        tier: 'FREE',
        dailyDownloads: 0, // No pueden descargar
        monthlyDownloads: 0,
      },
      PRO: {
        tier: 'PRO',
        dailyDownloads: 10,
        monthlyDownloads: 300,
      },
      PREMIUM: {
        tier: 'PREMIUM',
        dailyDownloads: 25,
        monthlyDownloads: 750,
      },
      ENTERPRISE: {
        tier: 'ENTERPRISE',
        dailyDownloads: -1, // unlimited
        monthlyDownloads: -1,
      },
    };

    return limits[tier as keyof typeof limits] || limits.FREE;
  }

  /**
   * Get share limits by tier (Modelo corregido)
   */
  getShareLimits(tier: string): ShareLimit {
    const limits = {
      FREE: {
        tier: 'FREE',
        dailyShares: 5, // Solo compartir con marca de agua
        monthlyShares: 150,
      },
      PRO: {
        tier: 'PRO',
        dailyShares: 5,
        monthlyShares: 150,
      },
      PREMIUM: {
        tier: 'PREMIUM',
        dailyShares: 15,
        monthlyShares: 450,
      },
      ENTERPRISE: {
        tier: 'ENTERPRISE',
        dailyShares: -1, // unlimited
        monthlyShares: -1,
      },
    };

    return limits[tier as keyof typeof limits] || limits.FREE;
  }

  /**
   * Get tool access by tier (Modelo corregido)
   */
  getToolAccess(tier: string): ToolAccess {
    const allTools = [
      'pixel-basic',
      'music-generator',
      'ghost-studio',
      'nova-post',
      'sanctuary-social',
      'nexus-visual',
      'pixel-perfect',
    ];

    const access = {
      FREE: {
        tier: 'FREE',
        allowedTools: ['pixel-basic'], // Solo acceso básico a pixel
        restrictedTools: ['music-generator', 'ghost-studio', 'nova-post', 'sanctuary-social', 'nexus-visual', 'pixel-perfect'],
      },
      PRO: {
        tier: 'PRO',
        allowedTools: ['pixel-basic', 'music-generator', 'ghost-studio', 'nova-post'],
        restrictedTools: ['sanctuary-social', 'nexus-visual', 'pixel-perfect'],
      },
      PREMIUM: {
        tier: 'PREMIUM',
        allowedTools: ['pixel-basic', 'music-generator', 'ghost-studio', 'nova-post', 'sanctuary-social', 'nexus-visual'],
        restrictedTools: ['pixel-perfect'],
      },
      ENTERPRISE: {
        tier: 'ENTERPRISE',
        allowedTools: allTools,
        restrictedTools: [],
      },
    };

    return access[tier as keyof typeof access] || access.FREE;
  }

  /**
   * Check if user can download
   */
  async canDownload(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        usageStats: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const tier = user.subscription?.tier || 'FREE';
    const limits = this.getDownloadLimits(tier);

    if (limits.dailyDownloads === -1) {
      return true; // Unlimited
    }

    const todayDownloads = user.usageStats[0]?.downloadsUsed || 0;
    return todayDownloads < limits.dailyDownloads;
  }

  /**
   * Record download usage
   */
  async recordDownload(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.usageStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        downloadsUsed: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        downloadsUsed: 1,
      },
    });

    logger.info(`📥 Download recorded for user ${userId}`);
  }

  /**
   * Check if user can share
   */
  async canShare(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        usageStats: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const tier = user.subscription?.tier || 'FREE';
    const limits = this.getShareLimits(tier);

    if (limits.dailyShares === -1) {
      return true; // Unlimited
    }

    const todayShares = user.usageStats[0]?.sharesUsed || 0;
    return todayShares < limits.dailyShares;
  }

  /**
   * Record share usage with watermark check
   */
  async recordShare(userId: string, platform: string, hasWatermark: boolean = false): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const tier = user.subscription?.tier || 'FREE';

    // Para usuarios FREE: solo permitir shares con marca de agua
    if (tier === 'FREE' && !hasWatermark) {
      throw new AppError(403, 'Free users can only share with watermark');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.usageStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        sharesUsed: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        sharesUsed: 1,
      },
    });

    logger.info(`📤 Share recorded for user ${userId} on ${platform} ${hasWatermark ? 'with watermark' : 'without watermark'}`);
  }

  /**
   * Check if user can access tool
   */
  async canAccessTool(userId: string, toolName: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const tier = user.subscription?.tier || 'FREE';
    const access = this.getToolAccess(tier);

    return access.allowedTools.includes(toolName) || access.allowedTools.includes('all');
  }

  /**
   * Get user's usage summary
   */
  async getUserUsageSummary(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        usageStats: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const tier = user.subscription?.tier || 'FREE';
    const downloadLimits = this.getDownloadLimits(tier);
    const shareLimits = this.getShareLimits(tier);
    const toolAccess = this.getToolAccess(tier);

    const todayUsage = user.usageStats[0] || {
      downloadsUsed: 0,
      sharesUsed: 0,
      generationsUsed: 0,
    };

    return {
      tier,
      downloads: {
        used: todayUsage.downloadsUsed,
        limit: downloadLimits.dailyDownloads,
        remaining: downloadLimits.dailyDownloads === -1 
          ? -1 
          : Math.max(0, downloadLimits.dailyDownloads - todayUsage.downloadsUsed),
      },
      shares: {
        used: todayUsage.sharesUsed,
        limit: shareLimits.dailyShares,
        remaining: shareLimits.dailyShares === -1 
          ? -1 
          : Math.max(0, shareLimits.dailyShares - todayUsage.sharesUsed),
      },
      tools: {
        allowed: toolAccess.allowedTools,
        restricted: toolAccess.restrictedTools,
      },
    };
  }

  /**
   * Get tier comparison
   */
  getTierComparison(): any {
    return {
      FREE: {
        tier: 'FREE',
        dailyGenerations: 3,
        dailyDownloads: 3,
        dailyShares: 0,
        tools: ['music-generator'],
        price: 0,
      },
      PRO: {
        tier: 'PRO',
        dailyGenerations: 4,
        dailyDownloads: 10,
        dailyShares: 5,
        tools: ['music-generator', 'ghost-studio', 'nova-post'],
        price: 9.99,
      },
      PREMIUM: {
        tier: 'PREMIUM',
        dailyGenerations: 5,
        dailyDownloads: 25,
        dailyShares: 15,
        tools: ['music-generator', 'ghost-studio', 'nova-post', 'sanctuary-social', 'nexus-visual'],
        price: 19.99,
      },
      ENTERPRISE: {
        tier: 'ENTERPRISE',
        dailyGenerations: -1,
        dailyDownloads: -1,
        dailyShares: -1,
        tools: ['all'],
        price: 'Custom',
      },
    };
  }
}

export const downloadShareService = new DownloadShareService();
