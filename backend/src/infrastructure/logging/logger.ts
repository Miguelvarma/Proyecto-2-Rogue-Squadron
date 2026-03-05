import winston from 'winston';
import { config } from '../../config/index,';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'nexus-battles-inventory' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (config.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// ✅ ACTUALIZAR: Agregar email como opcional
export const logAuthEvent = (event: 'login' | 'logout', data: {
  userId?: string;
  email?: string; // ← AGREGAR ESTO
  ip: string;
  userAgent: string;
  success: boolean;
  reason?: string;
}) => {
  logger.info(`auth.${event}`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const logSecurityEvent = (event: string, data: {
  ip: string;
  route?: string;
  payload?: any;
}) => {
  logger.warn(`security.${event}`, {
    ...data,
    timestamp: new Date().toISOString(),
    alert: 'CRITICAL',
  });
};

export const logInventoryEvent = (event: string, data: any) => {
  logger.info(`inventory.${event}`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};