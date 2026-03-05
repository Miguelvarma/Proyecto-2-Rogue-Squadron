export type PlayerRole = 'PLAYER' | 'ADMIN' | 'MODERATOR';
export type ItemTipo = 'Héroe' | 'Arma' | 'Armadura' | 'Habilidad' | 'Ítem' | 'Épica';
export type ItemRareza = 'Común' | 'Rara' | 'Épica' | 'Legendaria';

export interface Item {
  id: string;
  nombre: string;
  tipo: ItemTipo;
  rareza: ItemRareza;
  imagen: string | null;
  descripcion: string;
  habilidades: string[];
  efectos: string[];
  ataque: number;
  defensa: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicPlayer {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  apodo: string;
  avatar: string | null;
  rol: PlayerRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface Filters {
  tipo?: string;
  rareza?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}