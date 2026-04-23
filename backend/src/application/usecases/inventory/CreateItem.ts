// application/usecases/inventory/CreateItem.ts
import { Item } from '../../../domain/entities/Item';
import { IItemRepository } from '../../../domain/repositories/IItemRepository';

interface CreateItemDTO {
  nombre: string;
  tipo: 'Héroe' | 'Arma' | 'Armadura' | 'Habilidad' | 'Ítem' | 'Épica';
  rareza?: 'Común' | 'Rara' | 'Épica' | 'Legendaria';
  imagen?: string;
  descripcion?: string;
  habilidades?: string[];
  efectos?: string[];
  ataque?: number;
  defensa?: number;
  userId?: string;
}

export class CreateItem {
  constructor(readonly itemRepository: IItemRepository) {}

  async execute(data: CreateItemDTO): Promise<Item> {
    // Crear nuevo item sin user_id (es global)
    const item = new Item({
      nombre: data.nombre,
      tipo: data.tipo,
      rareza: data.rareza || 'Común',
      imagen: data.imagen,
      descripcion: data.descripcion,
      habilidades: data.habilidades || [],
      efectos: data.efectos || [],
      ataque: data.ataque || 0,
      defensa: data.defensa || 0,
      userId: data.userId,
      activo: true,
    });

    const savedItem = await this.itemRepository.save(item);
    return savedItem;
  }
}
