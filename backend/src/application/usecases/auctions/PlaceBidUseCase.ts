import { IAuctionRepository } from '../../../domain/repositories/IAuctionRepository';
import { IPlayerRepository } from '../../../domain/repositories/IPlayerRepository';
import { AuctionDomainService } from '../../../domain/services/AuctionDomainService';
import { PlayerDomainService } from '../../../domain/services/PlayerDomainService';
import { NotFoundError } from '../../../domain/errors/DomainError';

export interface PlaceBidInput {
  auctionId: string;
  playerId: string;
  amount: number;
}

export class PlaceBidUseCase {
  private auctionService = new AuctionDomainService();
  private playerService = new PlayerDomainService();

  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly playerRepository: IPlayerRepository,
  ) {}

  async execute(input: PlaceBidInput) {
    const [auction, player] = await Promise.all([
      this.auctionRepository.findById(input.auctionId),
      this.playerRepository.findById(input.playerId),
    ]);

    if (!auction) throw new NotFoundError('Subasta');
    if (!player) throw new NotFoundError('Jugador');

    const bid = { playerId: input.playerId, amount: input.amount, placedAt: new Date() };
    this.auctionService.validateBid(auction, bid);
    this.playerService.validateSufficientCoins(player, input.amount);

    return this.auctionRepository.placeBid(input.auctionId, bid);
  }
}
