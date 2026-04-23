import { Player } from '../entities/Player';
import { ValidationError } from '../errors/DomainError';

export class PlayerDomainService {
  validateSufficientCoins(player: Player, required: number): void {
    if (player.coins < required) {
      throw new ValidationError(`Saldo insuficiente. Disponible: ${player.coins}, requerido: ${required}`);
    }
  }

  calculateNewRank(currentRank: number, coinsEarned: number): number {
    // Logica de ranking — ajustar segun reglas del juego
    return Math.floor(currentRank + coinsEarned / 100);
  }
}
