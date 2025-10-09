import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.userId,
    }, 'HTTP Request');
  });
  
  next();
}
