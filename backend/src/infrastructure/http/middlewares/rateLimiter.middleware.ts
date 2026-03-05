// src/infrastructure/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { config } from '../../../config/index,';

// Detectar si estamos en desarrollo
const isDevelopment = config.NODE_ENV === 'development';

// Limiter para inventario (MUY PERMISIVO)
export const inventoryLimiter = isDevelopment 
  ? (req: any, res: any, next: any) => next() // En desarrollo no limitar
  : rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: 120, // 120 peticiones por minuto (2 por segundo)
      message: { 
        error: 'Demasiadas solicitudes al inventario. Espera un momento.' 
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipFailedRequests: true, // No contar peticiones fallidas
    });

// Limiter general (menos permisivo)
export const generalLimiter = isDevelopment
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: 'Demasiadas peticiones, intenta de nuevo más tarde',
      standardHeaders: true,
      legacyHeaders: false,
    });

// Limiter para login (más restrictivo)
export const authLimiter = isDevelopment
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: 'Demasiados intentos de login',
      skipSuccessfulRequests: true,
    });

// Limiter para operaciones sensibles
export const sensitiveOperationsLimiter = isDevelopment
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      message: 'Límite de operaciones sensibles alcanzado',
    });