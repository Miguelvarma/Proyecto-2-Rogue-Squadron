// application/usecases/inventory/UpdateItem.ts
import { Item } from '../../../domain/entities/Item';
import { IItemRepository } from '../../../domain/repositories/IItemRepository';

interface UpdateItemDTO {
  nombre?: string;
  tipo?: 'Héroe' | 'Arma' | 'Armadura' | 'Habilidad' | 'Ítem' | 'Épica';
  rareza?: 'Común' | 'Rara' | 'Épica' | 'Legendaria';
  imagen?: string;
  descripcion?: string;
  habilidades?: string[];
  efectos?: string[];
  ataque?: number;
  defensa?: number;
}

export class UpdateItem {
  constructor(private itemRepository: IItemRepository) {}

  async execute(id: string, data: UpdateItemDTO): Promise<Item> {
    const item = await this.itemRepository.findById(id);
    if (!item) {
      throw new Error('Ítem no encontrado');
    }

    // Crear nuevo item con datos actualizados
    const updatedItem = new Item({
      id: item.id,
      nombre: data.nombre ?? item.nombre,
      tipo: data.tipo ?? item.tipo,
      rareza: data.rareza ?? item.rareza,
      imagen: (data.imagen ?? item.imagen) || undefined,
      descripcion: data.descripcion ?? item.descripcion,
      habilidades: data.habilidades ?? item.habilidades,
      efectos: data.efectos ?? item.efectos,
      ataque: data.ataque ?? item.ataque,
      defensa: data.defensa ?? item.defensa,
      userId: item.userId || undefined,
      activo: item.activo,
      deletedAt: item.deletedAt || null,
      createdAt: item.createdAt,
    });

    const result = await this.itemRepository.update(updatedItem);
    return result;
  }
}
