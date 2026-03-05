import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/rankings', (req, res) => {
  res.status(501).json({ message: 'Conectar con PlayerController.rankings' });
});

router.get('/me', authMiddleware, (req, res) => {
  res.status(501).json({ message: 'Conectar con PlayerController.getMe' });
});

router.patch('/me', authMiddleware, (req, res) => {
  res.status(501).json({ message: 'Conectar con PlayerController.updateMe' });
});

router.get('/me/inventory', authMiddleware, (req, res) => {
  res.status(501).json({ message: 'Conectar con PlayerController.getInventory' });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Conectar con PlayerController.getById' });
});

export default router;
