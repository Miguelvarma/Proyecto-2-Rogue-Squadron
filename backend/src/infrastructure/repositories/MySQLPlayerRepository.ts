import { pool } from '../database/connection';
import { IPlayerRepository } from '../../domain/repositories/IPlayerRepository';
import { Player } from '../../domain/entities/Player';

export class MySQLPlayerRepository implements IPlayerRepository {
  async findById(id: string): Promise<Player | null> {
    const [rows] = await pool.execute('SELECT * FROM players WHERE id = ?', [id]);
    const row = (rows as Player[])[0];
    return row ?? null;
  }

  async findByEmail(email: string): Promise<Player | null> {
    const [rows] = await pool.execute('SELECT * FROM players WHERE email = ?', [email]);
    return ((rows as Player[])[0]) ?? null;
  }

  async findByUsername(username: string): Promise<Player | null> {
    const [rows] = await pool.execute('SELECT * FROM players WHERE username = ?', [username]);
    return ((rows as Player[])[0]) ?? null;
  }

  async save(data: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
    const id = crypto.randomUUID();
    await pool.execute(
      'INSERT INTO players (id, username, email, password_hash, role, rank, coins) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.username, data.email, data.passwordHash, data.role, data.rank, data.coins],
    );
    return this.findById(id) as Promise<Player>;
  }

  async update(id: string, data: Partial<Player>): Promise<Player> {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    await pool.execute(`UPDATE players SET ${fields}, updated_at = NOW() WHERE id = ?`, [...Object.values(data), id]);
    return this.findById(id) as Promise<Player>;
  }

  async updateRank(id: string, newRank: number): Promise<void> {
    await pool.execute('UPDATE players SET rank = ?, updated_at = NOW() WHERE id = ?', [newRank, id]);
  }

  async getRankings(limit: number, offset: number): Promise<Player[]> {
    const [rows] = await pool.execute('SELECT * FROM players ORDER BY rank DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows as Player[];
  }
}
