import { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '../../../application/usecases/auth/RegisterUser';
import { logAuthEvent } from '../../logging/logger';

export class AuthController {
  constructor(private readonly registerUser: RegisterUser) {}

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
}