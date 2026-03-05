import { AuctionDomainService } from '../../../src/domain/services/AuctionDomainService';
import { Auction } from '../../../src/domain/entities/Auction';

describe('AuctionDomainService', () => {
  const service = new AuctionDomainService();

  const baseAuction: Auction = {
    id: '1', itemId: 'item1', sellerId: 'seller1',
    startPrice: 100, currentPrice: 100, currentBidderId: null, bids: [],
    status: 'ACTIVE', endsAt: new Date(Date.now() + 86400000), createdAt: new Date(),
  };

  it('debe rechazar puja del propio vendedor', () => {
    const bid = { playerId: 'seller1', amount: 200, placedAt: new Date() };
    expect(() => service.validateBid(baseAuction, bid)).toThrow('vendedor');
  });

  it('debe rechazar puja menor o igual al precio actual', () => {
    const bid = { playerId: 'player2', amount: 100, placedAt: new Date() };
    expect(() => service.validateBid(baseAuction, bid)).toThrow('mayor');
  });

  it('debe aceptar puja valida', () => {
    const bid = { playerId: 'player2', amount: 150, placedAt: new Date() };
    expect(() => service.validateBid(baseAuction, bid)).not.toThrow();
  });

  it('debe rechazar si la subasta no esta activa', () => {
    const closed = { ...baseAuction, status: 'CLOSED' as const };
    const bid = { playerId: 'player2', amount: 200, placedAt: new Date() };
    expect(() => service.validateBid(closed, bid)).toThrow('activa');
  });
});
