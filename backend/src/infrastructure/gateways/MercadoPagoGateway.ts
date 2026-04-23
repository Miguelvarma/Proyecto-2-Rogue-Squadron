/**
 * MercadoPagoGateway.ts — Infrastructure / Gateway
 * Implementación de IPaymentGateway para MercadoPago.
 * Migrado desde Imperial Guard (JS) → TypeScript para Nexus Battles.
 *
 * Soporta:
 *  - Checkout Pro (redirect URL)
 *  - Verificación HMAC-SHA256 de webhooks
 *  - Consulta de estado de pagos
 *  - Reembolsos totales y parciales
 */

import https from 'https';
import crypto from 'crypto';
import type { IPaymentGateway, CreatePaymentInput } from '../../application/ports/IPaymentGateway';
import type {
  GatewayPaymentResult,
  GatewayRefundResult,
  GatewayStatusResult,
} from '../../payments/domain/entities/PaymentEntities';
import type { GatewayName } from '../../payments/constants/payments.constants';
import { TRANSACTION_STATUS } from '../../payments/constants/payments.constants';
import { env } from '../../config/env';

interface MercadoPagoConfig {
  accessToken:    string;
  webhookSecret:  string;
}

export class MercadoPagoGateway implements IPaymentGateway {
  private readonly accessToken:   string;
  private readonly webhookSecret: string;

  constructor(config: MercadoPagoConfig) {
    if (!config.accessToken) throw new Error('MercadoPagoGateway: accessToken is required');
    this.accessToken   = config.accessToken;
    this.webhookSecret = config.webhookSecret;
  }

  getGatewayName(): GatewayName { return 'mercadopago'; }

  // ─── Crear Preferencia (Checkout Pro) ────────────────────────────────────────

  async createPayment(input: CreatePaymentInput): Promise<GatewayPaymentResult> {
    const { orderId, currency, description, idempotencyKey, buyer, items } = input;

    const payload = {
      external_reference: orderId,
      reason:             description,
      currency_id:        currency,
      items: items.map((i: { title: string; quantity: number; unitPrice: number }) => ({
        title:       i.title,
        quantity:    i.quantity,
        unit_price:  i.unitPrice / 100,   // MP usa decimales
        currency_id: currency,
      })),
      payer: { email: buyer.email, name: buyer.name },
      back_urls: {
        success: `${env.CORS_ORIGIN}/payments/success`,
        failure: `${env.CORS_ORIGIN}/payments/failure`,
        pending: `${env.CORS_ORIGIN}/payments/pending`,
      },
      auto_return:          'approved',
      notification_url:     `${env.CORS_ORIGIN}/api/v1/payments/webhook?gateway=mercadopago`,
      statement_descriptor: 'NEXUSBATTLES',
    };

    const raw = await this._request<Record<string, unknown>>(
      'POST', '/checkout/preferences', payload, idempotencyKey
    );

    return {
      gatewayOrderId: raw['id'] as string,
      redirectUrl:    env.NODE_ENV === 'production'
        ? raw['init_point'] as string
        : raw['sandbox_init_point'] as string,
      rawResponse: raw,
    };
  }

  // ─── Verificación de Webhook ──────────────────────────────────────────────────

  async verifyWebhook(
    rawBody: Buffer | string,
    signature: string
  ): Promise<{ valid: boolean; event: Record<string, unknown> | null }> {
    try {
      // MercadoPago: x-signature → "ts=<timestamp>,v1=<hash>"
      const parts = (signature || '').split(',').reduce<Record<string, string>>((acc, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});

      const ts  = parts['ts'];
      const v1  = parts['v1'];
      if (!ts || !v1) return { valid: false, event: null };

      const body         = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
      const bodyParsed   = JSON.parse(body) as Record<string, unknown>;
      const requestId    = '';  // x-request-id header (se puede pasar si se necesita)
      const manifest     = `id:${bodyParsed['id'] ?? ''};request-id:${requestId};ts:${ts};`;

      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(manifest)
        .digest('hex');

      const valid = crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(v1, 'hex')
      );

      return { valid, event: bodyParsed };
    } catch {
      return { valid: false, event: null };
    }
  }

  // ─── Consultar Estado ─────────────────────────────────────────────────────────

  async getPaymentStatus(gatewayTransactionId: string): Promise<GatewayStatusResult> {
    const raw = await this._request<Record<string, unknown>>(
      'GET', `/v1/payments/${gatewayTransactionId}`
    );

    const statusMap: Record<string, string> = {
      approved:   TRANSACTION_STATUS.APPROVED,
      rejected:   TRANSACTION_STATUS.REJECTED,
      pending:    TRANSACTION_STATUS.PENDING,
      in_process: TRANSACTION_STATUS.PENDING,
      refunded:   TRANSACTION_STATUS.REFUNDED,
    };

    return {
      status:      (statusMap[raw['status'] as string] ?? TRANSACTION_STATUS.ERROR) as any,
      rawResponse: raw,
    };
  }

  // ─── Reembolso ────────────────────────────────────────────────────────────────

  async refund(
    gatewayTransactionId: string,
    amount?: number,
    _reason?: string
  ): Promise<GatewayRefundResult> {
    const payload = amount ? { amount: amount / 100 } : {};
    const raw     = await this._request<Record<string, unknown>>(
      'POST', `/v1/payments/${gatewayTransactionId}/refunds`, payload
    );

    return {
      refundId:    String(raw['id']),
      status:      raw['status'] as string,
      rawResponse: raw,
    };
  }

  // ─── HTTP Helper ──────────────────────────────────────────────────────────────

  private _request<T>(
    method: string,
    path: string,
    body: Record<string, unknown> | null = null,
    idempotencyKey: string | null = null
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const bodyStr = body ? JSON.stringify(body) : '';
      const headers: Record<string, string | number> = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'User-Agent':    'NexusBattles/1.0',
      };
      if (idempotencyKey)  headers['X-Idempotency-Key'] = idempotencyKey;
      if (bodyStr)         headers['Content-Length']    = Buffer.byteLength(bodyStr);

      const req = https.request(
        { hostname: 'api.mercadopago.com', path, method, headers },
        (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data) as T;
              if ((res.statusCode ?? 0) >= 400) {
                const err: NodeJS.ErrnoException = new Error(
                  `MercadoPago API error ${res.statusCode}`
                );
                (err as any).statusCode   = res.statusCode;
                (err as any).gatewayError = parsed;
                return reject(err);
              }
              resolve(parsed);
            } catch (e) { reject(e); }
          });
        }
      );

      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }
}
