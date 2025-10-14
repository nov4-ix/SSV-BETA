/**
 * 📊 ANALYTICS CONTROLLER - Controlador de Analytics
 */

import { Request, Response, NextFunction } from 'express';
import { clientTrackingService } from '../../services/analytics/client-tracking.service';
import { tokenSystem } from '../../services/tokens/token.service';
import { downloadShareService } from '../../services/tools/download-share.service';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export class AnalyticsController {
  /**
   * Get client analytics
   */
  async getClientAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await clientTrackingService.getClientAnalytics();
      
      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get token analytics
   */
  async getTokenAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await tokenSystem.getTokenAnalytics();
      
      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tier comparison
   */
  async getTierComparison(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comparison = downloadShareService.getTierComparison();
      
      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system overview
   */
  async getSystemOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        clientAnalytics,
        tokenAnalytics,
        tierComparison,
      ] = await Promise.all([
        clientTrackingService.getClientAnalytics(),
        tokenSystem.getTokenAnalytics(),
        downloadShareService.getTierComparison(),
      ]);

      const overview = {
        clients: clientAnalytics,
        tokens: tokenAnalytics,
        tiers: tierComparison,
        timestamp: new Date().toISOString(),
      };

      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get daily stats
   */
  async getDailyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        newClientsToday,
        tokensGeneratedToday,
        topCountries,
        dailyRegistrations,
      ] = await Promise.all([
        clientTrackingService.getClientStats().then(stats => stats.newClientsToday),
        tokenSystem.getTokenAnalytics().then(analytics => analytics.totalAllocated),
        clientTrackingService.getTopCountries(5),
        clientTrackingService.getDailyClientRegistrations(7),
      ]);

      const dailyStats = {
        date: today.toISOString().split('T')[0],
        newClients: newClientsToday,
        tokensGenerated: tokensGeneratedToday,
        topCountries,
        weeklyTrend: dailyRegistrations,
      };

      res.json({
        success: true,
        data: dailyStats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client by fingerprint
   */
  async getClientByFingerprint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fingerprint } = req.params;
      
      if (!fingerprint) {
        throw new AppError(400, 'Fingerprint is required');
      }

      const client = await clientTrackingService.getClient(fingerprint);
      
      if (!client) {
        throw new AppError(404, 'Client not found');
      }

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get country analytics
   */
  async getCountryAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { country } = req.params;
      
      if (!country) {
        throw new AppError(400, 'Country is required');
      }

      const topCountries = await clientTrackingService.getTopCountries(50);
      const countryData = topCountries.find(c => c.country.toLowerCase() === country.toLowerCase());
      
      if (!countryData) {
        throw new AppError(404, 'Country not found');
      }

      const countryBonuses = await clientTrackingService.calculateCountryBonusTokens();
      const bonusTokens = countryBonuses[country] || 0;

      res.json({
        success: true,
        data: {
          country: countryData.country,
          clientCount: countryData.count,
          bonusTokens,
          rank: topCountries.findIndex(c => c.country === countryData.country) + 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format = 'json' } = req.query;
      
      const analytics = await clientTrackingService.getClientAnalytics();
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvData = this.convertToCSV(analytics);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="client-analytics.csv"');
        res.send(csvData);
      } else {
        res.json({
          success: true,
          data: analytics,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Convert analytics data to CSV
   */
  private convertToCSV(data: any): string {
    const headers = [
      'Total Clients',
      'Active Clients',
      'New Clients Today',
      'Tokens Generated',
      'Avg Tokens Per Client',
    ];

    const values = [
      data.totalClients,
      data.activeClients,
      data.newClientsToday,
      data.tokensGenerated,
      data.avgTokensPerClient,
    ];

    return headers.join(',') + '\n' + values.join(',') + '\n';
  }
}

export const analyticsController = new AnalyticsController();
