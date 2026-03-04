export interface PaymentIntentInput {
  amount: number;
  currency: string;
  playerId: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  intentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaymentResult {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
}

export interface IPaymentGateway {
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntent>;
  confirmPayment(intentId: string): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<void>;
  validateWebhookSignature(payload: Buffer, signature: string): boolean;
  getTransactionStatus(transactionId: string): Promise<PaymentResult>;
}
