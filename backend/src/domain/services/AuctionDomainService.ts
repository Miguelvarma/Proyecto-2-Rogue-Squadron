import { Auction, Bid } from '../entities/Auction';
import { ConflictError, ValidationError } from '../errors/DomainError';

export class AuctionDomainService {
  validateBid(auction: Auction, bid: Bid): void {
    if (auction.status !== 'ACTIVE') {
      throw new ConflictError('La subasta no esta activa');
    }
    if (new Date() > auction.endsAt) {
      throw new ConflictError('La subasta ha expirado');
    }
    if (bid.playerId === auction.sellerId) {
      throw new ValidationError('El vendedor no puede pujar en su propia subasta');
    }
    if (bid.amount <= auction.currentPrice) {
      throw new ConflictError(`La puja debe ser mayor a ${auction.currentPrice}`);
    }
  }
}
