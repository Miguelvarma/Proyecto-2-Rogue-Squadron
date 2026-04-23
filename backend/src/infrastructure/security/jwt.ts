import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { PlayerRole } from '../../domain/entities/Player';

export interface JwtPayload {
  sub: string;
  role: PlayerRole;
  jti: string;
}

export function signAccessToken(payload: Omit<JwtPayload, 'jti'>): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, env.JWT_SECRET, options);
}

export function signRefreshToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string; jti: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; jti: string };
}