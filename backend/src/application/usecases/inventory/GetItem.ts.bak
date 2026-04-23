// application/usecases/inventory/GetItems.ts
import { IItemRepository,ItemFilters,PaginatedResult } from "../../../domain/repositories/IItemRepository";
import { Item } from "../../../domain/entities/Item";

export class GetItems {
  constructor(private itemRepository: IItemRepository) {}
  
  async execute(filters: ItemFilters): Promise<PaginatedResult<Item>> {
    console.log(' Ejecutando GetItems con filtros:', filters);
    const result = await this.itemRepository.findAll(filters);
    console.log('📦 Resultado:', result);
    return result;
  }
}