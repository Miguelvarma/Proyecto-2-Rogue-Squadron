/**
 * productRoutes.ts — Infrastructure / HTTP / Routes
 * FIX: import de productsController corregido a '../controllers/ProductsController'
 */

import { Router }             from 'express';
import { productsController } from '../controllers/ProductsController';

const router = Router();

router.get('/',    productsController.getProducts.bind(productsController));
router.get('/:id', productsController.getById.bind(productsController));

export default router;
