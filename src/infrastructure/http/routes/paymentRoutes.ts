import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validateMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { hmacMiddleware } from '../middlewares/hmacMiddleware';

const router = Router();

const intentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(1),
});

router.post('/intent', authMiddleware, validate(intentSchema), (req, res) => {
  res.status(501).json({ message: 'Conectar con PaymentController.createIntent' });
});

// El webhook usa hmacMiddleware en lugar de JWT
router.post('/webhook', hmacMiddleware, (req, res) => {
  res.status(501).json({ message: 'Conectar con PaymentController.webhook' });
});

export default router;
