/**
 * PaymentController.ts — Infrastructure / Controllers
 * Orquesta los use cases de pagos.
 * Recibe HTTP, delega en use cases y responde.
 * Migrado desde Imperial Guard (JS) → TypeScript para Nexus Battles.
 */

import { Request, Response, NextFunction } from 'express';
import { paymentRepository }       from '../../repositories/MySQLPaymentRepository';
import { createGateway }           from '../../factories/gateway.factory';
import { CreateOrderUseCase }      from '../../../application/usecases/payments/CreateOrderUseCase';
import { ProcessPaymentUseCase }   from '../../../application/usecases/payments/ProcessPaymentUseCase';
import { RefundPaymentUseCase }    from '../../../application/usecases/payments/RefundPaymentUseCase';
import { HandleWebhookUseCase }    from '../../../application/usecases/payments/HandleWebhookUseCase';
import { logger }                  from '../../logging/logger';

export class PaymentController {

  // ── POST /api/v1/payments/orders ─────────────────────────────────────────────
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new CreateOrderUseCase(paymentRepository);
      const result  = await useCase.execute({
        userId:         (req as any).user.id,
        productId:      req.body.productId,
        currency:       req.body.currency,
        countryCode:    req.body.countryCode,
        idempotencyKey: req.body.idempotencyKey,
        buyerInfo:      req.body.buyerInfo,
        promoCode:      req.body.promoCode,
      });
      res.status(result.idempotent ? 200 : 201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  // ── POST /api/v1/payments/orders/:orderId/pay ─────────────────────────────────
  async processPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gatewayName = req.body.gateway ?? process.env.DEFAULT_PAYMENT_GATEWAY;
      const gateway     = createGateway(gatewayName);
      const useCase     = new ProcessPaymentUseCase(paymentRepository, gateway);
      const result      = await useCase.execute({
        orderId:   req.params.orderId,
        userId:    (req as any).user.id,
        buyerInfo: req.body.buyerInfo,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  // ── GET /api/v1/payments/orders/:orderId ──────────────────────────────────────
  async getOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await paymentRepository.getOrderById(req.params.orderId);
      if (!order) {
        res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' });
        return;
      }
      if (order.user_id !== (req as any).user.id) {
        res.status(403).json({ success: false, error: 'FORBIDDEN' });
        return;
      }
      res.json({ success: true, data: order });
    } catch (err) { next(err); }
  }

  // ── POST /api/v1/payments/orders/:orderId/refund ──────────────────────────────
  async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gateway = createGateway(req.body.gateway ?? process.env.DEFAULT_PAYMENT_GATEWAY);
      const useCase = new RefundPaymentUseCase(paymentRepository, gateway);
      const result  = await useCase.execute({
        orderId:     req.params.orderId,
        userId:      (req as any).user.id,
        amount:      req.body.amount,
        reason:      req.body.reason,
        requestedBy: (req as any).user.id,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  // ── POST /api/v1/payments/webhook?gateway=<name> ──────────────────────────────
  async webhook(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const gatewayName = req.query['gateway'] as string | undefined;
      if (!gatewayName) {
        res.status(400).json({ error: 'gateway query param required' });
        return;
      }

      const gateway  = createGateway(gatewayName);
      const useCase  = new HandleWebhookUseCase(paymentRepository, gateway);

      const signature =
        (req.headers['x-signature']         as string) ||
        (req.headers['stripe-signature']     as string) ||
        (req.headers['x-hub-signature-256']  as string) ||
        '';

      const result = await useCase.execute({
        rawBody:   (req as any).rawBody ?? '',
        signature,
        ipAddress: (req as any).clientIp ?? req.ip ?? '',
      });

      // Siempre 200 rápido → evita reintentos infinitos de la pasarela
      res.status(200).json({ received: true, ...result });
    } catch (err: any) {
      if (err.code === 'INVALID_WEBHOOK_SIGNATURE') {
        res.status(401).json({ error: err.message });
        return;
      }
      logger.error('WebhookController: unhandled error', { error: err.message });
      res.status(200).json({ received: true, processed: false });
    }
  }
}

export const paymentController = new PaymentController();
