import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validation.middleware';
import { SearchQuerySchema, GetItemsQuerySchema } from '../schemas/inventory.schemas';

export const createInventoryRoutes = (controller: InventoryController): Router => {
  const router = Router();

  /**
   * @route   GET /api/v1/inventory/search
   * @desc    Buscar ítems (SCRUM-31)
   * @access  Public
   */
  router.get(
    '/search',
    validateQuery(SearchQuerySchema),
    controller.search
  );

  /**
   * @route   GET /api/v1/inventory
   * @desc    Listar ítems con filtros y paginación
   * @access  Public
   */
  router.get(
    '/',
    validateQuery(GetItemsQuerySchema),
    controller.list
  );

  /**
   * @route   GET /api/v1/inventory/:id
   * @desc    Obtener detalle de un ítem
   * @access  Public
   */
  router.get('/:id', controller.getById);

  /**
   * @route   DELETE /api/v1/inventory/:id
   * @desc    Eliminar/descartar ítem (SCRUM-37)
   * @access  Private
   */
  router.delete('/:id', authenticateJWT, controller.delete);

  return router;
};