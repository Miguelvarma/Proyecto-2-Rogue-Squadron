/**
 * PricingRules.ts — Domain Service
 * Lógica de cálculo de precios: impuestos, descuentos y totales.
 * Migrado desde Imperial Guard → TypeScript para Nexus Battles.
 * Toda la lógica opera sobre el Value Object Money (centavos).
 */

import { Money } from '../value-objects/Money';

export interface TaxRule {
  rate: number;          // e.g. 0.19 para 19%
  countryCode: string;
}

export interface DiscountRule {
  type:  'PERCENTAGE' | 'FIXED';
  value: number;         // Porcentaje (0-100) o monto en centavos
}

export class PricingRules {
  /**
   * Calcula el impuesto sobre el precio base.
   * @param base    Precio base en Money
   * @param taxRule Regla fiscal del país
   */
  static calculateTax(base: Money, taxRule: TaxRule | null): Money {
    if (!taxRule || taxRule.rate <= 0) return Money.zero(base.currency);
    return base.multiply(taxRule.rate);
  }

  /**
   * Calcula el descuento aplicable.
   * @param base          Precio base
   * @param discountRule  Tipo y valor del descuento
   */
  static calculateDiscount(base: Money, discountRule: DiscountRule | null): Money {
    if (!discountRule) return Money.zero(base.currency);

    if (discountRule.type === 'PERCENTAGE') {
      if (discountRule.value < 0 || discountRule.value > 100) {
        throw new Error('PricingRules: percentage must be between 0 and 100');
      }
      return base.multiply(discountRule.value / 100);
    }

    if (discountRule.type === 'FIXED') {
      const fixed = new Money(discountRule.value, base.currency);
      // El descuento no puede superar el precio base
      return fixed.amountInCents > base.amountInCents ? base : fixed;
    }

    throw new Error(`PricingRules: unknown discount type: ${discountRule.type}`);
  }

  /**
   * Calcula el total final: base + tax − discount
   */
  static calculateTotal(base: Money, tax: Money, discount: Money): Money {
    return base.add(tax).subtract(discount);
  }
}
