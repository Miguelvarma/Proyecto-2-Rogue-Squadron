import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

export class JwtTokenService {
  generate(payload: any): string {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };

    const token = jwt.sign(payload, env.JWT_SECRET, options);
    console.log('✅ [JwtTokenService] Token generado:', {
      payload: payload,
      expiresIn: env.JWT_EXPIRES_IN,
      secretLength: env.JWT_SECRET.length,
      token: token.substring(0, 30) + '...'
    });
    return token;
  }

  generateRefreshToken(payload: any): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

  verify(token: string): any {
    try {
      console.log('🔐 [JwtTokenService.verify] Verificando token:', {
        token: token.substring(0, 30) + '...',
        secretLength: env.JWT_SECRET.length,
        secretFirst20: env.JWT_SECRET.substring(0, 20) + '...'
      });
      
      const decoded = jwt.verify(token, env.JWT_SECRET);
      console.log('✅ [JwtTokenService.verify] Token válido:', decoded);
      return decoded;
    } catch (error: any) {
      console.error('❌ [JwtTokenService.verify] Error:', {
        message: error.message,
        name: error.name,
        expiredAt: error.expiredAt
      });
      return null;
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (error) {
      console.error('❌ [JwtTokenService.verifyRefreshToken] Error:', error);
      return null;
    }
  }
}