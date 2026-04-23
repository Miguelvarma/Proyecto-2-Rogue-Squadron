import rateLimit from 'express-rate-limit';
import { env } from '../../../config/env';

const isDevelopment = env.NODE_ENV === 'development';

export const inventoryLimiter = isDevelopment
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      message: { error: 'Demasiadas solicitudes al inventario. Espera un momento.' },
      standardHeaders: true,
      legacyHeaders: false,
      skipFailedRequests: true,
    });

export const generalLimiter = isDevelopment
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Demasiadas peticiones, intenta de nuevo más tarde',
      standardHeaders: true,
      legacyHeaders: false,
    });

export const authLimiter = isDevelopment
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: 'Demasiados intentos de login',
      skipSuccessfulRequests: true,
    });

export const sensitiveOperationsLimiter = isDevelopment
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      message: 'Límite de operaciones sensibles alcanzado',
    });
