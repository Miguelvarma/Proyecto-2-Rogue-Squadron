/**
 * RefundPaymentUseCase.ts — Application / Use Cases / Payments
 * Procesa reembolsos totales o parciales con auditoría completa.
 * Migrado desde Imperial Guard (JS) → TypeScript para Nexus Battles.
 */

import {
  ORDER_STATUS,
  TRANSACTION_STATUS,
  AUDIT_ACTIONS,
} from '../../../payments/constants/payments.constants';
import type { IPaymentRepository }   from '../../../domain/repositories/IPaymentRepository';
import type { IPaymentGateway }      from '../../ports/IPaymentGateway';
import { logger }                    from '../../../infrastructure/logging/logger';

export interface RefundPaymentInput {
  orderId:     string;
  userId:      number;
  amount?:     number;   // centavos; undefined = reembolso total
  reason:      string;
  requestedBy: number;
}

export interface RefundPaymentResult {
  refundId: string;
  orderId:  string;
  amount:   number;
  status:   'COMPLETED';
}

export class RefundPaymentUseCase {
  constructor(
    private readonly repository: IPaymentRepository,
    private readonly gateway:    IPaymentGateway,
  ) {}

  async execute(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    const { orderId, userId, amount, reason, requestedBy } = input;
    const conn = await this.repository.beginTransaction();

    try {
      // ── 1. Lock y validar orden ───────────────────────────────────────────────
      const order = await this.repository.lockOrder(orderId, conn);
      if (!order)
        throw this._error('ORDER_NOT_FOUND', 'Orden no encontrada', 404);
      if (order.user_id !== userId)
        throw this._error('FORBIDDEN', 'No autorizado', 403);
      if (order.status !== ORDER_STATUS.PAID)
        throw this._error('NOT_REFUNDABLE', `Orden en estado ${order.status} no es reembolsable`, 409);

      // ── 2. Obtener transacción aprobada ───────────────────────────────────────
      const tx = await (this.repository as any).getTransactionByOrderId(orderId, conn);
      if (!tx || tx.status !== TRANSACTION_STATUS.APPROVED)
        throw this._error('TX_NOT_FOUND', 'Transacción aprobada no encontrada', 404);

      const refundAmount = amount ?? order.total_amount;

      // ── 3. Commit parcial antes de llamar pasarela ────────────────────────────
      await this.repository.commit(conn);

      // ── 4. Reembolso en pasarela ──────────────────────────────────────────────
      const refundResult = await this.gateway.refund(
        tx.gateway_order_id, refundAmount, reason
      );

      // ── 5. Registrar en BD (operación atómica separada) ──────────────────────
      const conn2 = await this.repository.beginTransaction();
      try {
        const { refundId } = await (this.repository as any).createRefund({
          transactionId:   tx.transaction_id,
          orderId,
          amount:          refundAmount,
          reason,
          gatewayRefundId: refundResult.refundId,
          requestedBy:     requestedBy ?? userId,
        }, conn2);

        await this.repository.updateOrderStatus(orderId, ORDER_STATUS.REFUNDED, conn2);
        await this.repository.updateTransactionStatus(
          tx.transaction_id, TRANSACTION_STATUS.REFUNDED, refundResult.rawResponse, conn2
        );

        await this.repository.createAuditLog({
          entityType:     'ORDER',
          entityId:       orderId,
          action:         AUDIT_ACTIONS.REFUND_COMPLETED,
          previousStatus: ORDER_STATUS.PAID,
          newStatus:      ORDER_STATUS.REFUNDED,
          actorId:        requestedBy ?? userId,
          metadata:       {
            orderId, refundId,
            amount:          refundAmount,
            reason,
            gatewayRefundId: refundResult.refundId,
          },
        }, conn2);

        await this.repository.commit(conn2);

        logger.info('RefundPayment: refund completed', { orderId, refundId, refundAmount });
        return { refundId, orderId, amount: refundAmount, status: 'COMPLETED' };

      } catch (e) {
        await this.repository.rollback(conn2);
        throw e;
      }

    } catch (err) {
      try { await this.repository.rollback(conn); } catch (_) {}
      throw err;
    }
  }

  private _error(code: string, message: string, statusCode: number): Error {
    const err: any = new Error(message);
    err.code       = code;
    err.statusCode = statusCode;
    return err;
  }
}
