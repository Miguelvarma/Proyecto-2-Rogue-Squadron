/**
 * MockPaymentGateway.ts — Infrastructure / Gateway
 * Pasarela simulada para desarrollo y testing.
 * Siempre aprueba pagos sin llamadas externas.
 */

import { randomUUID } from 'crypto';
import type { IPaymentGateway, CreatePaymentInput } from '../../application/ports/IPaymentGateway';
import type {
  GatewayPaymentResult,
  GatewayRefundResult,
  GatewayStatusResult,
} from '../../payments/domain/entities/PaymentEntities';
import type { GatewayName } from '../../payments/constants/payments.constants';
import { TRANSACTION_STATUS } from '../../payments/constants/payments.constants';

export class MockPaymentGateway implements IPaymentGateway {
  getGatewayName(): GatewayName { return 'mock'; }

  async createPayment(input: CreatePaymentInput): Promise<GatewayPaymentResult> {
    const gatewayOrderId = `MOCK-${randomUUID()}`;
    return {
      gatewayOrderId,
      redirectUrl:  `http://localhost:5173/payments/mock-checkout?order=${gatewayOrderId}`,
      rawResponse:  { mock: true, orderId: input.orderId, gatewayOrderId },
    };
  }

  async verifyWebhook(
    _rawBody: Buffer | string,
    _signature: string
  ): Promise<{ valid: boolean; event: Record<string, unknown> }> {
    // En mock siempre válido
    return { valid: true, event: { mock: true, gatewayOrderId: `MOCK-${randomUUID()}` } };
  }

  async getPaymentStatus(gatewayTransactionId: string): Promise<GatewayStatusResult> {
    return {
      status:      TRANSACTION_STATUS.APPROVED,
      rawResponse: { mock: true, gatewayTransactionId },
    };
  }

  async refund(gatewayTransactionId: string, amount?: number): Promise<GatewayRefundResult> {
    return {
      refundId:    `REFUND-MOCK-${randomUUID()}`,
      status:      'approved',
      rawResponse: { mock: true, gatewayTransactionId, amount },
    };
  }
}
