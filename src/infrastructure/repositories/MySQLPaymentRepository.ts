/**
 * MySQLPaymentRepository.ts — Infrastructure / Repository
 * Implementación MySQL del contrato IPaymentRepository.
 * Migrado desde Imperial Guard (JS) → TypeScript para Nexus Battles.
 * Usa el pool existente de Nexus (mysql2/promise).
 */

import { randomUUID } from 'crypto';
import { pool }       from '../database/connection';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type {
  IPaymentRepository,
  DBConn,
  CreateOrderInput,
  CreateTransactionInput,
  CreateAuditLogInput,
  ProductReservationResult,
  TaxRuleResult,
  PromotionResult,
} from '../../domain/repositories/IPaymentRepository';
import type { PaymentOrder, PaymentTransaction } from '../../payments/domain/entities/PaymentEntities';
import type { OrderStatus, TransactionStatus } from '../../payments/constants/payments.constants';

export class MySQLPaymentRepository implements IPaymentRepository {

  // ─── Transacciones DB ────────────────────────────────────────────────────────

  async beginTransaction(): Promise<DBConn> {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    return conn as unknown as DBConn;
  }

  async commit(conn: DBConn): Promise<void> {
    await (conn as unknown as PoolConnection).commit();
    (conn as unknown as PoolConnection).release();
  }

  async rollback(conn: DBConn): Promise<void> {
    try {
      await (conn as unknown as PoolConnection).rollback();
    } finally {
      (conn as unknown as PoolConnection).release();
    }
  }

  private db(conn?: DBConn | null) {
    return conn ? (conn as unknown as PoolConnection) : pool;
  }

  // ─── Órdenes ─────────────────────────────────────────────────────────────────

  async createOrder(data: CreateOrderInput, conn: DBConn): Promise<{ orderId: string }> {
    const orderId = randomUUID();
    const {
      userId, productId, baseAmount, taxAmount,
      discountAmount, totalAmount, currency, idempotencyKey, promotionId,
    } = data;

    await this.db(conn).execute(
      `INSERT INTO payment_orders
         (order_id, user_id, product_id, base_amount, tax_amount, discount_amount,
          total_amount, currency, status, idempotency_key, promotion_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      [orderId, userId, productId, baseAmount, taxAmount,
       discountAmount, totalAmount, currency, idempotencyKey, promotionId ?? null]
    );

    return { orderId };
  }

  async getOrderById(
    orderId: string,
    conn?: DBConn | null,
    withLock = false
  ): Promise<PaymentOrder | null> {
    const sql = withLock
      ? 'SELECT * FROM payment_orders WHERE order_id = ? AND deleted_at IS NULL FOR UPDATE'
      : 'SELECT * FROM payment_orders WHERE order_id = ? AND deleted_at IS NULL';
    const [rows] = await this.db(conn).execute<RowDataPacket[]>(sql, [orderId]);
    return (rows[0] as PaymentOrder) ?? null;
  }

  async lockOrder(orderId: string, conn: DBConn): Promise<PaymentOrder | null> {
    const [rows] = await this.db(conn).execute<RowDataPacket[]>(
      'SELECT * FROM payment_orders WHERE order_id = ? AND deleted_at IS NULL FOR UPDATE',
      [orderId]
    );
    return (rows[0] as PaymentOrder) ?? null;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, conn?: DBConn | null): Promise<void> {
    await this.db(conn).execute(
      'UPDATE payment_orders SET status = ?, updated_at = NOW() WHERE order_id = ?',
      [status, orderId]
    );
  }

  async countUserOrdersToday(userId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as cnt FROM payment_orders
         WHERE user_id = ? AND DATE(created_at) = CURDATE()
           AND status NOT IN ('CANCELLED','FAILED')`,
      [userId]
    );
    return (rows[0] as { cnt: number }).cnt;
  }

  // ─── Transacciones de pasarela ────────────────────────────────────────────────

