/**
 * HandleWebhookUseCase.ts — Application / Use Cases / Payments
 * Procesa eventos de webhook de la pasarela de forma idempotente.
 * Verifica firma, consulta estado real, actualiza TX + orden + inventario.
 * Migrado desde Imperial Guard (JS) → TypeScript para Nexus Battles.
 */

import {
  ORDER_STATUS,
  TRANSACTION_STATUS,
  AUDIT_ACTIONS,
} from '../../../payments/constants/payments.constants';
import type { IPaymentRepository }   from '../../../domain/repositories/IPaymentRepository';
import type { IPaymentGateway }      from '../../ports/IPaymentGateway';
import type { PaymentOrder, PaymentTransaction } from '../../../payments/domain/entities/PaymentEntities';
import { logger }                    from '../../../infrastructure/logging/logger';

export interface HandleWebhookInput {
  rawBody:   Buffer | string;
  signature: string;
  ipAddress: string;
}

export interface HandleWebhookResult {
  processed:   boolean;
  reason?:     string;
  orderId?:    string;
  newStatus?:  string;
}

export class HandleWebhookUseCase {
  constructor(
    private readonly repository: IPaymentRepository,
    private readonly gateway:    IPaymentGateway,
  ) {}

  async execute(input: HandleWebhookInput): Promise<HandleWebhookResult> {
    const { rawBody, signature, ipAddress } = input;

    // ── 1. Verificar firma criptográfica ────────────────────────────────────────
    const { valid, event } = await this.gateway.verifyWebhook(rawBody, signature);
    if (!valid || !event) {
      logger.warn('HandleWebhook: invalid signature', {
        gateway: this.gateway.getGatewayName(), ipAddress,
      });
      throw this._error('INVALID_WEBHOOK_SIGNATURE', 'Firma de webhook inválida', 401);
    }

    logger.info('HandleWebhook: valid event received', {
      gateway: this.gateway.getGatewayName(),
      type:    event['type'] ?? event['action'],
    });

    // ── 2. Extraer gatewayOrderId según pasarela ────────────────────────────────
    const gatewayOrderId = this._extractGatewayOrderId(event);
    if (!gatewayOrderId) {
      logger.warn('HandleWebhook: no gatewayOrderId found', { event });
      return { processed: false, reason: 'NO_GATEWAY_ORDER_ID' };
    }

    // ── 3. Buscar transacción local ─────────────────────────────────────────────
    const tx = await this.repository.findTransactionByGatewayOrderId(gatewayOrderId);
    if (!tx) {
      logger.warn('HandleWebhook: transaction not found', { gatewayOrderId });
      return { processed: false, reason: 'TX_NOT_FOUND' };
    }

    // ── 4. Consultar estado REAL en pasarela (no confiar solo en el webhook) ────
    const { status: gatewayStatus, rawResponse } =
      await this.gateway.getPaymentStatus(gatewayOrderId);

    const conn = await this.repository.beginTransaction();
    try {
      // ── 5. Lock orden ──────────────────────────────────────────────────────────
      const order = await this.repository.lockOrder(tx.order_id, conn);
      if (!order) {
        await this.repository.rollback(conn);
        return { processed: false, reason: 'ORDER_NOT_FOUND' };
      }

      // Idempotencia: si ya fue PAID o REFUNDED, ignorar
      if ([ORDER_STATUS.PAID, ORDER_STATUS.REFUNDED].includes(order.status as any)) {
        await this.repository.rollback(conn);
        return { processed: true, reason: 'ALREADY_PROCESSED', orderId: order.order_id };
      }

      // ── 6. Actualizar según estado de la pasarela ─────────────────────────────
      if (gatewayStatus === TRANSACTION_STATUS.APPROVED) {
        await this._confirmPayment(order, tx, rawResponse, conn);
      } else if (
        gatewayStatus === TRANSACTION_STATUS.REJECTED ||
        gatewayStatus === TRANSACTION_STATUS.ERROR
      ) {
        await this._failPayment(order, tx, rawResponse, conn);
      } else {
        // PENDING: solo actualizar TX, no mover orden
        await this.repository.updateTransactionStatus(
          tx.transaction_id, gatewayStatus, rawResponse, conn
        );
      }

      // ── 7. Registro de auditoría ──────────────────────────────────────────────
      await this.repository.createAuditLog({
        entityType: 'TRANSACTION', entityId: tx.transaction_id,
        action:         AUDIT_ACTIONS.WEBHOOK_RECEIVED,
        previousStatus: tx.status,
        newStatus:      gatewayStatus,
        actorId:        'WEBHOOK',
        metadata:       {
          gateway:      this.gateway.getGatewayName(),
          gatewayOrderId,
          ipAddress,
        },
      }, conn);

      await this.repository.commit(conn);
      return { processed: true, orderId: order.order_id, newStatus: gatewayStatus };

    } catch (err) {
      await this.repository.rollback(conn);
      logger.error('HandleWebhook: error processing', { error: (err as Error).message });
      throw err;
    }
  }

