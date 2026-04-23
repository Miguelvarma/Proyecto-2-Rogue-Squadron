/**
 * payments.ts — API layer for the payments module
 * All calls go through apiClient (handles JWT + refresh)
 */

import { apiClient } from './client';
import type { ApiResponse } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BuyerInfo {
  email: string;
  name:  string;
}

export interface CreateOrderPayload {
  productId:      string;
  currency:       string;
  countryCode:    string;
  idempotencyKey: string;
  promoCode?:     string;
  buyerInfo:      BuyerInfo;
}

export interface CreateOrderResult {
  orderId:    string;
  idempotent: boolean;
  amounts: {
    base:     number;
    tax:      number;
    discount: number;
    total:    number;
    currency: string;
  };
}

export interface ProcessPaymentPayload {
  gateway:   string;
  buyerInfo: BuyerInfo;
}

export interface ProcessPaymentResult {
  orderId:        string;
  transactionId:  string;
  gatewayOrderId: string;
  redirectUrl?:   string;
  clientSecret?:  string;
  gateway:        string;
}

export type OrderStatus =
  | 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface PaymentOrder {
  order_id:        string;
  user_id:         number;
  product_id:      string;
  total_amount:    number;
  base_amount:     number;
  tax_amount:      number;
  discount_amount: number;
  currency:        string;
  status:          OrderStatus;
  created_at:      string;
}

export interface ShopProduct {
  product_id:   string;
  name:         string;
  description:  string;
  price_cents:  number;
  currency:     string;
  rarity:       'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  type:         string;
  emoji:        string;
  available_stock: number;
  is_active:    boolean;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const paymentsApi = {
  createOrder: (payload: CreateOrderPayload) =>
    apiClient.post<ApiResponse<CreateOrderResult>>('/payments/orders', payload),

  processPayment: (orderId: string, payload: ProcessPaymentPayload) =>
    apiClient.post<ApiResponse<ProcessPaymentResult>>(
      `/payments/orders/${orderId}/pay`, payload
    ),

  getOrderStatus: (orderId: string) =>
    apiClient.get<ApiResponse<PaymentOrder>>(`/payments/orders/${orderId}`),

  // Products available in the shop (uses existing product endpoint)
  getShopProducts: () =>
    apiClient.get<ApiResponse<ShopProduct[]>>('/products?shop=true'),
};