  async createTransaction(
    data: CreateTransactionInput,
    conn: DBConn
  ): Promise<{ transactionId: string }> {
    const transactionId = randomUUID();
    const {
      orderId, gatewayName, gatewayOrderId,
      status, amount, currency, gatewayRawResponse,
    } = data;

    await this.db(conn).execute(
      `INSERT INTO payment_transactions
         (transaction_id, order_id, gateway_name, gateway_order_id,
          status, amount, currency, gateway_raw_response)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, orderId, gatewayName, gatewayOrderId ?? null,
       status, amount, currency, JSON.stringify(gatewayRawResponse)]
    );

    return { transactionId };
  }

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    rawResponse: Record<string, unknown>,
    conn?: DBConn | null
  ): Promise<void> {
    await this.db(conn).execute(
      `UPDATE payment_transactions
         SET status = ?, gateway_raw_response = ?, updated_at = NOW()
       WHERE transaction_id = ?`,
      [status, JSON.stringify(rawResponse), transactionId]
    );
  }

  async findTransactionByIdempotencyKey(
    idempotencyKey: string
  ): Promise<{ order_id: string } | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT pt.order_id FROM payment_transactions pt
         JOIN payment_orders o ON pt.order_id = o.order_id
       WHERE o.idempotency_key = ? LIMIT 1`,
      [idempotencyKey]
    );
    return (rows[0] as { order_id: string }) ?? null;
  }

