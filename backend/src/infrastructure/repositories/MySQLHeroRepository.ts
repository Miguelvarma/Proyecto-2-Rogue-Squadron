// src/infrastructure/repositories/MySQLHeroRepository.ts
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { IHeroRepository } from "../../application/repositories/IHeroRepository";
import { Heroe } from "../../domain/entities/Heroe";
import { pool } from '../database/connection';

interface HeroRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  price: number;
  stars: number;
  type: string;
  image: string;
}

export class MySQLHeroRepository implements IHeroRepository {
  
  async findAll(): Promise<Heroe[]> {
    // ✅ Usar solo columnas que existen
    const [rows] = await pool.query<HeroRow[]>(
      'SELECT * FROM heroes ORDER BY id DESC'
    );
    
    return rows.map(row => new Heroe(
      row.id,
      row.name,
      row.description || '',
      row.price,
      row.stars,
      row.type as any,
      row.image || ''
    ));
  }

  async findById(id: number): Promise<Heroe | null> {
    const [rows] = await pool.query<HeroRow[]>(
      'SELECT * FROM heroes WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return new Heroe(
      row.id,
      row.name,
      row.description || '',
      row.price,
      row.stars,
      row.type as any,
      row.image || ''
    );
  }

  async create(hero: Omit<Heroe, 'id'>): Promise<Heroe> {
    // ✅ Insert sin created_at ni updated_at
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO heroes (name, description, price, stars, type, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [hero.name, hero.description, hero.price, hero.stars, hero.type, hero.image]
    );
    
    return new Heroe(
      result.insertId,
      hero.name,
      hero.description,
      hero.price,
      hero.stars,
      hero.type,
      hero.image
    );
  }

  async update(id: number, heroData: Partial<Heroe>): Promise<Heroe> {
    const currentHero = await this.findById(id);
    if (!currentHero) {
      throw new Error("Héroe no encontrado");
    }
    
    currentHero.update(heroData);
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (heroData.name !== undefined) {
      updates.push('name = ?');
      values.push(currentHero.name);
    }
    if (heroData.description !== undefined) {
      updates.push('description = ?');
      values.push(currentHero.description);
    }
    if (heroData.price !== undefined) {
      updates.push('price = ?');
      values.push(currentHero.price);
    }
    if (heroData.stars !== undefined) {
      updates.push('stars = ?');
      values.push(currentHero.stars);
    }
    if (heroData.type !== undefined) {
      updates.push('type = ?');
      values.push(currentHero.type);
    }
    if (heroData.image !== undefined) {
      updates.push('image = ?');
      values.push(currentHero.image);
    }
    
    values.push(id);
    
    await pool.query(
      `UPDATE heroes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return currentHero;
  }

  async delete(id: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM heroes WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Héroe no encontrado");
    }
  }
}