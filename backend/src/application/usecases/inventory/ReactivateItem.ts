// application/usecases/inventory/ReactivateItem.ts
import { IItemRepository } from '../../../domain/repositories/IItemRepository';

export class ReactivateItem {
  constructor(private itemRepository: IItemRepository) {}

  async execute(id: string): Promise<{ success: boolean; reactivatedAt: Date }> {
    const item = await this.itemRepository.findById(id);
    
    if (item && !item.activo) {
      // Item está inactivo, se puede reactivar
      const success = await this.itemRepository.reactivate(id);
      
      if (!success) {
        throw new Error('No se pudo reactivar el ítem');
      }

      return { success: true, reactivatedAt: new Date() };
    }

    // Si el item no existe o ya está activo
    const exists = await this.itemRepository.findById(id);
    if (!exists && !item) {
      throw new Error('Ítem no encontrado');
    }

    // Item ya está activo
    throw new Error('El ítem ya está activo');
  }
}
