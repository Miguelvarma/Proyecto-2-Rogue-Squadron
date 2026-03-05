/**
 * MySQLPlayerRepository.ts — Infrastructure / Repositories
 * Implementación MySQL de IPlayerRepository.
 * Agrega los métodos que necesita PlayerController.
 *
 * NOTA al equipo DB: La tabla `players` usa `coins` en BD pero
 * el frontend espera `gold` — la transformación ocurre en el Controller.
 * La columna `xp` aún no está en el schema — se devuelve 0 hasta que se agregue.
 */

import { pool } from '../database/connection';
import type { Player } from '../../domain/entities/Player';

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

  async findRankings(limit: number, offset: number): Promise<Player[]> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM players ORDER BY rank DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows.map((r: any) => this._map(r));
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
      // Duplicate entry → username ya existe
      if (err.code === 'ER_DUP_ENTRY') return false;
      throw err;
    }
  }

  // Actualiza coins (llamado desde HandleWebhookUseCase cuando el pago es APPROVED)
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
