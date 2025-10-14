/**
 * 🌐 CLIENT TRACKING MIDDLEWARE - Middleware para tracking automático
 */

import { Request, Response, NextFunction } from 'express';
import { clientTrackingService } from '../../services/analytics/client-tracking.service';
import { logger } from '../../utils/logger';

export class ClientTrackingMiddleware {
  /**
   * Track client on every request
   */
  async trackClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userAgent = req.get('User-Agent') || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      
      // Get country from headers (if using CloudFlare or similar)
      const country = req.get('CF-IPCountry') || req.get('X-Country-Code') || 'Unknown';
      const city = req.get('CF-City') || req.get('X-City') || 'Unknown';

      // Register/track client
      const clientInfo = await clientTrackingService.registerClient(
        userAgent,
        ipAddress,
        country,
        city
      );

      // Add client info to request
      req.clientInfo = clientInfo;

      // Log new clients
      if (clientInfo.isNewClient) {
        logger.info(`🌐 New client detected: ${clientInfo.browserFingerprint} from ${clientInfo.country}`);
      }

      next();
    } catch (error) {
      logger.error('Client tracking error:', error);
      next(); // Continue even if tracking fails
    }
  }

  /**
   * Track client activity for authenticated users
   */
  async trackAuthenticatedClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.clientInfo) {
        await clientTrackingService.updateClientActivity(req.clientInfo.browserFingerprint);
      }
      next();
    } catch (error) {
      logger.error('Authenticated client tracking error:', error);
      next();
    }
  }

  /**
   * Get client analytics endpoint
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
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      clientInfo?: {
        browserFingerprint: string;
        userAgent: string;
        ipAddress: string;
        country?: string;
        city?: string;
        isNewClient: boolean;
        tokensContributed: number;
      };
    }
  }
}

export const clientTrackingMiddleware = new ClientTrackingMiddleware();
