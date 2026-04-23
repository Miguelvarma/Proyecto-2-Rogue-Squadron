import { MySQLRatingRepository } from '../../../infrastructure/repositories/MySQLRatingRepository';
import { MySQLProductRepository } from '../../../infrastructure/repositories/MySQLProductRepository';

export class GetProductRatingUseCase {
  constructor(
    private ratingRepository: MySQLRatingRepository,
    private productRepository: MySQLProductRepository
  ) {}

  async execute(productId: number) {
    // Verificar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error('El producto no existe');
    }

    // Obtener calificaciones
    const rating = await this.ratingRepository.getAverageByProduct(String(productId));
    
    return {
      average: rating.average,
      count: rating.count
    };
  }
}