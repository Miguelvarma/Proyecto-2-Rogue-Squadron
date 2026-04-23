/**
 * paymentRoutes.ts — Infrastructure / HTTP / Routes
 * FIX: import de paymentController corregido a '../controllers/PaymentController'
 */

import { Router }            from 'express';
import { z }                 from 'zod';
import { validate }          from '../middlewares/validateMiddleware';
import { authMiddleware }    from '../middlewares/authMiddleware';
import { hmacMiddleware }    from '../middlewares/hmacMiddleware';
import {
  idempotencyRequired,
  paymentRateLimiter,
  antiFraud,
}                            from '../middlewares/paymentMiddlewares';
import { paymentController } from '../controllers/PaymentController';

const router = Router();

const createOrderSchema = z.object({
  productId:      z.string().uuid(),
  currency:       z.string().length(3),
  countryCode:    z.string().length(2),
  idempotencyKey: z.string().min(16).max(128),
  promoCode:      z.string().max(32).optional(),
  buyerInfo: z.object({
    email: z.string().email(),
    name:  z.string().min(2).max(100),
  }),
});

const processPaymentSchema = z.object({
  gateway: z.enum(['mercadopago', 'stripe', 'mock']).optional(),
  buyerInfo: z.object({
    email: z.string().email(),
    name:  z.string().min(2).max(100),
  }),
});

const refundSchema = z.object({
  amount:  z.number().int().positive().optional(),
  reason:  z.string().max(255),
  gateway: z.enum(['mercadopago', 'stripe', 'mock']).optional(),
});

router.post('/webhook', hmacMiddleware, antiFraud, paymentController.webhook.bind(paymentController));

router.use(authMiddleware);
router.use(paymentRateLimiter());
router.use(antiFraud);

router.post('/orders',                 idempotencyRequired, validate(createOrderSchema),  paymentController.createOrder.bind(paymentController));
router.post('/orders/:orderId/pay',    validate(processPaymentSchema),                    paymentController.processPayment.bind(paymentController));
router.get('/orders/:orderId',                                                             paymentController.getOrderStatus.bind(paymentController));
router.post('/orders/:orderId/refund', validate(refundSchema),                            paymentController.refundPayment.bind(paymentController));

export default router;
