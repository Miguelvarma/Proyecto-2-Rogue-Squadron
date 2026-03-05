/**
 * PaymentEntities.ts
 * Entidades de dominio del módulo de pagos de Nexus Battles.
 * Amplía las entidades existentes con el modelo completo de Imperial Guard.
 */

import { OrderStatus, TransactionStatus, GatewayName, AuditAction } from '../../constants/payments.constants';

// ─── Orden de Pago ─────────────────────────────────────────────────────────────

export interface PaymentOrder {
  order_id:        string;
  user_id:         number;        // FK → players.id de Nexus Battles
  product_id:      string;
  base_amount:     number;        // centavos
  tax_amount:      number;        // centavos
  discount_amount: number;        // centavos
  total_amount:    number;        // centavos
  currency:        string;        // ISO 4217 (USD, COP, etc.)
  status:          OrderStatus;
  idempotency_key: string;
  promotion_id:    string | null;
  created_at:      Date;
  updated_at:      Date;
  deleted_at:      Date | null;
}

// ─── Transacción de Pasarela ───────────────────────────────────────────────────

export interface PaymentTransaction {
  transaction_id:       string;
  order_id:             string;
  gateway_name:         GatewayName;
  gateway_order_id:     string | null;  // ID externo de la pasarela
  status:               TransactionStatus;
  amount:               number;         // centavos
  currency:             string;
  gateway_raw_response: Record<string, unknown>;
  created_at:           Date;
  updated_at:           Date;
}

// ─── Log de Auditoría ──────────────────────────────────────────────────────────

export interface AuditLog {
  log_id:          string;
  entity_type:     'ORDER' | 'TRANSACTION' | 'INVENTORY';
  entity_id:       string;
  action:          AuditAction;
  previous_status: string | null;
  new_status:      string | null;
  actor_id:        string | number;   // user_id o 'WEBHOOK' / 'SYSTEM'
  metadata:        Record<string, unknown>;
  created_at:      Date;
}

// ─── Buyer Info (del cliente) ──────────────────────────────────────────────────

export interface BuyerInfo {
  email:   string;
  name:    string;
  phone?:  string;
  docType?: string;   // DNI, CC, etc.
  docNumber?: string;
}

// ─── Resultado de pasarela ─────────────────────────────────────────────────────

export interface GatewayPaymentResult {
  gatewayOrderId: string;
  redirectUrl?:   string;      // Para MercadoPago (checkout externo)
  clientSecret?:  string;      // Para Stripe (Elements)
  rawResponse:    Record<string, unknown>;
}

export interface GatewayRefundResult {
  refundId:    string;
  status:      string;
  rawResponse: Record<string, unknown>;
}

export interface GatewayStatusResult {
  status:      TransactionStatus;
  rawResponse: Record<string, unknown>;
}
