/**
 * logger.ts — Infrastructure / Logging
 * FIX: agregados exports logSecurityEvent y logInventoryEvent que usaban
 *      auth.middleware.ts e InventoryController.ts pero no existían aquí.
 */

import winston from 'winston';
import { env } from '../../config/env';

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'nexus-battles-v' },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'development'
        ? winston.format.combine(winston.format.colorize(), winston.format.simple())
        : winston.format.json(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/audit.log', level: 'info' }),
  ],
});

// ── Helpers de auditoría ──────────────────────────────────────────────────────
export const audit = {
  login: (userId: string, ip: string, success: boolean) =>
    logger.info('auth.login', { userId, ip, success }),
  securityHmacFail: (ip: string, route: string) =>
    logger.warn('security.hmacFail', { ip, route, severity: 'HIGH' }),
  rateLimitHit: (ip: string, route: string) =>
    logger.warn('security.rateLimitHit', { ip, route }),
};

// ── Helpers específicos usados por middleware e inventario ─────────────────────
export function logSecurityEvent(event: string, meta: Record<string, unknown>): void {
  logger.warn(`security.${event}`, meta);
}

export function logInventoryEvent(event: string, meta: Record<string, unknown>): void {
  logger.info(`inventory.${event}`, meta);
}
