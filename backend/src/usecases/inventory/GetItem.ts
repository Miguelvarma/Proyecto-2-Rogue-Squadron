

import { IItemRepository, ItemFilters } from '../../../domain/repositories/IItemRepository';

export class GetItems {
  constructor(private readonly itemRepository: IItemRepository) {}

  async execute(filters: ItemFilters): Promise<{ items: any[]; total: number; page: number; totalPages: number }> {
    const result = await this.itemRepository.findAll(filters);

    return {
      items: result.items.map(item => item.toPublic()),
      total: result.total,
      page: filters.page,
      totalPages: Math.ceil(result.total / filters.limit),
    };
  }
}