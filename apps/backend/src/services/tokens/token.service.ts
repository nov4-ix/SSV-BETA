/**
 * 🪙 TOKEN SYSTEM - Sistema de Tokens Compartidos
 */

import { PrismaClient, TokenType, TokenStatus } from '@prisma/client';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface TokenPool {
  freeTokens: number;
  paidTokens: number;
  totalTokens: number;
  lastRotation: Date;
}

export interface TokenAllocation {
  userId: string;
  freeTokens: number;
  paidTokens: number;
  totalAllocated: number;
}

export interface TokenUsage {
  userId: string;
  tokensUsed: number;
  tokensRemaining: number;
  tier: string;
}

export class TokenSystem {
  /**
   * Initialize token pool for the day (incluyendo tokens de clientes únicos)
   */
  async initializeDailyTokenPool(): Promise<TokenPool> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if pool already exists for today
    const existingPool = await prisma.tokenPool.findFirst({
      where: {
        date: today,
      },
    });

    if (existingPool) {
      return {
        freeTokens: existingPool.freeTokens,
        paidTokens: existingPool.paidTokens,
        totalTokens: existingPool.totalTokens,
        lastRotation: existingPool.lastRotation,
      };
    }

    // Get tokens from unique clients
    const clientTokens = await this.getClientTokens();
    
    // Base tokens + client tokens
    const totalFreeTokens = 1000 + clientTokens.freeTokens; // Base + clientes únicos
    const totalPaidTokens = 2000 + clientTokens.paidTokens; // Base + clientes únicos

    const pool = await prisma.tokenPool.create({
      data: {
        date: today,
        freeTokens: totalFreeTokens,
        paidTokens: totalPaidTokens,
        totalTokens: totalFreeTokens + totalPaidTokens,
        lastRotation: new Date(),
      },
    });

    logger.info(`🪙 Daily token pool initialized: ${totalFreeTokens} free + ${totalPaidTokens} paid (${clientTokens.totalClients} unique clients contributed)`);

