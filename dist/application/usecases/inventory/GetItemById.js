"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetItemById = void 0;
class GetItemById {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }
    async execute(id) {
        const item = await this.itemRepository.findById(id);
        if (!item) {
            throw new Error('Ítem no encontrado');
        }
        return {
            item: item.toPublic(),
        };
    }
}
exports.GetItemById = GetItemById;
