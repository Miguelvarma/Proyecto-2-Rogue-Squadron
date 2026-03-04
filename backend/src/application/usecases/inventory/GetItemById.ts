

import { IItemRepository } from '../../../domain/repositories/IItemRepository';

export class GetItemById {
  constructor(private readonly itemRepository: IItemRepository) {}

  async execute(id: string): Promise<{ item: any }> {
    const item = await this.itemRepository.findById(id);
    
    if (!item) {
      throw new Error('Ítem no encontrado');
    }

    return {
      item: item.toPublic(),
    };
  }
}