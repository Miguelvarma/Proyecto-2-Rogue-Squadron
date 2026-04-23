/**
 * IPaymentGateway.ts — Application / Ports
 * Contrato que implementan MercadoPagoGateway y MockPaymentGateway.
 *
 * FIX: interfaz original tenía createPaymentIntent/confirmPayment/validateWebhookSignature
 *      que no coincidían con los métodos reales de las implementaciones.
 *      Corregida para reflejar: createPayment, verifyWebhook, getPaymentStatus, refund, getGatewayName.
 */

import type { GatewayName }           from '../../payments/constants/payments.constants';
import type {
  GatewayPaymentResult,
  GatewayRefundResult,
  GatewayStatusResult,
} from '../../payments/domain/entities/PaymentEntities';

export interface CreatePaymentInput {
  orderId:        string;
  totalAmount:    number;
  currency:       string;
  description:    string;
  idempotencyKey: string;
  buyer: {
    email: string;
    name:  string;
  };
  items: Array<{
    title:     string;
    quantity:  number;
    unitPrice: number;
  }>;
}

export interface IPaymentGateway {
  getGatewayName(): GatewayName;

  createPayment(input: CreatePaymentInput): Promise<GatewayPaymentResult>;

  verifyWebhook(
    rawBody: Buffer | string,
    signature: string
  ): Promise<{ valid: boolean; event: Record<string, unknown> | null }>;

  getPaymentStatus(gatewayTransactionId: string): Promise<GatewayStatusResult>;

  refund(
    gatewayTransactionId: string,
    amount?: number,
    reason?: string
  ): Promise<GatewayRefundResult>;
}