  async findTransactionByGatewayOrderId(
    gatewayOrderId: string
  ): Promise<PaymentTransaction | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM payment_transactions WHERE gateway_order_id = ? LIMIT 1',
      [gatewayOrderId]
    );
    return (rows[0] as PaymentTransaction) ?? null;
  }

  /** Devuelve la transacción más reciente de una orden (para reembolsos) */
  async getTransactionByOrderId(
    orderId: string,
    conn?: DBConn | null
  ): Promise<PaymentTransaction | null> {
    const [rows] = await this.db(conn).execute<RowDataPacket[]>(
      'SELECT * FROM payment_transactions WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
      [orderId]
    );
    return (rows[0] as PaymentTransaction) ?? null;
  }

  // ─── Inventario / Producto ─────────────────────────────────────────────────────

  async reserveProductForUser(
    productId: string,
    userId: number,
    conn: DBConn
  ): Promise<ProductReservationResult> {
    const [products] = await this.db(conn).execute<RowDataPacket[]>(
      `SELECT p.*, ps.available_stock
         FROM products p
         JOIN product_stock ps ON p.product_id = ps.product_id
       WHERE p.product_id = ? AND p.deleted_at IS NULL
         AND p.is_active = 1
         FOR UPDATE`,
      [productId]
    );

    if (!products.length) return { available: false, product: null };

    const product = products[0] as { price_cents: number; name: string; available_stock: number };
    if (product.available_stock <= 0) return { available: false, product };

    const [existing] = await this.db(conn).execute<RowDataPacket[]>(
      `SELECT 1 FROM user_inventory
         WHERE user_id = ? AND product_id = ? AND status = 'ACTIVE' LIMIT 1`,
      [userId, productId]
    );
    if (existing.length) return { available: false, product: { ...product, alreadyOwned: true } };

    // Reservar: decrementa available_stock atómicamente
    await this.db(conn).execute(
      `UPDATE product_stock
         SET reserved_stock  = reserved_stock  + 1,
             available_stock = available_stock - 1,
             updated_at      = NOW()
       WHERE product_id = ? AND available_stock > 0`,
      [productId]
    );

    return { available: true, product };
  }

  async assignProductToUser(
    orderId: string,
    userId: number,
    productId: string,
    conn: DBConn
  ): Promise<void> {
    const inventoryId = randomUUID();
    await this.db(conn).execute(
      `INSERT INTO user_inventory
         (inventory_id, user_id, product_id, order_id, status, assigned_at)
       VALUES (?, ?, ?, ?, 'ACTIVE', NOW())`,
      [inventoryId, userId, productId, orderId]
    );
    // Confirmar reserva: solo libera el reserved_stock
    await this.db(conn).execute(
      `UPDATE product_stock
         SET reserved_stock = reserved_stock - 1,
             updated_at     = NOW()
       WHERE product_id = ?`,
      [productId]
    );
  }

  async releaseProductReservation(
    productId: string,
    _userId: number,
    conn: DBConn
  ): Promise<void> {
    await this.db(conn).execute(
      `UPDATE product_stock
         SET reserved_stock  = reserved_stock  - 1,
             available_stock = available_stock + 1,
             updated_at      = NOW()
       WHERE product_id = ? AND reserved_stock > 0`,
      [productId]
    );
  }

  // ─── Reglas de negocio ─────────────────────────────────────────────────────────

  async getTaxRule(productId: string, countryCode: string): Promise<TaxRuleResult | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT tr.* FROM tax_rules tr
       WHERE (tr.product_id = ? OR tr.product_id IS NULL)
         AND tr.country_code = ?
         AND tr.is_active = 1
       ORDER BY tr.product_id DESC
       LIMIT 1`,
      [productId, countryCode]
    );
    return (rows[0] as TaxRuleResult) ?? null;
  }

  async getValidPromotion(
    promoCode: string,
    productId: string,
    userId: number
  ): Promise<PromotionResult | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.* FROM promotions p
       WHERE p.code = ?
         AND p.is_active = 1
         AND p.deleted_at IS NULL
         AND (p.product_id IS NULL OR p.product_id = ?)
         AND (p.max_uses IS NULL OR p.current_uses < p.max_uses)
         AND (p.valid_from  IS NULL OR p.valid_from  <= NOW())
         AND (p.valid_until IS NULL OR p.valid_until >= NOW())
       LIMIT 1`,
      [promoCode, productId]
    );
    if (!rows.length) return null;

    const promo = rows[0] as PromotionResult & { promotion_id: string };

    // El mismo usuario no puede reutilizar el código
    const [used] = await pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM payment_orders
         WHERE user_id = ? AND promotion_id = ?
           AND status IN ('PAID','PROCESSING')
       LIMIT 1`,
      [userId, promo.promotion_id]
    );
    if (used.length) return null;

    return promo;
  }

  // ─── Reembolsos ───────────────────────────────────────────────────────────────

  async createRefund(
    data: {
      transactionId:   string;
      orderId:         string;
      amount:          number;
      reason:          string;
      gatewayRefundId: string;
      requestedBy:     string | number;
    },
    conn: DBConn
  ): Promise<{ refundId: string }> {
    const refundId = randomUUID();
    const { transactionId, orderId, amount, reason, gatewayRefundId, requestedBy } = data;

    await this.db(conn).execute(
      `INSERT INTO refunds
         (refund_id, transaction_id, order_id, amount, reason,
          gateway_refund_id, requested_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'COMPLETED')`,
      [refundId, transactionId, orderId, amount, reason, gatewayRefundId, requestedBy]
    );

    return { refundId };
  }

  // ─── Auditoría (INSERT ONLY — nunca UPDATE/DELETE) ────────────────────────────

  async createAuditLog(data: CreateAuditLogInput, conn?: DBConn | null): Promise<void> {
    const {
      entityType, entityId, action,
      previousStatus, newStatus, actorId, metadata,
    } = data;

    await this.db(conn).execute(
      `INSERT INTO audit_logs
         (log_id, entity_type, entity_id, action,
          previous_status, new_status, actor_id, metadata, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(), entityType, entityId, action,
        previousStatus ?? null, newStatus ?? null,
        String(actorId), JSON.stringify(metadata ?? {}),
        (metadata as any)?.ipAddress ?? null,
      ]
    );
  }

  // ─── Legacy (compatibilidad con IPaymentRepository original de Nexus) ─────────

  async findById(id: string): Promise<{ id: string; status: string } | null> {
    const order = await this.getOrderById(id);
    if (!order) return null;
    return { id: order.order_id, status: order.status };
  }

  async findByExternalId(externalId: string): Promise<{ id: string; status: string } | null> {
    const tx = await this.findTransactionByGatewayOrderId(externalId);
    if (!tx) return null;
    return { id: tx.transaction_id, status: tx.status };
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.updateOrderStatus(id, status as OrderStatus);
  }
}

// Singleton para inyección en toda la app
export const paymentRepository = new MySQLPaymentRepository();
