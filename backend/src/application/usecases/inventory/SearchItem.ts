

import { IItemRepository } from '../../../domain/repositories/IItemRepository';

export class SearchItems {
  constructor(private readonly itemRepository: IItemRepository) {}

  async execute(query: string): Promise<{ results: any[]; total: number; query: string }> {
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