import { Payment } from '../entities/Payment';

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByExternalId(externalId: string): Promise<Payment | null>;
  create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  updateStatus(id: string, status: Payment['status']): Promise<void>;
}
