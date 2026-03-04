import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/DomainError';
import { logger } from '../../logging/logger';

const STATUS_MAP: Record<string, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof DomainError) {
    const status = STATUS_MAP[err.code] ?? 400;
    res.status(status).json({ error: err.message, code: err.code });
    return;
  }

  logger.error('Error inesperado', { message: err.message, stack: err.stack, path: req.path });
  res.status(500).json({ error: 'Error interno del servidor' });
}
