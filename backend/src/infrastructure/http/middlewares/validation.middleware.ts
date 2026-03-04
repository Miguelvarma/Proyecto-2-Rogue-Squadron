import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({ error: 'Error de validación' });
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Parámetros de consulta inválidos',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({ error: 'Error de validación' });
    }
  };
};