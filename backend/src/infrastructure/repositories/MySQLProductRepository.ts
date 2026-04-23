// backend/src/infrastructure/repositories/MySQLProductRepository.ts
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../database/connection';

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  type: string;
  emoji: string;
  is_active: number;
  image: string;
  created_at: Date;
  updated_at: Date;
}

export class MySQLProductRepository {
  
  async findAll(): Promise<any[]> {
    const [rows] = await pool.query<ProductRow[]>(
      'SELECT * FROM products ORDER BY id DESC'
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      rarity: row.rarity,
      type: row.type,
      emoji: row.emoji,
      is_active: row.is_active === 1,
      image: row.image
    }));
  }

  async findById(id: number): Promise<any | null> {
    const [rows] = await pool.query<ProductRow[]>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      rarity: row.rarity,
      type: row.type,
      emoji: row.emoji,
      is_active: row.is_active === 1,
      image: row.image
    };
  }

  async create(productData: any): Promise<any> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO products (name, description, price, stock, rarity, type, emoji, is_active, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.name, 
        productData.description, 
        productData.price, 
        productData.stock || 0, 
        productData.rarity || 'COMMON', 
        productData.type || 'ITEM',
        productData.emoji || '📦',
        productData.is_active ? 1 : 1,
        productData.image || ''
      ]
    );
    
    return {
      id: result.insertId,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock || 0,
      rarity: productData.rarity || 'COMMON',
      type: productData.type || 'ITEM',
      emoji: productData.emoji || '📦',
      is_active: true,
      image: productData.image || ''
    };
  }

  // ✅ AGREGAR MÉTODO UPDATE
  async update(id: number, productData: any): Promise<any> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE products SET 
        name = ?, 
        description = ?, 
        price = ?, 
        stock = ?, 
        rarity = ?, 
        type = ?, 
        emoji = ?, 
        image = ?
       WHERE id = ?`,
      [
        productData.name,
        productData.description,
        productData.price,
        productData.stock,
        productData.rarity,
        productData.type,
        productData.emoji,
        productData.image || '',
        id
      ]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Producto no encontrado");
    }
    
    return {
      id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      rarity: productData.rarity,
      type: productData.type,
      emoji: productData.emoji,
      image: productData.image
    };
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  }

  async updateStock(id: number, newStock: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?',
      [newStock, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }
  }
}