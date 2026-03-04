import { v4 as uuidv4 } from 'uuid';

export interface ItemProps {
  id?: string;
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
  enSubasta?: boolean;
  enMazoActivo?: boolean;
  activo?: boolean;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Item {
  public readonly id: string;
  public readonly nombre: string;
  public readonly tipo: 'Héroe' | 'Arma' | 'Armadura' | 'Habilidad' | 'Ítem' | 'Épica';
  public readonly rareza: 'Común' | 'Rara' | 'Épica' | 'Legendaria';
  public readonly imagen: string | null;
  public readonly descripcion: string;
  public readonly habilidades: string[];
  public readonly efectos: string[];
  public readonly ataque: number;
  public readonly defensa: number;
  public readonly userId: string | null;
  public readonly enSubasta: boolean;
  public readonly enMazoActivo: boolean;
  public activo: boolean;
  public deletedAt: Date | null;
  public readonly updatedAt: Date;
  public readonly createdAt: Date;

  constructor(props: ItemProps) {
    this.id = props.id || uuidv4();
    this.nombre = props.nombre;
    this.tipo = props.tipo;
    this.rareza = props.rareza || 'Común';
    this.imagen = props.imagen || null;
    this.descripcion = props.descripcion || '';
    this.habilidades = props.habilidades || [];
    this.efectos = props.efectos || [];
    this.ataque = props.ataque || 0;
    this.defensa = props.defensa || 0;
    this.userId = props.userId || null;
    this.enSubasta = props.enSubasta || false;
    this.enMazoActivo = props.enMazoActivo || false;
    this.activo = props.activo !== undefined ? props.activo : true;
    this.deletedAt = props.deletedAt || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.nombre || this.nombre.trim().length < 2) {
      throw new Error('Nombre del ítem debe tener al menos 2 caracteres');
    }

    const tiposValidos = ['Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica'];
    if (!tiposValidos.includes(this.tipo)) {
      throw new Error(`Tipo debe ser uno de: ${tiposValidos.join(', ')}`);
    }
  }

  public canBeDeleted(): void {
    if (this.enSubasta) {
      throw new Error('No se puede eliminar un ítem en subasta');
    }
    if (this.enMazoActivo) {
      throw new Error('No se puede eliminar un ítem en mazo activo');
    }
    if (!this.activo) {
      throw new Error('El ítem ya está eliminado');
    }
  }

  public markAsDeleted(): void {
    this.canBeDeleted();
    this.activo = false;
    this.deletedAt = new Date();
  }

  public belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  public toPublic(): any {
    return {
      id: this.id,
      nombre: this.nombre,
      tipo: this.tipo,
      rareza: this.rareza,
      imagen: this.imagen,
      descripcion: this.descripcion,
      habilidades: this.habilidades,
      efectos: this.efectos,
      ataque: this.ataque,
      defensa: this.defensa,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public toPersistence(): ItemProps {
    return {
      id: this.id,
      nombre: this.nombre,
      tipo: this.tipo,
      rareza: this.rareza,
      imagen: this.imagen || undefined,
      descripcion: this.descripcion,
      habilidades: this.habilidades,
      efectos: this.efectos,
      ataque: this.ataque,
      defensa: this.defensa,
      userId: this.userId || undefined,
      enSubasta: this.enSubasta,
      enMazoActivo: this.enMazoActivo,
      activo: this.activo,
      deletedAt: this.deletedAt || undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: ItemProps): Item {
    return new Item(data);
  }
}