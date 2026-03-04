import rateLimit from 'express-rate-limit';
import { config } from '../../../config/index,';

export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Demasiadas peticiones, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login, intenta de nuevo más tarde',
  skipSuccessfulRequests: true,
});

export const sensitiveOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Límite de operaciones sensibles alcanzado',
});