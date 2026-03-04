import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validation.middleware';
import { RegisterSchema } from '../schemas/auth.schemas';
import { authLimiter } from '../middlewares/rateLimiter.middleware';

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();

  /**
   * @route   POST /api/v1/auth/register
   * @desc    Registrar nuevo usuario (SCRUM-42)
   * @access  Public
   */
  router.post(
    '/register',
    authLimiter,
    validateRequest(RegisterSchema),
    controller.register
  );

  return router;
};