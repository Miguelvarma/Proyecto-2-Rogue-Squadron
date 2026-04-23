/**
 * MySQLUserRepository.ts
 * Repositorio para tabla 'users' del sistema
 */

import { pool } from '../database/connection';

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  apodo: string;
  avatar?: string | null;
  rol: 'PLAYER' | 'ADMIN' | 'MODERATOR';
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export class MySQLUserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const [rows]: any = await pool.execute(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      if (!rows.length) return null;
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows]: any = await pool.execute(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      if (!rows.length) return null;
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  async findByApodo(apodo: string): Promise<User | null> {
    try {
      const [rows]: any = await pool.execute(
        'SELECT * FROM users WHERE apodo = ? LIMIT 1',
        [apodo]
      );
      if (!rows.length) return null;
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  async save(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    
    try {
      await pool.execute(
        `INSERT INTO users (id, nombres, apellidos, email, password, apodo, avatar, rol, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.nombres,
          data.apellidos,
          data.email,
          data.password,
          data.apodo,
          data.avatar || null,
          data.rol,
          data.email_verified ? 1 : 0
        ]
      );

      const user = await this.findById(id);
      if (!user) throw new Error('Usuario no fue creado correctamente');
      return user;
    } catch (error) {
      throw error;
    }
  }
}

export const userRepository = new MySQLUserRepository();
