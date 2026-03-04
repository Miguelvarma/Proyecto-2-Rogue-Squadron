import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config/index,';
import { ITokenService } from '../../application/usecases/auth/RegisterUser';

export class JwtTokenService implements ITokenService {
generate(payload: any): string {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, config.JWT_SECRET, options);
}

generateRefreshToken(payload: any): string {
  const options: SignOptions = {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, options);
}

  verify(token: string): any {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      
      return null;
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
     
      return null;
    }
  }
}