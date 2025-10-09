import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { config } from '@/config';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error({
    error: {
      name: error.name,
      message: error.message,
      stack: config.isDevelopment ? error.stack : undefined,
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
    },
  }, 'Request error');
  
  // Zod validation error
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 400,
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
    });
  }
  
  // Known operational errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.statusCode,
        ...(error.details && config.isDevelopment && { details: error.details }),
      },
    });
  }
  
  // Unknown errors (programmer errors)
  return res.status(500).json({
    success: false,
    error: {
      message: config.isProduction 
        ? 'Internal server error' 
        : error.message,
      code: 500,
      ...(config.isDevelopment && { stack: error.stack }),
    },
  });
}
