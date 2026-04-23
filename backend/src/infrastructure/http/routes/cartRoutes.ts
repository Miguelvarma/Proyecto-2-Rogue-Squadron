/**
 * cartRoutes.ts — Infrastructure / HTTP / Routes
 * FIX: import de CartController corregido a '../controllers/CartController'
 */

import { Router }         from 'express';
import { CartController } from '../controllers/CartController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/add', authMiddleware, CartController.add);

export default router;
