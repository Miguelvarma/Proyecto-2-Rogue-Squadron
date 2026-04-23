// ══════════════════════════════════════════════════════════════
//  INFRASTRUCTURE — Payment Adapter
//  Intenta el backend real; cae al mock del .tsx si falla.
// ══════════════════════════════════════════════════════════════

import { paymentsApi } from '@/api/payments';
import type { CardData, PaymentTransaction, TokenPackage } from '../../domain/entities/TokenPackage';
import { CardDomainService } from '../../domain/entities/TokenPackage';

export interface IPaymentAdapter {
  processCard(params: { card: CardData; pkg: TokenPackage; playerId: string }): Promise<{ transaction: PaymentTransaction; tokensAdded: number }>;
}

export class PaymentAdapter implements IPaymentAdapter {
  async processCard({ card, pkg, playerId }: { card: CardData; pkg: TokenPackage; playerId: string }): Promise<{ transaction: PaymentTransaction; tokensAdded: number }> {
    const errors = CardDomainService.validate(card);
    if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);

    // Intentar el backend real
    try {
      const idempotencyKey = crypto.randomUUID();
      const orderRes = await paymentsApi.createOrder({
        productId:      pkg.id,
        currency:       'COP',
        countryCode:    'CO',
        idempotencyKey,
        buyerInfo:      { email: `${playerId}@nexus.game`, name: card.holder },
      });
      const order = orderRes.data.data;
      const payRes = await paymentsApi.processPayment(order.orderId, {
        gateway:   'mock',
        buyerInfo: { email: `${playerId}@nexus.game`, name: card.holder },
      });
      const result = payRes.data.data;
      return {
        transaction: {
          transactionId: result.transactionId,
          status:        'APPROVED',
          gateway:       result.gateway,
          approvedAt:    new Date().toISOString(),
          last4:         card.number.replace(/\s/g, '').slice(-4),
          amount:        pkg.priceUSD,
        },
        tokensAdded: pkg.tokens + pkg.bonusTokens,
      };
    } catch {
      // Mock fallback (del .tsx original)
      await new Promise(r => setTimeout(r, 2200));
      if (card.number.replace(/\s/g, '').endsWith('0000'))
        throw new Error('Tarjeta declinada por el emisor. Verifica tus fondos.');
      return {
        transaction: {
          transactionId: `TXN-${Date.now()}`,
          status:        'APPROVED',
          gateway:       'NEXUS_MOCK',
          approvedAt:    new Date().toISOString(),
          last4:         card.number.replace(/\s/g, '').slice(-4),
          amount:        pkg.priceUSD,
        },
        tokensAdded: pkg.tokens + pkg.bonusTokens,
      };
    }
  }
}
