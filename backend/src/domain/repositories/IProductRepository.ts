import { Product } from "../entities/Product";

export interface ProductRepository {
    findById(id: number): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    updateStock(id: number, newStock: number): Promise<void>;
}