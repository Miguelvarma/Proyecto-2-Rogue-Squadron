/**
 * paymentMiddlewares.ts
 * Middlewares específicos del módulo de pagos:
 *   - idempotencyRequired
 *   - paymentRateLimiter
 *   - antiFraud
 * Migrados desde Imperial Guard (JS) → TypeScript para Nexus Battles.
 */

import { Request, Response, NextFunction } from 'express';
import { PAYMENT_LIMITS } from '../../../payments/constants/payments.constants';

// ─── Idempotencia ─────────────────────────────────────────────────────────────

export function idempotencyRequired(req: Request, res: Response, next: NextFunction): void {
  const key =
    (req.headers['x-idempotency-key'] as string | undefined) ??
    (req.body as any)?.idempotencyKey;

  if (!key || key.length < 16) {
    res.status(400).json({
      success: false,
      error:   'IDEMPOTENCY_KEY_REQUIRED',
      message: 'Se requiere el header X-Idempotency-Key (mín. 16 caracteres)',
    });
    return;
  }
  (req as any).body.idempotencyKey = key;
  next();
}

// ─── Rate Limiter en memoria (producción: reemplazar por Redis) ───────────────

interface RateRecord { count: number; windowStart: number; }
const rateStore = new Map<string, RateRecord>();

export function paymentRateLimiter(options: { windowMs?: number; max?: number } = {}) {
  const windowMs = options.windowMs ?? PAYMENT_LIMITS.RATE_LIMIT_WINDOW_MS;
  const maxReq   = options.max      ?? PAYMENT_LIMITS.RATE_LIMIT_MAX_REQ;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();

    let record = rateStore.get(key);
    if (!record || now - record.windowStart > windowMs) {
      record = { count: 1, windowStart: now };
    } else {
      record.count++;
    }
    rateStore.set(key, record);

    res.setHeader('X-RateLimit-Limit',     maxReq);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxReq - record.count));

    if (record.count > maxReq) {
      res.status(429).json({
        success: false,
        error:   'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes. Intenta más tarde.',
        retryAfter: Math.ceil(windowMs / 1000),
      });
      return;
    }
    next();
  };
}

// ─── Anti Fraude (velocity check + IP block) ─────────────────────────────────

const BLOCKED_IPS = new Set<string>(
  (process.env.FRAUD_BLOCKED_IPS ?? '').split(',').filter(Boolean)
);

interface FailureRecord { count: number; start: number; }
const failureStore = new Map<string, FailureRecord>();

export function antiFraud(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';

  // 1. IP bloqueada permanentemente
  if (BLOCKED_IPS.has(ip)) {
    res.status(403).json({
      success: false,
      error:   'FRAUD_BLOCKED',
      message: 'Acceso denegado',
    });
    return;
  }

  // 2. Velocity check: > 3 fallos en 10 min = probable fraude
  const now    = Date.now();
  const window = 10 * 60 * 1000;
  let record   = failureStore.get(ip);

  if (!record || now - record.start > window) {
    record = { count: 0, start: now };
  }

  if (record.count >= 3) {
    res.status(429).json({
      success: false,
      error:   'FRAUD_VELOCITY_EXCEEDED',
      message: 'Actividad sospechosa detectada. Contacta soporte.',
    });
    return;
  }

  // Exponer función para que el controller registre un fallo
  (req as any).registerPaymentFailure = () => {
    record!.count++;
    failureStore.set(ip, record!);
  };
  (req as any).clientIp = ip;

  next();
}
