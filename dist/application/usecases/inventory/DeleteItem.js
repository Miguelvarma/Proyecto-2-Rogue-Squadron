"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteItem = void 0;
class DeleteItem {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }
    async execute(itemId, userId) {
        const item = await this.itemRepository.findById(itemId);
        if (!item) {
            throw new Error('Ítem no encontrado');
        }
        if (item.userId && !item.belongsTo(userId)) {
            throw new Error('No autorizado para eliminar este ítem');
        }
        item.canBeDeleted();
        item.markAsDeleted();
        const deletedItem = await this.itemRepository.update(item);
        return {
            item: deletedItem.toPublic(),
            deletedAt: deletedItem.deletedAt,
        };
    }
}
exports.DeleteItem = DeleteItem;
