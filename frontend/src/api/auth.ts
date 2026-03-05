import { apiClient } from './client';

export interface RegisterData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  apodo: string;
  avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    apodo: string;
    avatar: string | null;
    rol: 'PLAYER' | 'ADMIN' | 'MODERATOR';
    emailVerified: boolean;
    createdAt: string;
  };
  token: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    apodo: string;
    rol: 'PLAYER' | 'ADMIN' | 'MODERATOR';
  };
  accessToken: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('accessToken');
  },
};