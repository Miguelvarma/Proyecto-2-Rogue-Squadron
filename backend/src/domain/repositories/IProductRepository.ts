import { Product } from '../entities/Product';

// Alias nombrado con prefijo I para consistencia con el resto del proyecto
export interface IProductRepository {
  findById(id: number): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  updateStock(id: number, newStock: number): Promise<void>;
}

// Alias legacy para no romper los archivos que importan ProductRepository
export type ProductRepository = IProductRepository;