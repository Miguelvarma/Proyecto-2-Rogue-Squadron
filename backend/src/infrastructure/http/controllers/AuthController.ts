import { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '../../../application/usecases/auth/RegisterUser';
import { LoginUser } from '../../../application/usecases/auth/LoginUser';
import { logAuthEvent } from '../../logging/logger';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUser.execute(req.body);

      logAuthEvent('login', {
        userId: result.user.id,
        ip: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        success: true,
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  };

  // NUEVO: Login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUser.execute(
        req.body,
        req.ip || '',
        req.headers['user-agent'] || ''
      );

      // Establecer refresh token como httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      res.status(200).json({
        message: 'Login exitoso',
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  };
}