  // ─── Confirmar pago: TX + orden + inventario (atómica) ───────────────────────

  private async _confirmPayment(
    order:       PaymentOrder,
    tx:          PaymentTransaction,
    rawResponse: Record<string, unknown>,
    conn:        any
  ): Promise<void> {
    await this.repository.updateTransactionStatus(
      tx.transaction_id, TRANSACTION_STATUS.APPROVED, rawResponse, conn
    );
    await this.repository.updateOrderStatus(order.order_id, ORDER_STATUS.PAID, conn);
    await this.repository.assignProductToUser(
      order.order_id, order.user_id, order.product_id, conn
    );
    await this.repository.createAuditLog({
      entityType: 'ORDER', entityId: order.order_id,
      action:         AUDIT_ACTIONS.ORDER_STATUS_CHANGED,
      previousStatus: order.status,
      newStatus:      ORDER_STATUS.PAID,
      actorId:        'WEBHOOK',
      metadata:       { transactionId: tx.transaction_id },
    }, conn);
    await this.repository.createAuditLog({
      entityType: 'INVENTORY', entityId: order.order_id,
      action:         AUDIT_ACTIONS.INVENTORY_ASSIGNED,
      previousStatus: null,
      newStatus:      'ACTIVE',
      actorId:        'WEBHOOK',
      metadata:       { productId: order.product_id, userId: order.user_id },
    }, conn);
    logger.info('HandleWebhook: payment confirmed', { orderId: order.order_id });
  }

  // ─── Fallar pago: libera reserva ─────────────────────────────────────────────

  private async _failPayment(
    order:       PaymentOrder,
    tx:          PaymentTransaction,
    rawResponse: Record<string, unknown>,
    conn:        any
  ): Promise<void> {
    await this.repository.updateTransactionStatus(
      tx.transaction_id, TRANSACTION_STATUS.REJECTED, rawResponse, conn
    );
    await this.repository.updateOrderStatus(order.order_id, ORDER_STATUS.FAILED, conn);
    await this.repository.releaseProductReservation(order.product_id, order.user_id, conn);
    await this.repository.createAuditLog({
      entityType: 'ORDER', entityId: order.order_id,
      action:         AUDIT_ACTIONS.ORDER_STATUS_CHANGED,
      previousStatus: order.status,
      newStatus:      ORDER_STATUS.FAILED,
      actorId:        'WEBHOOK',
      metadata:       { transactionId: tx.transaction_id },
    }, conn);
    logger.warn('HandleWebhook: payment failed', { orderId: order.order_id });
  }

  // ─── Extraer ID de la orden según pasarela ────────────────────────────────────

  private _extractGatewayOrderId(event: Record<string, unknown>): string | null {
    // MercadoPago: event.data.id
    const mpId = (event?.['data'] as any)?.['id'];
    if (mpId) return String(mpId);
    // Stripe: event.data.object.id
    const stripeId = (event?.['data'] as any)?.['object']?.['id'];
    if (stripeId) return stripeId;
    // Mock
    if (event?.['gatewayOrderId']) return event['gatewayOrderId'] as string;
    return null;
  }

  private _error(code: string, message: string, statusCode: number): Error {
    const err: any = new Error(message);
    err.code       = code;
    err.statusCode = statusCode;
    return err;
  }
}
