import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { getConnection } from '../database';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  apodo: string;
  avatar: string | null;
  rol: 'PLAYER' | 'ADMIN' | 'MODERATOR';
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserRepositoryMySQL implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const connection = getConnection();
    
    const [rows] = await connection.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) return null;

    return this.mapToDomain(rows[0]);
  }

  async findByApodo(apodo: string): Promise<User | null> {
    const connection = getConnection();
    
    const [rows] = await connection.query<UserRow[]>(
      'SELECT * FROM users WHERE apodo = ?',
      [apodo]
    );

    if (rows.length === 0) return null;

    return this.mapToDomain(rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    const connection = getConnection();
    
    const [rows] = await connection.query<UserRow[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapToDomain(rows[0]);
  }

  async save(user: User): Promise<User> {
    const connection = getConnection();
    const data = user.toPersistence();

    await connection.query(
      `INSERT INTO users (id, nombres, apellidos, email, password, apodo, avatar, rol, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.nombres,
        data.apellidos,
        data.email,
        data.password,
        data.apodo,
        data.avatar || null,
        data.rol,
        data.emailVerified ? 1 : 0,
        data.createdAt,
        data.updatedAt,
      ]
    );

    return user;
  }

  async update(user: User): Promise<User> {
    const connection = getConnection();
    const data = user.toPersistence();

    await connection.query(
      `UPDATE users 
       SET nombres = ?, apellidos = ?, email = ?, apodo = ?, avatar = ?, 
           rol = ?, email_verified = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.nombres,
        data.apellidos,
        data.email,
        data.apodo,
        data.avatar || null,
        data.rol,
        data.emailVerified ? 1 : 0,
        new Date(),
        data.id,
      ]
    );

    return user;
  }

  private mapToDomain(row: UserRow): User {
    return User.fromPersistence({
      id: row.id,
      nombres: row.nombres,
      apellidos: row.apellidos,
      email: row.email,
      password: row.password,
      apodo: row.apodo,
      avatar: row.avatar || undefined,
      rol: row.rol,
      emailVerified: Boolean(row.email_verified),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}