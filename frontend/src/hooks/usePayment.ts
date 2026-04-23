import { useState, useCallback } from 'react';
import { paymentsApi } from '../api/payments';
import { usePlayerStore } from '@/store/playerStore';
import type {
  ShopProduct,
  CreateOrderResult,
  ProcessPaymentResult,
  BuyerInfo,
} from '../api/payments';

export type PaymentStep =
  | 'IDLE'
  | 'CREATING_ORDER'
  | 'PROCESSING_PAYMENT'
  | 'REDIRECTING'
  | 'SUCCESS'
  | 'ERROR';

export interface PaymentState {
  step:    PaymentStep;
  product: ShopProduct | null;
  order:   CreateOrderResult | null;
  result:  ProcessPaymentResult | null;
  error:   string | null;
}

const initial: PaymentState = {
  step:    'IDLE',
  product: null,
  order:   null,
  result:  null,
  error:   null,
};

export function usePayment() {
  const [state, setState] = useState<PaymentState>(initial);
  const refreshPlayer = usePlayerStore((s) => s.refresh);

  const selectProduct = useCallback((product: ShopProduct) => {
    setState({ ...initial, step: 'IDLE', product });
  }, []);

  const startCheckout = useCallback(async (
    product:     ShopProduct,
    buyerInfo:   BuyerInfo,
    countryCode: string,
    promoCode?:  string,
    gateway      = 'mock'
  ) => {
    setState(s => ({ ...s, step: 'CREATING_ORDER', error: null }));

    try {
      // ✅ Usamos la función nativa del navegador en lugar del archivo faltante
      const idempotencyKey = crypto.randomUUID();
      
      const { data: orderRes } = await paymentsApi.createOrder({
        productId:      product.product_id,
        currency:       product.currency,
        countryCode,
        idempotencyKey,
        buyerInfo,
        promoCode,
      });

      const order = orderRes.data;
      setState(s => ({ ...s, step: 'PROCESSING_PAYMENT', order }));

      const { data: payRes } = await paymentsApi.processPayment(order.orderId, {
        gateway,
        buyerInfo,
      });

      const result = payRes.data;

      if (result.redirectUrl) {
        setState(s => ({ ...s, step: 'REDIRECTING', result }));
        setTimeout(() => {
          window.location.href = result.redirectUrl!;
        }, 1500);
        return;
      }

      setState(s => ({ ...s, step: 'SUCCESS', result }));

      refreshPlayer().catch(() => {});

    } catch (err: any) {
      const msg =
        err?.response?.data?.error   ??
        err?.response?.data?.message ??
        'Error al procesar el pago. Inténtalo de nuevo.';
      setState(s => ({ ...s, step: 'ERROR', error: msg }));
    }
  }, [refreshPlayer]);

  const reset = useCallback(() => setState(initial), []);

  return { state, selectProduct, startCheckout, reset };
}