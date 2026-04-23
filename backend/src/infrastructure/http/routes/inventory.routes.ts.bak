/**
 * inventory.routes.ts — Infrastructure / HTTP / Routes
 * CRUD completo + Inventarios Global y del Usuario
 */

import { Router }              from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticateJWT }     from '../middlewares/auth.middleware';
import { requireRole }         from '../middlewares/roleMiddleware';
import { validateQuery }       from '../middlewares/validation.middleware';
import { validate }            from '../middlewares/validateMiddleware';
import { SearchQuerySchema, GetItemsQuerySchema, CreateItemSchema, UpdateItemSchema } from '../schemas/inventory.schemas';

export const createInventoryRoutes = (controller: InventoryController): Router => {
  const router = Router();

  // ========== BÚSQUEDA Y LECTURA ==========
  router.get('/search', validateQuery(SearchQuerySchema), controller.search);
  router.get('/global', validateQuery(GetItemsQuerySchema), controller.getGlobalInventory);
  router.get('/me', authenticateJWT, validateQuery(GetItemsQuerySchema), controller.getUserInventory);
  router.get('/', validateQuery(GetItemsQuerySchema), controller.list);
  router.get('/:id', controller.getById);

  // ========== CRUD DE ITEMS (SOLO ADMIN) ==========
  router.post('/', authenticateJWT, requireRole(['ADMIN']), validate(CreateItemSchema), controller.create);
  router.put('/:id', authenticateJWT, requireRole(['ADMIN']), validate(UpdateItemSchema), controller.update);
  
  // ========== SOFT DELETE Y REACTIVATE (SOLO ADMIN) ==========
  router.patch('/:id/delete', authenticateJWT, requireRole(['ADMIN']), controller.softDelete);
  router.patch('/:id/reactivate', authenticateJWT, requireRole(['ADMIN']), controller.reactivate);

  // ========== HARD DELETE (SOLO ADMIN) ==========
  // ⚠️ CRÍTICO: Agregado requireRole(['ADMIN']) para proteger hard delete
  router.delete('/:id', authenticateJWT, requireRole(['ADMIN']), controller.delete);

  return router;
};
