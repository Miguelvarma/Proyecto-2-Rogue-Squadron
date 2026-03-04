import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../../security/JwtTokenServices';
import { logSecurityEvent } from '../../logging/logger';

const tokenService = new JwtTokenService();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    apodo: string;
    rol: 'PLAYER' | 'ADMIN' | 'MODERATOR';
  };
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.substring(7);
  const decoded = tokenService.verify(token);

  if (!decoded) {
    logSecurityEvent('jwt.invalid', {
      ip: req.ip || '',
      route: req.path,
    });

    res.status(401).json({ error: 'Token inválido o expirado' });
    return;
  }

  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    apodo: decoded.apodo,
    rol: decoded.rol,
  };

  next();
};

export const requireRole = (...roles: Array<'PLAYER' | 'ADMIN' | 'MODERATOR'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'No autorizado para esta acción' });
      return;
    }

    next();
  };
};