export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  playerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  externalId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
