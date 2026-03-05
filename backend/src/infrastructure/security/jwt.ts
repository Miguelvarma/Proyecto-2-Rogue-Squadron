import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { PlayerRole } from '../../domain/entities/Player';

export interface JwtPayload {
  sub: string;
  role: PlayerRole;
  jti: string;
}

export function signAccessToken(payload: Omit<JwtPayload, 'jti'>): string {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string; jti: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; jti: string };
}
