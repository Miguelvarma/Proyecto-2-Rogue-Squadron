

import { IItemRepository } from '../../../domain/repositories/IItemRepository';

export class DeleteItem {
  constructor(private readonly itemRepository: IItemRepository) {}

  async execute(itemId: string, userId: string): Promise<{ item: any; deletedAt: Date }> {
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
      deletedAt: deletedItem.deletedAt!,
    };
  }
}