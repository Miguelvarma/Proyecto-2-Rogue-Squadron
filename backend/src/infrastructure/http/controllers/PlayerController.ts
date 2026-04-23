/**
 * PlayerController.ts — Infrastructure / Controllers
 * Implementa todos los endpoints de /api/v1/players que estaban en 501.
 *
 * Endpoints que cubre:
 *   GET  /players/rankings         → playerController.getRankings
 *   GET  /players/me               → playerController.getMe
 *   PATCH /players/me              → playerController.updateMe
 *   GET  /players/me/inventory     → playerController.getInventory
 *   GET  /players/:id              → playerController.getById
 *
 * NOTA: Este controlador lee directamente de los repositorios MySQL.
 * El equipo de dominio puede extraerlos a use cases en la siguiente iteración.
 */

import { Request, Response, NextFunction } from 'express';
import { playerRepository } from '../../repositories/MySQLPlayerRepository';
import { logger } from '../../logging/logger';

export class PlayerController {

  // ── GET /api/v1/players/rankings ────────────────────────────────────────────
  async getRankings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit  = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const players = await playerRepository.findRankings(limit, offset);

      res.json({
        success: true,
        data: players.map(p => ({
          id:        p.id,
          username:  p.username,
          role:      p.role,
          rank:      p.rank,
          gold:      p.coins,
          xp:        (p as any).xp ?? 0,
        })),
      });
    } catch (err) { next(err); }
  }

  // ── GET /api/v1/players/me ───────────────────────────────────────────────────
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
        return;
      }

      const player = await playerRepository.findById(userId);
      if (!player) {
        res.status(404).json({ success: false, error: 'PLAYER_NOT_FOUND' });
        return;
      }

      // Nunca exponer passwordHash
      res.json({
        success: true,
        data: {
          id:        player.id,
          username:  player.username,
          email:     player.email,
          role:      player.role,
          rank:      player.rank,
          gold:      player.coins,
          xp:        (player as any).xp ?? 0,
          createdAt: player.createdAt,
        },
      });
    } catch (err) { next(err); }
  }

  // ── PATCH /api/v1/players/me ─────────────────────────────────────────────────
  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { username } = req.body;

      // Solo se permite cambiar el username por ahora
      if (!username || typeof username !== 'string' || username.trim().length < 3) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'El username debe tener al menos 3 caracteres',
        });
        return;
      }

      const updated = await playerRepository.updateUsername(userId, username.trim());
      if (!updated) {
        res.status(409).json({ success: false, error: 'USERNAME_TAKEN' });
        return;
      }

      logger.info('PlayerController.updateMe', { userId, username });

      res.json({
        success: true,
        data: { username: username.trim() },
      });
    } catch (err) { next(err); }
  }

  // ── GET /api/v1/players/me/inventory ─────────────────────────────────────────
  async getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const items  = await playerRepository.findInventory(userId);

      res.json({
        success: true,
        data: items.map(item => ({
          id:          item.id,
          ownerId:     item.player_id,
          name:        item.name,
          description: item.metadata?.description ?? '',
          type:        item.metadata?.type ?? 'ARTIFACT',
          rarity:      item.rarity,
          stats:       item.metadata?.stats ?? {},
          isEquipped:  item.metadata?.isEquipped ?? false,
          acquiredAt:  item.acquired_at,
        })),
      });
    } catch (err) { next(err); }
  }

  // ── GET /api/v1/players/:id ──────────────────────────────────────────────────
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const player = await playerRepository.findById(req.params.id);
      if (!player) {
        res.status(404).json({ success: false, error: 'PLAYER_NOT_FOUND' });
        return;
      }

      // Vista pública: sin email ni passwordHash
      res.json({
        success: true,
        data: {
          id:       player.id,
          username: player.username,
          role:     player.role,
          rank:     player.rank,
          gold:     player.coins,
          xp:       (player as any).xp ?? 0,
        },
      });
    } catch (err) { next(err); }
  }
}

export const playerController = new PlayerController();
