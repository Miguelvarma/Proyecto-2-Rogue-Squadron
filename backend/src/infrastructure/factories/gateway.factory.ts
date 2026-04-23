/**
 * gateway.factory.ts — Infrastructure / Factory
 * Crea la instancia correcta de pasarela de pago según el nombre.
 * Centraliza la configuración y elimina dependencia directa en controladores.
 */

import type { IPaymentGateway } from '../../application/ports/IPaymentGateway';
import type { GatewayName }    from '../../payments/constants/payments.constants';
import { GATEWAY_NAMES }       from '../../payments/constants/payments.constants';
import { MercadoPagoGateway }  from '../gateways/MercadoPagoGateway';
import { MockPaymentGateway }  from '../gateways/MockPaymentGateway';
import { env }                 from '../../config/env';

export function createGateway(name?: string): IPaymentGateway {
  const gatewayName = (name ?? env.DEFAULT_PAYMENT_GATEWAY ?? GATEWAY_NAMES.MOCK) as GatewayName;

  switch (gatewayName) {
    case GATEWAY_NAMES.MERCADOPAGO:
      return new MercadoPagoGateway({
        accessToken:   env.PAYMENT_API_KEY,
        webhookSecret: env.PAYMENT_WEBHOOK_SECRET,
      });

    case GATEWAY_NAMES.MOCK:
      return new MockPaymentGateway();

    default:
      throw new Error(`GatewayFactory: unsupported gateway "${gatewayName}"`);
  }
}