    return {
      freeTokens: pool.freeTokens,
      paidTokens: pool.paidTokens,
      totalTokens: pool.totalTokens,
      lastRotation: pool.lastRotation,
    };
  }

  /**
   * Get tokens contributed by unique clients
   */
  private async getClientTokens(): Promise<{ freeTokens: number; paidTokens: number; totalClients: number }> {
    const { clientTrackingService } = await import('../analytics/client-tracking.service');
    
    const totalClientTokens = await clientTrackingService.getTotalClientTokens();
    const clientStats = await clientTrackingService.getClientStats();
    
    // Distribute client tokens: 70% to free pool, 30% to paid pool
    const freeTokens = Math.floor(totalClientTokens * 0.7);
    const paidTokens = Math.floor(totalClientTokens * 0.3);
    
    return {
      freeTokens,
      paidTokens,
      totalClients: clientStats.totalClients,
    };
  }

  /**
   * Allocate tokens to users based on their tier
   */
  async allocateTokensToUsers(): Promise<TokenAllocation[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      include: {
        subscription: true,
      },
    });

    const allocations: TokenAllocation[] = [];

    for (const user of users) {
      const tier = user.subscription?.tier || 'FREE';
      const allocation = this.calculateTokenAllocation(tier);
      
      // Create or update user token allocation
      await prisma.userTokenAllocation.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
        update: {
          freeTokens: allocation.freeTokens,
          paidTokens: allocation.paidTokens,
          totalAllocated: allocation.totalAllocated,
        },
        create: {
          userId: user.id,
          date: today,
          freeTokens: allocation.freeTokens,
          paidTokens: allocation.paidTokens,
          totalAllocated: allocation.totalAllocated,
        },
      });

      allocations.push({
        userId: user.id,
        ...allocation,
      });
    }

    logger.info(`🪙 Allocated tokens to ${users.length} users`);
    return allocations;
  }

  /**
   * Calculate token allocation based on user tier (Modelo 3-4-5 corregido)
   */
  private calculateTokenAllocation(tier: string): { freeTokens: number; paidTokens: number; totalAllocated: number } {
    const allocations = {
      FREE: { freeTokens: 5, paidTokens: 0, totalAllocated: 5 }, // Solo 5 generaciones totales
      PRO: { freeTokens: 2, paidTokens: 2, totalAllocated: 4 },
      PREMIUM: { freeTokens: 1, paidTokens: 4, totalAllocated: 5 },
      ENTERPRISE: { freeTokens: 0, paidTokens: 100, totalAllocated: 100 },
    };

    return allocations[tier as keyof typeof allocations] || allocations.FREE;
  }

  /**
   * Use tokens for generation
   */
  async useTokens(userId: string, tokensNeeded: number = 1): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user's token allocation
    const allocation = await prisma.userTokenAllocation.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!allocation) {
      throw new AppError(404, 'Token allocation not found');
    }

    // Check if user has enough tokens
    if (allocation.tokensUsed + tokensNeeded > allocation.totalAllocated) {
      return false;
    }

    // Use tokens (prioritize free tokens first)
    let freeTokensUsed = Math.min(tokensNeeded, allocation.freeTokens - allocation.freeTokensUsed);
    let paidTokensUsed = tokensNeeded - freeTokensUsed;

    // Update token usage
    await prisma.userTokenAllocation.update({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      data: {
        freeTokensUsed: allocation.freeTokensUsed + freeTokensUsed,
        paidTokensUsed: allocation.paidTokensUsed + paidTokensUsed,
        tokensUsed: allocation.tokensUsed + tokensNeeded,
      },
    });

    logger.info(`🪙 User ${userId} used ${tokensNeeded} tokens (${freeTokensUsed} free + ${paidTokensUsed} paid)`);
    return true;
  }

  /**
   * Get user's token status
   */
  async getUserTokenStatus(userId: string): Promise<TokenUsage> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allocation = await prisma.userTokenAllocation.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      include: {
        user: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!allocation) {
      throw new AppError(404, 'Token allocation not found');
    }

    const tier = allocation.user.subscription?.tier || 'FREE';
    const tokensRemaining = allocation.totalAllocated - allocation.tokensUsed;

    return {
      userId,
      tokensUsed: allocation.tokensUsed,
      tokensRemaining,
      tier,
    };
  }

  /**
   * Rotate unused free tokens to paid users
   */
  async rotateUnusedFreeTokens(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all free token allocations
    const freeAllocations = await prisma.userTokenAllocation.findMany({
      where: {
        date: today,
        user: {
          subscription: {
            tier: 'FREE',
          },
        },
      },
    });

    // Calculate unused free tokens
    let totalUnusedFreeTokens = 0;
    for (const allocation of freeAllocations) {
      const unused = allocation.freeTokens - allocation.freeTokensUsed;
      if (unused > 0) {
        totalUnusedFreeTokens += unused;
      }
    }

    if (totalUnusedFreeTokens === 0) {
      logger.info('🪙 No unused free tokens to rotate');
      return;
    }

    // Get all paid users
    const paidUsers = await prisma.userTokenAllocation.findMany({
      where: {
        date: today,
        user: {
          subscription: {
            tier: {
              in: ['PRO', 'PREMIUM', 'ENTERPRISE'],
            },
          },
        },
      },
      orderBy: {
        user: {
          subscription: {
            tier: 'asc', // Prioritize PRO users
          },
        },
      },
    });

    // Distribute unused free tokens to paid users
    let tokensToDistribute = totalUnusedFreeTokens;
    for (const paidUser of paidUsers) {
      if (tokensToDistribute <= 0) break;

      // Calculate how many tokens this user can receive
      const maxTokensPerUser = this.getMaxTokensPerUser(paidUser.user.subscription?.tier || 'PRO');
      const tokensToGive = Math.min(tokensToDistribute, maxTokensPerUser);

      if (tokensToGive > 0) {
        // Add tokens to paid user
        await prisma.userTokenAllocation.update({
          where: {
            userId_date: {
              userId: paidUser.userId,
              date: today,
            },
          },
          data: {
            paidTokens: paidUser.paidTokens + tokensToGive,
            totalAllocated: paidUser.totalAllocated + tokensToGive,
          },
        });

        tokensToDistribute -= tokensToGive;
        logger.info(`🪙 Rotated ${tokensToGive} tokens to ${paidUser.userId}`);
      }
    }

    // Update pool
    await prisma.tokenPool.update({
      where: {
        date: today,
      },
      data: {
        freeTokensRotated: totalUnusedFreeTokens,
        lastRotation: new Date(),
      },
    });

    logger.info(`🪙 Rotated ${totalUnusedFreeTokens} unused free tokens to paid users`);
  }

  /**
   * Get maximum tokens per user based on tier
   */
  private getMaxTokensPerUser(tier: string): number {
    const maxTokens = {
      PRO: 20,
      PREMIUM: 100,
      ENTERPRISE: 200,
    };

    return maxTokens[tier as keyof typeof maxTokens] || 20;
  }

  /**
   * Get token pool status
   */
  async getTokenPoolStatus(): Promise<TokenPool> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pool = await prisma.tokenPool.findFirst({
      where: {
        date: today,
      },
    });

    if (!pool) {
      return await this.initializeDailyTokenPool();
    }

    return {
      freeTokens: pool.freeTokens,
      paidTokens: pool.paidTokens,
      totalTokens: pool.totalTokens,
      lastRotation: pool.lastRotation,
    };
  }

  /**
   * Get token analytics
   */
  async getTokenAnalytics(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalAllocations,
      totalUsage,
      freeUsers,
      paidUsers,
      poolStatus,
    ] = await Promise.all([
      prisma.userTokenAllocation.aggregate({
        where: { date: today },
        _sum: { totalAllocated: true },
      }),
      prisma.userTokenAllocation.aggregate({
        where: { date: today },
        _sum: { tokensUsed: true },
      }),
      prisma.userTokenAllocation.count({
        where: {
          date: today,
          user: {
            subscription: {
              tier: 'FREE',
            },
          },
        },
      }),
      prisma.userTokenAllocation.count({
        where: {
          date: today,
          user: {
            subscription: {
              tier: {
                in: ['PRO', 'PREMIUM', 'ENTERPRISE'],
              },
            },
          },
        },
      }),
      this.getTokenPoolStatus(),
    ]);

    return {
      totalAllocated: totalAllocations._sum.totalAllocated || 0,
      totalUsed: totalUsage._sum.tokensUsed || 0,
      totalRemaining: (totalAllocations._sum.totalAllocated || 0) - (totalUsage._sum.tokensUsed || 0),
      freeUsers,
      paidUsers,
      poolStatus,
      utilizationRate: totalAllocations._sum.totalAllocated 
        ? ((totalUsage._sum.tokensUsed || 0) / totalAllocations._sum.totalAllocated) * 100 
        : 0,
    };
  }

  /**
   * Daily token rotation job
   */
  async runDailyTokenRotation(): Promise<void> {
    logger.info('🪙 Starting daily token rotation...');

    try {
      // Initialize daily pool
      await this.initializeDailyTokenPool();

      // Allocate tokens to users
      await this.allocateTokensToUsers();

      // Rotate unused free tokens
      await this.rotateUnusedFreeTokens();

      logger.info('🪙 Daily token rotation completed successfully');
    } catch (error) {
      logger.error('🪙 Daily token rotation failed:', error);
      throw error;
    }
  }
}

export const tokenSystem = new TokenSystem();
