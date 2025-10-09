import pino from 'pino';
import { config } from '@/config';

export const logger = pino({
  level: config.logging.level,
  transport: config.isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: false,
    },
  } : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Helper para logs estructurados
export const createLogger = (context: string) => {
  return {
    info: (obj: object, msg?: string) => logger.info({ context, ...obj }, msg),
    error: (obj: object, msg?: string) => logger.error({ context, ...obj }, msg),
    warn: (obj: object, msg?: string) => logger.warn({ context, ...obj }, msg),
    debug: (obj: object, msg?: string) => logger.debug({ context, ...obj }, msg),
  };
};
