// infrastructure/http/middlewares/roleMiddleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.rol)) {
      res.status(403).json({ 
        error: `No tienes permiso. Se requiere uno de: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
};
