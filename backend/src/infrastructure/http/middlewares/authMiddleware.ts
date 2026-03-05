import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../security/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Permisos insuficientes' });
      return;
    }
    next();
  };
}
