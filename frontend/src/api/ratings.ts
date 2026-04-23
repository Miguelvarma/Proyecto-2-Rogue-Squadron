// src/api/ratings.ts
import { apiClient } from './client';

export interface RatingResponse {
  average: number;
  count: number;
  userRating: number | null;
}

export interface RateResponse {
  message: string;
  rating: {
    id: string;
    productId: number;  // ✅ number
    score: number;
    createdAt: string;
    updatedAt: string;
  };
}

export const ratingsApi = {
  // ✅ Ahora recibe number
  getProductRating: async (productId: number): Promise<RatingResponse> => {
    const response = await apiClient.get(`/products/${productId}/rating`);
    return response.data;
  },

  // ✅ Ahora recibe number
  rateProduct: async (productId: number, score: number): Promise<RateResponse> => {
    const response = await apiClient.post(`/products/${productId}/rate`, { score });
    return response.data;
  }
};