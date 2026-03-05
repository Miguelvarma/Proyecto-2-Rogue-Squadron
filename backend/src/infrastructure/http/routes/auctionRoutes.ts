import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validateMiddleware';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

const bidSchema = z.object({
  amount: z.number().positive(),
});

const createAuctionSchema = z.object({
  itemId: z.string().uuid(),
  startPrice: z.number().positive(),
  endsAt: z.string().datetime(),
});

router.get('/', (req, res) => {
  res.status(501).json({ message: 'Conectar con AuctionController.list' });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Conectar con AuctionController.getById' });
});

router.post('/', authMiddleware, requireRole('ADMIN'), validate(createAuctionSchema), (req, res) => {
  res.status(501).json({ message: 'Conectar con AuctionController.create' });
});

router.post('/:id/bids', authMiddleware, validate(bidSchema), (req, res) => {
  res.status(501).json({ message: 'Conectar con AuctionController.placeBid' });
});

router.delete('/:id', authMiddleware, requireRole('ADMIN'), (req, res) => {
  res.status(501).json({ message: 'Conectar con AuctionController.cancel' });
});

export default router;
