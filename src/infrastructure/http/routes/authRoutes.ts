import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validateMiddleware';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Rutas — conectar con controladores cuando esten listos
router.post('/register', validate(registerSchema), (req, res) => {
  res.status(501).json({ message: 'Conectar con AuthController.register' });
});

router.post('/login', validate(loginSchema), (req, res) => {
  res.status(501).json({ message: 'Conectar con AuthController.login' });
});

router.post('/logout', (req, res) => {
  res.status(501).json({ message: 'Conectar con AuthController.logout' });
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ message: 'Conectar con AuthController.refresh' });
});

export default router;
