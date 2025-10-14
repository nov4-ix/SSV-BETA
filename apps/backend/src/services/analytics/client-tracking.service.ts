/**
 * 🌐 CLIENT TRACKING SERVICE - Servicio de Tracking de Clientes Únicos
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ClientInfo {
  browserFingerprint: string;
  userAgent: string;
  ipAddress: string;
  country?: string;
  city?: string;
  isNewClient: boolean;
  tokensContributed: number;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newClientsToday: number;
  tokensGenerated: number;
  clientsByCountry: Record<string, number>;
}

export class ClientTrackingService {
  /**
   * Generate browser fingerprint
   */
  generateBrowserFingerprint(userAgent: string, ipAddress: string): string {
    // Combine user agent + IP + timestamp for unique fingerprint
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Daily timestamp
    const fingerprint = `${userAgent}-${ipAddress}-${timestamp}`;
    
    // Create hash-like identifier
    return Buffer.from(fingerprint).toString('base64').substring(0, 32);
  }

  /**
   * Register new client (cada instalación de navegador)
   */
  async registerClient(
    userAgent: string,
    ipAddress: string,
    country?: string,
    city?: string
  ): Promise<ClientInfo> {
    const browserFingerprint = this.generateBrowserFingerprint(userAgent, ipAddress);
    
    // Check if client already exists
    const existingClient = await prisma.clientTracking.findUnique({
      where: { browserFingerprint },
    });

    if (existingClient) {
      // Update last seen
      await prisma.clientTracking.update({
        where: { browserFingerprint },
        data: {
          lastSeen: new Date(),
          visitCount: existingClient.visitCount + 1,
        },
      });

      return {
        browserFingerprint,
        userAgent,
        ipAddress,
        country: existingClient.country,
        city: existingClient.city,
        isNewClient: false,
        tokensContributed: existingClient.tokensContributed,
      };
    }

    // Create new client
    const newClient = await prisma.clientTracking.create({
      data: {
        browserFingerprint,
        userAgent,
        ipAddress,
        country: country || 'Unknown',
        city: city || 'Unknown',
        tokensContributed: this.calculateTokensPerClient(),
        visitCount: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        isActive: true,
      },
    });

    logger.info(`🌐 New client registered: ${browserFingerprint} from ${country || 'Unknown'}`);

    return {
      browserFingerprint,
      userAgent,
      ipAddress,
      country: newClient.country,
      city: newClient.city,
      isNewClient: true,
      tokensContributed: newClient.tokensContributed,
    };
  }

  /**
   * Calculate tokens contributed per client
   */
  private calculateTokensPerClient(): number {
    // Cada cliente único contribuye tokens al pool
    // Base: 10 tokens por cliente
    // Bonus por país: +5 tokens para países con menos usuarios
    return 10;
  }

  /**
   * Get total tokens from all clients
   */
  async getTotalClientTokens(): Promise<number> {
    const result = await prisma.clientTracking.aggregate({
      _sum: { tokensContributed: true },
      where: { isActive: true },
    });

    return result._sum.tokensContributed || 0;
  }

  /**
   * Get client statistics
   */
  async getClientStats(): Promise<ClientStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalClients,
      activeClients,
      newClientsToday,
      tokensGenerated,
      clientsByCountry,
    ] = await Promise.all([
      prisma.clientTracking.count(),
      prisma.clientTracking.count({
        where: { isActive: true },
      }),
      prisma.clientTracking.count({
        where: {
          firstSeen: {
            gte: today,
          },
        },
      }),
      this.getTotalClientTokens(),
      prisma.clientTracking.groupBy({
        by: ['country'],
        _count: { country: true },
        where: { isActive: true },
      }),
    ]);

    const countryStats: Record<string, number> = {};
    clientsByCountry.forEach((group) => {
      countryStats[group.country] = group._count.country;
    });

    return {
      totalClients,
      activeClients,
      newClientsToday,
      tokensGenerated,
      clientsByCountry: countryStats,
    };
  }

  /**
   * Update client activity
   */
  async updateClientActivity(browserFingerprint: string): Promise<void> {
    await prisma.clientTracking.updateMany({
      where: { browserFingerprint },
      data: {
        lastSeen: new Date(),
        visitCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Mark client as inactive (after 30 days of no activity)
   */
  async markInactiveClients(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.clientTracking.updateMany({
      where: {
        lastSeen: {
          lt: thirtyDaysAgo,
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    logger.info(`🌐 Marked ${result.count} clients as inactive`);
    return result.count;
  }

  /**
   * Get client by fingerprint
   */
  async getClient(browserFingerprint: string): Promise<any> {
    return await prisma.clientTracking.findUnique({
      where: { browserFingerprint },
    });
  }

  /**
   * Get top countries by client count
   */
  async getTopCountries(limit: number = 10): Promise<Array<{ country: string; count: number }>> {
    const result = await prisma.clientTracking.groupBy({
      by: ['country'],
      _count: { country: true },
      where: { isActive: true },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: limit,
    });

    return result.map((group) => ({
      country: group.country,
      count: group._count.country,
    }));
  }

  /**
   * Get daily client registrations
   */
  async getDailyClientRegistrations(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await prisma.clientTracking.groupBy({
      by: ['firstSeen'],
      _count: { firstSeen: true },
      where: {
        firstSeen: {
          gte: startDate,
        },
      },
      orderBy: {
        firstSeen: 'asc',
      },
    });

    return result.map((group) => ({
      date: group.firstSeen.toISOString().split('T')[0],
      count: group._count.firstSeen,
    }));
  }

  /**
   * Calculate bonus tokens for countries with fewer clients
   */
  async calculateCountryBonusTokens(): Promise<Record<string, number>> {
    const countryStats = await this.getTopCountries(50);
    const totalClients = countryStats.reduce((sum, country) => sum + country.count, 0);
    const avgClientsPerCountry = totalClients / countryStats.length;

    const bonusTokens: Record<string, number> = {};

    countryStats.forEach((country) => {
      if (country.count < avgClientsPerCountry) {
        // Countries with fewer clients get bonus tokens
        const bonus = Math.floor((avgClientsPerCountry - country.count) / 10) * 5;
        bonusTokens[country.country] = Math.max(0, bonus);
      }
    });

    return bonusTokens;
  }

  /**
   * Get client analytics for dashboard
   */
  async getClientAnalytics(): Promise<any> {
    const [
      stats,
      topCountries,
      dailyRegistrations,
      countryBonuses,
    ] = await Promise.all([
      this.getClientStats(),
      this.getTopCountries(10),
      this.getDailyClientRegistrations(7),
      this.calculateCountryBonusTokens(),
    ]);

    return {
      ...stats,
      topCountries,
      dailyRegistrations,
      countryBonuses,
      avgTokensPerClient: stats.totalClients > 0 ? stats.tokensGenerated / stats.totalClients : 0,
    };
  }
}

export const clientTrackingService = new ClientTrackingService();
