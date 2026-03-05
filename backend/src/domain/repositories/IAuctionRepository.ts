import { Auction, Bid } from '../entities/Auction';

export interface IAuctionRepository {
  findById(id: string): Promise<Auction | null>;
  findActive(limit: number, offset: number): Promise<Auction[]>;
  create(auction: Omit<Auction, 'id' | 'createdAt' | 'bids' | 'currentBidderId'>): Promise<Auction>;
  placeBid(auctionId: string, bid: Bid): Promise<Auction>;
  close(auctionId: string): Promise<Auction>;
  cancel(auctionId: string, reason: string): Promise<void>;
}
