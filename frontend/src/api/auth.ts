import { apiClient } from './client';
import { AuthTokens, ApiResponse } from '@/types';

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    apiClient.post<ApiResponse<{ id: string; username: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken }),
};
