/**
 * IPaymentRepository.ts — Domain Repository Interface (v2)
 * Contrato expandido para el repositorio de pagos de Nexus Battles.
 * Integra el patrón de transacciones ACID y auditoría de Imperial Guard.
 */

import type { PoolConnection } from 'mysql2/promise';
import type {
  PaymentOrder,
  PaymentTransaction,
} from '../../payments/domain/entities/PaymentEntities';
import type {
  OrderStatus,
  TransactionStatus,
  AuditAction,
} from '../../payments/constants/payments.constants';

export type DBConn = PoolConnection;

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  userId:         number;
  productId:      string;
  baseAmount:     number;
  taxAmount:      number;
  discountAmount: number;
  totalAmount:    number;
  currency:       string;
  idempotencyKey: string;
  promotionId:    string | null;
}

export interface CreateTransactionInput {
  orderId:            string;
  gatewayName:        string;
  gatewayOrderId:     string | null;
  status:             TransactionStatus;
  amount:             number;
  currency:           string;
  gatewayRawResponse: Record<string, unknown>;
}

export interface CreateAuditLogInput {
  entityType:     'ORDER' | 'TRANSACTION' | 'INVENTORY';
  entityId:       string;
  action:         AuditAction;
  previousStatus: string | null;
  newStatus:      string | null;
  actorId:        string | number;
  metadata:       Record<string, unknown>;
}

export interface ProductReservationResult {
  product:   { price_cents: number; name: string; alreadyOwned?: boolean } | null;
  available: boolean;
}

export interface TaxRuleResult {
  rate:        number;
  countryCode: string;
}

export interface PromotionResult {
  promotion_id:   string;
  discount_type:  'PERCENTAGE' | 'FIXED';
  discount_value: number;
}

// ─── Contrato completo ────────────────────────────────────────────────────────

export interface IPaymentRepository {
  // ── Transacciones DB ────────────────────────────────────────────────────────
  beginTransaction(): Promise<DBConn>;
  commit(conn: DBConn): Promise<void>;
  rollback(conn: DBConn): Promise<void>;

  // ── Órdenes ─────────────────────────────────────────────────────────────────
  createOrder(data: CreateOrderInput, conn: DBConn): Promise<{ orderId: string }>;
  getOrderById(orderId: string, conn?: DBConn | null, withLock?: boolean): Promise<PaymentOrder | null>;
  lockOrder(orderId: string, conn: DBConn): Promise<PaymentOrder | null>;
  updateOrderStatus(orderId: string, status: OrderStatus, conn?: DBConn | null): Promise<void>;
  countUserOrdersToday(userId: number): Promise<number>;

  // ── Transacciones de pasarela ────────────────────────────────────────────────
  createTransaction(data: CreateTransactionInput, conn: DBConn): Promise<{ transactionId: string }>;
  updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    rawResponse: Record<string, unknown>,
    conn?: DBConn | null,
  ): Promise<void>;
  findTransactionByIdempotencyKey(idempotencyKey: string): Promise<{ order_id: string } | null>;
  findTransactionByGatewayOrderId(gatewayOrderId: string): Promise<PaymentTransaction | null>;

  // ── Inventario / Producto ─────────────────────────────────────────────────────
  reserveProductForUser(productId: string, userId: number, conn: DBConn): Promise<ProductReservationResult>;
  releaseProductReservation(productId: string, userId: number, conn: DBConn): Promise<void>;
  assignProductToUser(orderId: string, userId: number, productId: string, conn: DBConn): Promise<void>;

  // ── Reglas de negocio ─────────────────────────────────────────────────────────
  getTaxRule(productId: string, countryCode: string): Promise<TaxRuleResult | null>;
  getValidPromotion(promoCode: string, productId: string, userId: number): Promise<PromotionResult | null>;

  // ── Auditoría ─────────────────────────────────────────────────────────────────
  createAuditLog(data: CreateAuditLogInput, conn?: DBConn | null): Promise<void>;

  // ── Legacy (compatibilidad con contrato original de Nexus) ───────────────────
  findById(id: string): Promise<{ id: string; status: string } | null>;
  findByExternalId(externalId: string): Promise<{ id: string; status: string } | null>;
  updateStatus(id: string, status: string): Promise<void>;
}
