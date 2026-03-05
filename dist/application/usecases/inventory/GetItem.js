"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetItems = void 0;
class GetItems {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }
    async execute(filters) {
        const result = await this.itemRepository.findAll(filters);
        return {
            items: result.items.map(item => item.toPublic()),
            total: result.total,
            page: filters.page,
            totalPages: Math.ceil(result.total / filters.limit),
        };
    }
}
exports.GetItems = GetItems;
