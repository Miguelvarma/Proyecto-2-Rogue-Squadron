import { MySQLRatingRepository } from '../../../infrastructure/repositories/MySQLRatingRepository';
import { MySQLProductRepository } from '../../../infrastructure/repositories/MySQLProductRepository';
import { rateItemSchema } from '../../validators/rating.validator';
import { Rating } from '../../../domain/entities/Rating';
import { z } from 'zod';

interface RateProductRequest {
  userId: string;      // UUID del usuario
  productId: number;   // ID del producto (number)
  score: number;       // 1-5
}

export class RateProductUseCase {
  constructor(
    private ratingRepository: MySQLRatingRepository,
    private productRepository: MySQLProductRepository
  ) {}

  async execute(request: RateProductRequest) {
    try {
      // 1. Validar score
      const validated = rateItemSchema.parse({ score: request.score });

      // 2. Verificar que el producto existe
      const product = await this.productRepository.findById(request.productId);
      if (!product) {
        throw new Error('El producto no existe');
      }

      // ⚠️ Convertir productId a itemId (ej: 1 → "item-1")
      const itemId = `item-${request.productId}`;

      // 3. Buscar si el usuario ya calificó (✅ findByUserAndItem)
      const existingRating = await this.ratingRepository.findByUserAndItem(
        request.userId,
        itemId  // ⚠️ Usar itemId, no productId
      );

      if (existingRating) {
        // 4a. ACTUALIZAR calificación existente
        const updatedRating = existingRating.updateScore(validated.score);
        await this.ratingRepository.update(updatedRating.id, updatedRating.score);
        
        return {
          message: 'Calificación actualizada',
          rating: {
            id: updatedRating.id,
            productId: request.productId,  // ✅ Mantener productId para respuesta
            itemId: updatedRating.itemId,
            score: updatedRating.score,
            createdAt: updatedRating.createdAt,
            updatedAt: updatedRating.updatedAt
          }
        };
      } else {
        // 4b. CREAR nueva calificación (✅ Rating.create espera itemId: string)
        const newRating = Rating.create(
          itemId,           // ⚠️ string, no number
          request.userId,
          validated.score
        );
        await this.ratingRepository.create(newRating);
        
        return {
          message: 'Calificación guardada',
          rating: {
            id: newRating.id,
            productId: request.productId,  // ✅ Mantener productId para respuesta
            itemId: newRating.itemId,
            score: newRating.score,
            createdAt: newRating.createdAt,
            updatedAt: newRating.updatedAt
          }
        };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Datos inválidos: ${error.issues[0].message}`);
      }
      throw error;
    }
  }
}