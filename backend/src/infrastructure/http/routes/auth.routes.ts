import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validation.middleware';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schemas';
import { authLimiter } from '../middlewares/rateLimiter.middleware';

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();

  router.post(
    '/register',
    authLimiter,
    validateRequest(RegisterSchema),
    controller.register
  );

  // NUEVO: Ruta de login
  router.post(
    '/login',
    authLimiter,
    validateRequest(LoginSchema),
    controller.login
  );

  return router;
};