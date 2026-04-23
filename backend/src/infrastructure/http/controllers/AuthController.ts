/**
 * AuthController.ts — Infrastructure / HTTP / Controllers
 * Controlador de Auth para el flujo de User (apodo/nombres) — v2.
 * Recibe sus dependencias por DI desde server.ts.
 *
 * FIXES:
 *  - Eliminado import duplicado de LoginUseCase
 *  - RegisterUseCase/LoginUseCase (no existen) → RegisterUser/LoginUser
 *  - Eliminada instancia interna de playerRepository (no aplica aquí)
 *  - Métodos como arrow functions para preservar 'this' al pasarlos como handlers
 */

import { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '../../../application/usecases/auth/RegisterUser';
import { LoginUser }    from '../../../application/usecases/auth/LoginUser';
import { DomainError }  from '../../../domain/errors/DomainError';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUser.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip        = req.ip ?? '';
      const userAgent = req.headers['user-agent'] ?? '';
      const result    = await this.loginUser.execute(req.body, ip, userAgent);
      res.json({ success: true, data: result });
    } catch (err: any) {
      if (err instanceof DomainError && err.code === 'UNAUTHORIZED') {
        res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: err.message });
        return;
      }
      next(err);
    }
  };
}
