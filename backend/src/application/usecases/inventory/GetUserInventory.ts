// application/usecases/inventory/GetUserInventory.ts
import { IItemRepository, ItemFilters, PaginatedResult } from '../../../domain/repositories/IItemRepository';
import { Item } from '../../../domain/entities/Item';

export class GetUserInventory {
  constructor(private itemRepository: IItemRepository) {}

  async execute(userId: string, filters: ItemFilters): Promise<PaginatedResult<Item>> {
    const result = await this.itemRepository.findByUser(userId, filters);
    return result;
  }
}
