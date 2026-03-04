import { Request, Response, NextFunction } from 'express';
import { logger } from '../../logging/logger';
import { config } from '../../../config/index,';

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('error.handler', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error.name === 'ValidationError' || error.message.includes('inválid')) {
    res.status(400).json({
      error: 'Datos de entrada inválidos',
      message: error.message,
    });
    return;
  }

  if (error.name === 'AuthenticationError') {
    res.status(401).json({ error: error.message });
    return;
  }

  if (error.name === 'AuthorizationError') {
    res.status(403).json({ error: error.message });
    return;
  }

  if (error.name === 'NotFoundError' || error.message.includes('no encontrado')) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error.message.includes('ya está registrado') || 
      error.message.includes('ya está en uso') ||
      error.message.includes('subasta') ||
      error.message.includes('mazo')) {
    res.status(409).json({ error: error.message });
    return;
  }

  res.status(500).json({
    error: 'Error interno del servidor',
    message: config.NODE_ENV === 'development' ? error.message : undefined,
  });
};