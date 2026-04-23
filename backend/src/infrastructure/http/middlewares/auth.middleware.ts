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
  
  console.log('🔐 [auth.middleware] Headers recibidos:', {
    authorization: authHeader ? `${authHeader.substring(0, 20)}...` : 'NO PRESENTE',
    method: req.method,
    url: req.url,
    allHeaders: Object.keys(req.headers)
  });

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ [auth.middleware] Error: Token no proporcionado o formato incorrecto');
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

  // ✅ CORRECCIÓN: Extraer userId de 'sub' o 'userId' (compatible con AuthController.legacy)
  const userId = decoded.userId || decoded.sub;
  const rol = decoded.rol || decoded.role;
  
  console.log('✅ [auth.middleware] Token validado correctamente para usuario:', userId);

  req.user = {
    userId: userId,
    email: decoded.email || '',
    apodo: decoded.apodo || '',
    rol: rol,
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