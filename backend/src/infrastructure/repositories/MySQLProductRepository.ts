import { pool } from "../database/connection";
import { Product } from "../../domain/entities/Product";
import { ProductRepository } from "../../domain/repositories/IProductRepository";

export class MySQLProductRepository implements ProductRepository {

    async findById(id: number): Promise<Product | null> {
    const [rows]: any = await pool.query(
      "SELECT * FROM products WHERE id = ?",
        [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];

    return new Product(
        row.id,
        row.name,
        row.description,
        row.price,
        row.stock
    );
    }

    async findAll(): Promise<Product[]> {
    const [rows]: any = await pool.query("SELECT * FROM products");

    return rows.map((row: any) =>
        new Product(
        row.id,
        row.name,
        row.description,
        row.price,
        row.stock
        )
    );
    }

    async updateStock(id: number, newStock: number): Promise<void> {
    await pool.query(
        "UPDATE products SET stock = ? WHERE id = ?",
        [newStock, id]
    );
    }
}