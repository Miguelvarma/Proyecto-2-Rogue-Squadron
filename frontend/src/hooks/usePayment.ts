
import { useState, useCallback } from 'react';
import { randomUUID } from '../utils/uuid';
import { paymentsApi } from '../api/payments';
import { usePlayerStore } from '../store/playerStore';
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
  // Conexión con playerStore — actualiza monedas/inventario post-pago
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
      // 1. Crear orden (idempotencyKey generado en cliente)
      const idempotencyKey = randomUUID();
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

      // 2. Procesar pago
      const { data: payRes } = await paymentsApi.processPayment(order.orderId, {
        gateway,
        buyerInfo,
      });

      const result = payRes.data;

      // 3a. Si hay redirect (MercadoPago) → redirigir en 1.5s
      if (result.redirectUrl) {
        setState(s => ({ ...s, step: 'REDIRECTING', result }));
        // El inventario se actualizará cuando el webhook llegue al backend
        // y el usuario regrese de MercadoPago
        setTimeout(() => {
          window.location.href = result.redirectUrl!;
        }, 1500);
        return;
      }

      // 3b. Pago completado en el mismo flujo (mock/stripe con clientSecret)
      setState(s => ({ ...s, step: 'SUCCESS', result }));

      // ✅ INTEGRACIÓN CLAVE: actualiza playerStore → Navbar ve nuevas monedas
      // Se ejecuta en background — no bloquea la UI
      refreshPlayer().catch(() => {
        // No fatal si falla el refresh — el usuario puede recargar
      });

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
