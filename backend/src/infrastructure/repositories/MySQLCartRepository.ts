import { CartRepository } from "../../domain/repositories/ICartRepository";
import { CartItem } from "../../domain/entities/Cart";
import { pool } from "../database/connection";


export class MySQLCartRepository implements CartRepository {

    async addProduct(userId: number, productId: number, quantity: number): Promise<void> {
    const [rows]: any = await pool.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
        [userId, productId]
    );

    if (rows.length > 0) {
        await pool.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity, userId, productId]
        );
    } else {
        await pool.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity]
        );
    }
    }

    async getCart(userId: number): Promise<CartItem[]> {
    const [rows]: any = await pool.query(
      "SELECT * FROM cart WHERE user_id = ?",
        [userId]
    );
    return rows;
    }

    async updateQuantity(id: number, quantity: number): Promise<void> {
    await pool.query(
        "UPDATE cart SET quantity = ? WHERE id = ?",
        [quantity, id]
    );
    }

    async removeProduct(id: number): Promise<void> {
    await pool.query(
        "DELETE FROM cart WHERE id = ?",
        [id]
    );
    }
}