/**
 * productRoutes.ts — Infrastructure / HTTP / Routes
 * NUEVO ARCHIVO — faltaba en server.ts (gap detectado en Fase 1).
 *
 * Registrar en server.ts:
 *   import productRoutes from '@infrastructure/http/routes/productRoutes';
 *   app.use('/api/v1/products', productRoutes);
 */

import { Router } from 'express';
import { productsController } from '../../controllers/ProductsController';

const router = Router();

// Público — el catálogo de la tienda no requiere autenticación
router.get('/',    productsController.getProducts.bind(productsController));
router.get('/:id', productsController.getById.bind(productsController));

export default router;
