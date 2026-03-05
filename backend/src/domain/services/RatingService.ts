// application/services/RatingService.ts
import { IRatingRepository } from '../repositories/IRatingRepository';
import { MySQLProductRepository } from '../../infrastructure/repositories/MySQLProductRepository';
import { Rating } from '../../domain/entities/Rating';

export class RatingService {
  constructor(
    private ratingRepo: IRatingRepository,
    private productRepo: MySQLProductRepository
  ) {}

  // Calificar un producto (create or update)
  async rateProduct(userId: string, productId: number, score: number) {
    // Validar score (1-5)
    if (score < 1 || score > 5) {
      throw new Error('La calificación debe ser entre 1 y 5');
    }

    // Validar que el producto existe
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // ⚠️ Convertir productId (number) a itemId (string)
    const itemId = `item-${productId}`;  // Ej: productId=1 → itemId="item-1"

    // Buscar si ya calificó
    const existing = await this.ratingRepo.findByUserAndItem(userId, itemId);

    if (existing) {
      // UPDATE - crear nueva instancia con el nuevo score
      const updatedRating = existing.updateScore(score);
      await this.ratingRepo.update(updatedRating.id, updatedRating.score);
      
      return {
        message: 'Calificación actualizada',
        rating: {
          id: updatedRating.id,
          productId: productId,
          itemId: updatedRating.itemId,
          score: updatedRating.score,
          createdAt: updatedRating.createdAt,
          updatedAt: updatedRating.updatedAt
        }
      };
    } else {
      // CREATE - crear nueva calificación
      const newRating = Rating.create(itemId, userId, score);
      await this.ratingRepo.create(newRating);
      
      return {
        message: 'Calificación guardada',
        rating: {
          id: newRating.id,
          productId: productId,
          itemId: newRating.itemId,
          score: newRating.score,
          createdAt: newRating.createdAt,
          updatedAt: newRating.updatedAt
        }
      };
    }
  }

  // Obtener calificación del usuario para un producto
  async getUserRating(userId: string, productId: number) {
    const itemId = `item-${productId}`;
    const rating = await this.ratingRepo.findByUserAndItem(userId, itemId);
    
    if (!rating) return null;
    
    return {
      ...rating,
      productId: productId  // Agregar productId para compatibilidad
    };
  }

  // Obtener promedio de un producto
  async getProductRating(productId: number) {
    const itemId = `item-${productId}`;
    const rating = await this.ratingRepo.getAverageByItem(itemId);
    
    return {
      average: rating.average,
      count: rating.count
    };
  }

  // Verificar si el usuario ya calificó
  async hasUserRated(userId: string, productId: number): Promise<boolean> {
    const itemId = `item-${productId}`;
    return await this.ratingRepo.exists(userId, itemId);
  }
}