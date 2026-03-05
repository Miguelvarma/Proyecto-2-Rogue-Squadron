export type AuctionStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export interface Bid {
  playerId: string;
  amount: number;
  placedAt: Date;
}

export interface Auction {
  id: string;
  itemId: string;
  sellerId: string;
  startPrice: number;
  currentPrice: number;
  currentBidderId: string | null;
  bids: Bid[];
  status: AuctionStatus;
  endsAt: Date;
  createdAt: Date;
}
