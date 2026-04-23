/**
 * payments.constants.ts
 * Constantes centrales del módulo de pagos de Nexus Battles.
 * Migrado y adaptado desde Imperial Guard → Nexus Battles (TypeScript).
 */

export const ORDER_STATUS = Object.freeze({
  PENDING:    'PENDING',
  PROCESSING: 'PROCESSING',
  PAID:       'PAID',
  FAILED:     'FAILED',
  REFUNDED:   'REFUNDED',
  CANCELLED:  'CANCELLED',
} as const);

export const TRANSACTION_STATUS = Object.freeze({
  INITIATED:  'INITIATED',
  PENDING:    'PENDING',
  APPROVED:   'APPROVED',
  REJECTED:   'REJECTED',
  REFUNDED:   'REFUNDED',
  ERROR:      'ERROR',
} as const);

export const GATEWAY_NAMES = Object.freeze({
  MERCADOPAGO: 'mercadopago',
  STRIPE:      'stripe',
  MOCK:        'mock',
} as const);

export const AUDIT_ACTIONS = Object.freeze({
  ORDER_CREATED:        'ORDER_CREATED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  TRANSACTION_CREATED:  'TRANSACTION_CREATED',
  TX_STATUS_CHANGED:    'TX_STATUS_CHANGED',
  WEBHOOK_RECEIVED:     'WEBHOOK_RECEIVED',
  REFUND_REQUESTED:     'REFUND_REQUESTED',
  REFUND_COMPLETED:     'REFUND_COMPLETED',
  INVENTORY_ASSIGNED:   'INVENTORY_ASSIGNED',
  FRAUD_FLAG:           'FRAUD_FLAG',
} as const);

export const PAYMENT_LIMITS = Object.freeze({
  MAX_AMOUNT_CENTS:     10_000_000, // $100,000.00
  MIN_AMOUNT_CENTS:     100,         // $1.00
  MAX_DAILY_ORDERS:     10,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQ:   20,
} as const);

// ─── Tipos derivados ──────────────────────────────────────────────────────────

export type OrderStatus       = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];
export type GatewayName       = typeof GATEWAY_NAMES[keyof typeof GATEWAY_NAMES];
export type AuditAction       = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
