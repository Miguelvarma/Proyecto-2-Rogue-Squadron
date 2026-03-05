// src/interfaces/routes/rating.routes.ts
import { Router } from 'express';
import { RatingController } from '../controllers/RatingController';
import { authenticateJWT } from '../middlewares/auth.middleware';

export const createRatingRoutes = (controller: RatingController): Router => {
  const router = Router();

  // Rutas públicas - cualquiera puede ver calificaciones
  router.get('/products/:id/rating', controller.getProductRating);

  // Rutas protegidas - solo usuarios autenticados pueden calificar
  router.post('/products/:id/rate', authenticateJWT, controller.rateProduct);

  return router;
};