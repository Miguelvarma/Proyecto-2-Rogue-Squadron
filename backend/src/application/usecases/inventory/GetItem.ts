// application/usecases/inventory/GetItems.ts
import { IItemRepository,ItemFilters } from "../../../domain/repositories/IItemRepository";

export class GetItems {
  constructor(private itemRepository: IItemRepository) {}
  
  async execute(filters: ItemFilters) {
    console.log('🎯 Filtros recibidos:', filters);
    const result = await this.itemRepository.findAll(filters);
    console.log(`📦 Encontrados ${result.items.length} items de ${result.total}`);
    return result;
  }
}