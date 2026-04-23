/**
 * playerRoutes.ts — Infrastructure / HTTP / Routes
 * FIX: import de playerController corregido a '../controllers/PlayerController'
 */

import { Router }           from 'express';
import { authMiddleware }   from '../middlewares/authMiddleware';
import { playerController } from '../controllers/PlayerController';

const router = Router();

router.get('/rankings',      playerController.getRankings.bind(playerController));
router.get('/me',            authMiddleware, playerController.getMe.bind(playerController));
router.patch('/me',          authMiddleware, playerController.updateMe.bind(playerController));
router.get('/me/inventory',  authMiddleware, playerController.getInventory.bind(playerController));
router.get('/:id',           playerController.getById.bind(playerController));

export default router;
