/**
 * IPaymentGateway.ts — Application Port (v2)
 * Contrato unificado para pasarelas de pago.
 * Expandido para soportar MercadoPago, Stripe y Mock.
 * Mantiene métodos legacy para compatibilidad interna de Nexus.
 */

import type { GatewayName }          from '../../payments/constants/payments.constants';
import type {
  BuyerInfo,
  GatewayPaymentResult,
  GatewayRefundResult,
  GatewayStatusResult,
} from '../../payments/domain/entities/PaymentEntities';

// ─── Input para crear un pago (flujo completo Imperial Guard) ─────────────────

export interface CreatePaymentInput {
  orderId:        string;
  totalAmount:    number;   // centavos
  currency:       string;
  description:    string;
  idempotencyKey: string;
  buyer:          BuyerInfo;
  items: Array<{
    title:     string;
    quantity:  number;
    unitPrice: number;  // centavos
  }>;
}

// ─── Contratos legacy (compatibilidad con código original de Nexus) ───────────

export interface PaymentIntentInput {
  amount:      number;
  currency:    string;
  playerId:    string;
  description: string;
  metadata?:   Record<string, string>;
}

export interface PaymentIntent {
  intentId:     string;
  clientSecret: string;
  amount:       number;
  currency:     string;
}

export interface PaymentResult {
  transactionId: string;
  status:        'SUCCESS' | 'FAILED' | 'PENDING';
  amount:        number;
}

// ─── Contrato unificado principal ─────────────────────────────────────────────

export interface IPaymentGateway {
  /** Nombre único de la pasarela (mercadopago | stripe | mock) */
  getGatewayName(): GatewayName;

  /**
   * Crea el pago en la pasarela.
   * MercadoPago → redirectUrl (checkout externo)
   * Stripe      → clientSecret (Elements SDK)
   */
  createPayment(input: CreatePaymentInput): Promise<GatewayPaymentResult>;

  /**
   * Verifica la firma del webhook.
   * Devuelve { valid, event }; nunca lanza excepción.
   */
  verifyWebhook(
    rawBody: Buffer | string,
    signature: string
  ): Promise<{ valid: boolean; event: Record<string, unknown> | null }>;

  /** Consulta el estado real del pago en la pasarela. */
  getPaymentStatus(gatewayTransactionId: string): Promise<GatewayStatusResult>;

  /**
   * Solicita un reembolso total o parcial.
   * @param amount  Centavos; si es undefined → reembolso total.
   */
  refund(
    gatewayTransactionId: string,
    amount?: number,
    reason?: string
  ): Promise<GatewayRefundResult>;

  // ── Legacy (no eliminar — usado por ProcessWebhookUseCase existente) ──────

  /** @deprecated Preferir createPayment() */
  createPaymentIntent?(input: PaymentIntentInput): Promise<PaymentIntent>;
  /** @deprecated Preferir getPaymentStatus() */
  confirmPayment?(intentId: string): Promise<PaymentResult>;
  /** @deprecated Preferir verifyWebhook() */
  validateWebhookSignature?(payload: Buffer, signature: string): boolean;
  /** @deprecated Preferir getPaymentStatus() */
  getTransactionStatus?(transactionId: string): Promise<PaymentResult>;
}
