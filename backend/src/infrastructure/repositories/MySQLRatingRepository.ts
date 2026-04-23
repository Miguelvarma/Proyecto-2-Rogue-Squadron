// infrastructure/repositories/MySQLRatingRepository.ts
import { pool } from '../database/connection';
import { Rating } from '../../domain/entities/Rating';
import { IRatingRepository } from '../../domain/repositories/IRatingRepository';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface RatingRow extends RowDataPacket {
  id: string;
  item_id: string;
  user_id: string;
  stars: number;
  created_at: Date;
  updated_at: Date;
}

interface AvgRow extends RowDataPacket {
  average: number | null;
  count: number;
}

export class MySQLRatingRepository implements IRatingRepository {
  
  async findByUserAndItem(userId: string, itemId: string): Promise<Rating | null> {
    const [rows] = await pool.query<RatingRow[]>(
      `SELECT 
        id,
        item_id,
        user_id,
        stars,
        created_at,
        updated_at
      FROM ratings 
      WHERE user_id = ? AND item_id = ?`,
      [userId, itemId]
    );
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return new Rating(
      row.id,
      row.item_id,
      row.user_id,
      row.stars,
      row.created_at,
      row.updated_at
    );
  }

  async create(rating: Rating): Promise<void> {
    await pool.query<ResultSetHeader>(
      `INSERT INTO ratings (
        id, 
        item_id, 
        user_id, 
        stars, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        rating.id,
        rating.itemId,
        rating.userId,
        rating.score,
        rating.createdAt,
        rating.updatedAt
      ]
    );
  }

  async update(id: string, score: number): Promise<void> {
    await pool.query<ResultSetHeader>(
      `UPDATE ratings 
       SET stars = ?, updated_at = ? 
       WHERE id = ?`,
      [score, new Date(), id]
    );
  }

  async getAverageByItem(itemId: string): Promise<{ average: number; count: number }> {
    const [rows] = await pool.query<AvgRow[]>(
      `SELECT 
        AVG(stars) as average,  -- ✅ SQL comment, no JS comment
        COUNT(*) as count 
      FROM ratings 
      WHERE item_id = ?`,
      [itemId]
    );
    
    return {
      average: Number(rows[0]?.average) || 0,
      count: rows[0]?.count || 0
    };
  }

  // Alias de compatibilidad para evitar errores entre ramas Product/Item
  async getAverageByProduct(productId: string): Promise<{ average: number; count: number }> {
    return this.getAverageByItem(productId);
  }

  async exists(userId: string, itemId: string): Promise<boolean> {
    const [rows] = await pool.query<RatingRow[]>(
      'SELECT id FROM ratings WHERE user_id = ? AND item_id = ? LIMIT 1',
      [userId, itemId]
    );
    return rows.length > 0;
  }
}