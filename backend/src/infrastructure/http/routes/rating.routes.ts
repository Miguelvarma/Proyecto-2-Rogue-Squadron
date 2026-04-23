// src/interfaces/routes/rating.routes.ts
import { Router } from 'express';
import { RatingController } from '../controllers/RatingController';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/roleMiddleware';

export const createRatingRoutes = (controller: RatingController): Router => {
  const router = Router();

  // Rutas públicas - cualquiera puede ver calificaciones
  router.get('/:id/rating', controller.getProductRating);

  // Rutas protegidas - solo usuarios autenticados pueden calificar
  // 🔧 CRÍTICO: Agregado requireRole para permitir solo PLAYER y ADMIN
  router.post('/:id/rate', authenticateJWT, requireRole(['PLAYER', 'ADMIN']), controller.rateProduct);

  return router;
};