"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const inventory_schemas_1 = require("../schemas/inventory.schemas");
const createInventoryRoutes = (controller) => {
    const router = (0, express_1.Router)();
    /**
     * @route   GET /api/v1/inventory/search
     * @desc    Buscar ítems (SCRUM-31)
     * @access  Public
     */
    router.get('/search', (0, validation_middleware_1.validateQuery)(inventory_schemas_1.SearchQuerySchema), controller.search);
    /**
     * @route   GET /api/v1/inventory
     * @desc    Listar ítems con filtros y paginación
     * @access  Public
     */
    router.get('/', (0, validation_middleware_1.validateQuery)(inventory_schemas_1.GetItemsQuerySchema), controller.list);
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
    router.delete('/:id', auth_middleware_1.authenticateJWT, controller.delete);
    return router;
};
exports.createInventoryRoutes = createInventoryRoutes;
