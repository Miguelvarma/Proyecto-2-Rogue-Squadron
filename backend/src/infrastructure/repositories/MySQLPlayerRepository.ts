/**
 * MySQLPlayerRepository.ts — Infrastructure / Repositories
 * Implementación MySQL de IPlayerRepository.
 */

import { pool } from '../database/connection';
import type { Player } from '../../domain/entities/Player';
import { randomUUID } from 'crypto';

interface InventoryRow {
  id:          string;
  player_id:   string;
  name:        string;
  rarity:      string;
  metadata:    any;
  acquired_at: Date;
}

class MySQLPlayerRepository {

  async findById(id: string): Promise<Player | null> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM players WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) return null;
    return this._map(rows[0]);
  }

  async findByEmail(email: string): Promise<Player | null> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM players WHERE email = ? LIMIT 1',
      [email]
    );
    if (!rows.length) return null;
    return this._map(rows[0]);
  }

  async findByUsername(username: string): Promise<Player | null> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM players WHERE username = ? LIMIT 1',
      [username]
    );
    if (!rows.length) return null;
    return this._map(rows[0]);
  }

  async save(data: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
    const id = randomUUID();
    await pool.execute(
      `INSERT INTO players (id, username, email, password_hash, role, \`rank\`, coins)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.username, data.email, data.passwordHash, data.role, data.rank, data.coins]
    );
    const player = await this.findById(id);
    return player!;
  }

  async update(id: string, data: Partial<Player>): Promise<Player> {
    const fields: string[] = [];
    const values: any[]   = [];

    if (data.username)     { fields.push('username = ?');      values.push(data.username); }
    if (data.passwordHash) { fields.push('password_hash = ?'); values.push(data.passwordHash); }
    if (data.role)         { fields.push('role = ?');          values.push(data.role); }
    if (data.rank != null) { fields.push('`rank` = ?');        values.push(data.rank); }
    if (data.coins != null){ fields.push('coins = ?');         values.push(data.coins); }

    if (fields.length) {
      fields.push('updated_at = NOW()');
      values.push(id);
      await pool.execute(
        `UPDATE players SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const player = await this.findById(id);
    return player!;
  }

  async updateRank(id: string, newRank: number): Promise<void> {
    await pool.execute(
      'UPDATE players SET `rank` = ?, updated_at = NOW() WHERE id = ?',
      [newRank, id]
    );
  }

  async getRankings(limit: number, offset: number): Promise<Player[]> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM players ORDER BY `rank` DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows.map((r: any) => this._map(r));
  }

  async findRankings(limit: number, offset: number): Promise<Player[]> {
    return this.getRankings(limit, offset);
  }

  async findInventory(playerId: string): Promise<InventoryRow[]> {
    const [rows]: any = await pool.execute(
      `SELECT id, player_id, name, rarity, metadata, acquired_at
       FROM inventory_items
       WHERE player_id = ?
       ORDER BY acquired_at DESC`,
      [playerId]
    );
    return rows.map((r: any) => ({
      ...r,
      metadata: r.metadata ? (typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata) : {},
    }));
  }

  async updateUsername(playerId: string, username: string): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        'UPDATE players SET username = ?, updated_at = NOW() WHERE id = ?',
        [username, playerId]
      );
      return result.affectedRows > 0;
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') return false;
      throw err;
    }
  }

  async addCoins(playerId: string, amount: number): Promise<void> {
    await pool.execute(
      'UPDATE players SET coins = coins + ?, updated_at = NOW() WHERE id = ?',
      [amount, playerId]
    );
  }

  private _map(row: any): Player {
    return {
      id:           row.id,
      username:     row.username,
      email:        row.email,
      passwordHash: row.password_hash,
      role:         row.role,
      rank:         row.rank,
      coins:        row.coins,
      createdAt:    row.created_at,
      updatedAt:    row.updated_at,
    };
  }
}

export const playerRepository = new MySQLPlayerRepository();
