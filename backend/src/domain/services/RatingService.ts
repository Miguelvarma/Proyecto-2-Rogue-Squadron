import { IRatingRepository }  from '../repositories/IRatingRepository';
import { IProductRepository } from '../repositories/IProductRepository';
import { Rating }             from '../entities/Rating';

export class RatingService {
  constructor(
    private ratingRepo:  IRatingRepository,
    private productRepo: IProductRepository,
  ) {}

  async rateProduct(userId: string, productId: number, score: number) {
    if (score < 1 || score > 5) throw new Error('La calificación debe ser entre 1 y 5');

    const product = await this.productRepo.findById(productId);
    if (!product) throw new Error('Producto no encontrado');

    const itemId   = `item-${productId}`;
    const existing = await this.ratingRepo.findByUserAndItem(userId, itemId);

    if (existing) {
      const updated = existing.updateScore(score);
      await this.ratingRepo.update(updated.id, updated.score);
      return {
        message: 'Calificación actualizada',
        rating: {
          id: updated.id, productId, itemId: updated.itemId,
          score: updated.score, createdAt: updated.createdAt, updatedAt: updated.updatedAt,
        },
      };
    }

    const newRating = Rating.create(itemId, userId, score);
    await this.ratingRepo.create(newRating);
    return {
      message: 'Calificación guardada',
      rating: {
        id: newRating.id, productId, itemId: newRating.itemId,
        score: newRating.score, createdAt: newRating.createdAt, updatedAt: newRating.updatedAt,
      },
    };
  }

  async getUserRating(userId: string, productId: number) {
    const rating = await this.ratingRepo.findByUserAndItem(userId, `item-${productId}`);
    if (!rating) return null;
    return { ...rating, productId };
  }

  async getProductRating(productId: number) {
    return this.ratingRepo.getAverageByItem(`item-${productId}`);
  }

  async hasUserRated(userId: string, productId: number): Promise<boolean> {
    return this.ratingRepo.exists(userId, `item-${productId}`);
  }
}