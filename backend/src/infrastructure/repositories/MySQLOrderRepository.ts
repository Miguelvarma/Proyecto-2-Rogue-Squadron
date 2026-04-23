/**
 * MySQLOrderRepository.ts — Infrastructure / Repositories
 * FIX: eliminados alias @domain y @infrastructure (no configurados en tsconfig)
 *      reemplazados por rutas relativas correctas.
 */

import { OrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order }           from '../../domain/entities/Order';
import { pool }            from '../database/connection';

export class MySQLOrderRepository implements OrderRepository {

  async createOrderWithItems(
    userId: number,
    items: { productId: number; quantity: number; price: number }[]
  ): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let total = 0;
      for (const item of items) {
        total += item.price * item.quantity;
      }

      const [orderResult]: any = await connection.query(
        'INSERT INTO orders (user_id, total) VALUES (?, ?)',
        [userId, total]
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.price]
        );
        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findByUser(userId: number): Promise<Order[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map((row: any) => new Order(row.id, row.user_id, row.total, row.created_at));
  }
}
