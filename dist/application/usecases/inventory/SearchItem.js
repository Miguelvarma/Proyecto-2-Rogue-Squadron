"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchItems = void 0;
class SearchItems {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }
    async execute(query) {
        if (!query || query.length < 4) {
            throw new Error('La búsqueda debe tener al menos 4 caracteres');
        }
        const items = await this.itemRepository.search(query);
        return {
            results: items.map(item => item.toPublic()),
            total: items.length,
            query,
        };
    }
}
exports.SearchItems = SearchItems;
