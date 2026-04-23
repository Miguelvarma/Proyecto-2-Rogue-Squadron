import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../security/jwt';

/**
 * authMiddleware - LEGACY
 * ⚠️ DEPRECATED: Usar auth.middleware.ts en su lugar (authenticateJWT)
 * 
 * Este middleware mantiene compatibilidad pero se diferencia en:
 * - Usa verifyAccessToken() en lugar de JwtTokenService.verify()
 * - Los nuevos endpoints usan authenticateJWT de auth.middleware.ts
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    // 🔧 FIX: Normalizar campo rol (JWT siempre incluye 'rol')
    (req as any).user = {
      ...payload,
      rol: payload.rol || payload.role, // Soportar ambos por legacía
    };
    next();
  } catch {
    res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    // 🔧 FIX: Usar 'rol' no 'role' (consistencia con JWT)
    if (!user || !roles.includes(user.rol)) {
      res.status(403).json({ error: 'Permisos insuficientes. Se requiere uno de: ' + roles.join(', ') });
      return;
    }
    next();
  };
}
