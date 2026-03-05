"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const logger_1 = require("../../logging/logger");
class InventoryController {
    constructor(searchItems, getItems, getItemById, deleteItem) {
        this.searchItems = searchItems;
        this.getItems = getItems;
        this.getItemById = getItemById;
        this.deleteItem = deleteItem;
        this.search = async (req, res, next) => {
            try {
                const { q } = req.query;
                const result = await this.searchItems.execute(q);
                (0, logger_1.logInventoryEvent)('search', {
                    query: q,
                    results: result.total,
                });
                res.status(200).json({
                    ...result,
                    message: result.total === 0 ? 'No se encontraron resultados' : undefined,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.list = async (req, res, next) => {
            try {
                const { tipo, rareza, page, limit } = req.query;
                const result = await this.getItems.execute({
                    tipo: tipo,
                    rareza: rareza,
                    page: parseInt(page) || 1,
                    limit: parseInt(limit) || 16,
                });
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const { id } = req.params;
                const result = await this.getItemById.execute(id);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.user.userId;
                const result = await this.deleteItem.execute(id, userId);
                (0, logger_1.logInventoryEvent)('item.deleted', {
                    itemId: id,
                    userId,
                    deletedAt: result.deletedAt,
                });
                res.status(200).json({
                    message: 'Ítem eliminado exitosamente',
                    ...result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.InventoryController = InventoryController;
