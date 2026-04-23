// application/usecases/inventory/SoftDeleteItem.ts
import { IItemRepository } from '../../../domain/repositories/IItemRepository';

export class SoftDeleteItem {
  constructor(private itemRepository: IItemRepository) {}

  async execute(id: string): Promise<{ success: boolean; deletedAt: Date }> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new Error('Ítem no encontrado');
    }

    // Verificar si puede ser eliminado
    item.canBeDeleted();

    // Realizar soft delete
    const success = await this.itemRepository.delete(id);

    if (!success) {
      throw new Error('No se pudo eliminar el ítem');
    }

    return { success: true, deletedAt: new Date() };
  }
}
