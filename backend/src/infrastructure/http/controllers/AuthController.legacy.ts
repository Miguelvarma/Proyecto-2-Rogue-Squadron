/**
 * AuthController.legacy.ts — Infrastructure / HTTP / Controllers
 * Controlador de Auth para el flujo de Player (v1).
 * Exporta singleton `authController` usado por authRoutes.ts
 * USA TABLA 'users' (no 'players')
 */

import { Request, Response, NextFunction } from 'express';
import { userRepository }                 from '../../repositories/MySQLUserRepository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../security/jwt';
import { DomainError }                    from '../../../domain/errors/DomainError';
import bcrypt                             from 'bcrypt';

class AuthControllerLegacy {

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, username } = req.body;

      // Verificar si el email ya existe
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        res.status(409).json({ success: false, error: 'EMAIL_TAKEN' });
        return;
      }

      // Verificar si el apodo (username) ya existe
      const existingApodo = await userRepository.findByApodo(username);
      if (existingApodo) {
        res.status(409).json({ success: false, error: 'USERNAME_TAKEN' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await userRepository.save({
        nombres: username, // Usar el username como nombres inicialmente
        apellidos: '',
        email,
        password: passwordHash,
        apodo: username,
        rol: 'PLAYER',
        avatar: null,
        email_verified: false,
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          apodo: user.apodo,
          rol: user.rol,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await userRepository.findByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS' });
        return;
      }

      const accessToken  = signAccessToken({ sub: user.id, role: user.rol });
      const refreshToken = signRefreshToken(user.id);

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          player: {
            id: user.id,
            email: user.email,
            apodo: user.apodo,
            rol: user.rol,
          },
        },
      });
    } catch (err: any) {
      if (err instanceof DomainError && err.code === 'UNAUTHORIZED') {
        res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: err.message });
        return;
      }
      next(err);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.json({ success: true });
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: 'REFRESH_TOKEN_REQUIRED' });
        return;
      }

      const payload = verifyRefreshToken(refreshToken);
      const user    = await userRepository.findById(payload.sub);

      if (!user) {
        res.status(401).json({ success: false, error: 'INVALID_TOKEN' });
        return;
      }

      const accessToken = signAccessToken({ sub: user.id, role: user.rol });
      res.json({ success: true, data: { accessToken } });
    } catch {
      res.status(401).json({ success: false, error: 'INVALID_TOKEN' });
    }
  }
}

export const authController = new AuthControllerLegacy();
