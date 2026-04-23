import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

type AdminSession = {
  username: string;
  createdAt: string;
};

const adminChatbotSessions = new Map<string, AdminSession>();

export interface AdminChatbotRequest extends Request {
  admin?: {
    username: string;
  };
}

export function createAdminChatbotSession(username: string): string {
  const token = randomUUID();
  adminChatbotSessions.set(token, { username, createdAt: new Date().toISOString() });
  return token;
}

export function destroyAdminChatbotSession(token: string): void {
  adminChatbotSessions.delete(token);
}

function extractAdminChatbotToken(req: Request): string | null {
  const headerToken = req.header('x-admin-session');
  if (headerToken) {
    return headerToken;
  }

  const authHeader = req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7);
}

export function adminChatbotAuthMiddleware(req: AdminChatbotRequest, res: Response, next: NextFunction): void {
  const token = extractAdminChatbotToken(req);
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'ADMIN_AUTH_REQUIRED',
      message: 'Debes iniciar sesión como administrador para acceder a este recurso.',
    });
    return;
  }

  const session = adminChatbotSessions.get(token);
  if (!session) {
    res.status(401).json({
      success: false,
      error: 'ADMIN_SESSION_INVALID',
      message: 'La sesión de administrador no es válida o expiró. Inicia sesión nuevamente.',
    });
    return;
  }

  req.admin = { username: session.username };
  next();
}