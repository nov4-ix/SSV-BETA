/**
 * 🌌 CLIENT TRACKING MIDDLEWARE - Middleware para tracking automático
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

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

      // Generate browser fingerprint
      const browserFingerprint = this.generateBrowserFingerprint(userAgent, ipAddress);

      // Create client info
      const clientInfo = {
        browserFingerprint,
        userAgent,
        ipAddress,
        country,
        city,
        isNewClient: Math.random() < 0.1, // 10% chance of being new client for demo
        tokensContributed: 10, // Each client contributes 10 tokens
      };

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
   * Generate browser fingerprint
   */
  private generateBrowserFingerprint(userAgent: string, ipAddress: string): string {
    // Combine user agent + IP + timestamp for unique fingerprint
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Daily timestamp
    const fingerprint = `${userAgent}-${ipAddress}-${timestamp}`;
    
    // Create hash-like identifier
    return Buffer.from(fingerprint).toString('base64').substring(0, 32);
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
