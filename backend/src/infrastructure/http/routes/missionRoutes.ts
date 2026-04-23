import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/active', authMiddleware, (req, res) => {
  res.status(501).json({ message: 'Conectar con MissionController.getActive' });
});

router.post('/generate', authMiddleware, (req, res) => {
  res.status(501).json({ message: 'Conectar con MissionController.generate' });
});

router.post('/:id/complete', authMiddleware, (req, res) => {
  res.status(501).json({ message: 'Conectar con MissionController.complete' });
});

router.get('/history', authMiddleware, (req, res) => {
  res.status(501).json({ message: 'Conectar con MissionController.history' });
});

export default router;
