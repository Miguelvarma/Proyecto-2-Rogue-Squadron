import axios from 'axios';
import { getErrorMessage } from './client';

export interface AdminChatbotLoginResponse {
  username: string;
  token: string;
}

export interface KnowledgeBaseSummary {
  category: string;
  fileName: string;
  entriesCount: number;
}

export interface KnowledgeBaseDetail {
  category: string;
  fileName: string;
  entries: Array<Record<string, unknown>>;
  entriesCount: number;
}

export interface AdminChatbotAuditLog {
  id: number;
  fecha_hora: string;
  categoria: string;
  accion: 'agregar' | 'editar' | 'eliminar';
  detalle: string;
  admin_usuario: string;
}

const ADMIN_CHATBOT_API_BASE_URL =
  import.meta.env.VITE_ADMIN_CHATBOT_API_BASE_URL || 'http://localhost:3001/api/admin-chatbot';

const adminChatbotApiClient = axios.create({
  baseURL: ADMIN_CHATBOT_API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

adminChatbotApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminChatbotSessionToken');
  if (token) {
    config.headers['x-admin-session'] = token;
  }
  return config;
});

export const adminChatbotApi = {
  login: async (username: string, password: string): Promise<AdminChatbotLoginResponse> => {
    const { data } = await adminChatbotApiClient.post<{ data: AdminChatbotLoginResponse }>('/login', {
      username,
      password,
    });
    return data.data;
  },

  logout: async (): Promise<void> => {
    await adminChatbotApiClient.post('/logout');
  },

  getKnowledgeBaseSummary: async (): Promise<KnowledgeBaseSummary[]> => {
    const { data } = await adminChatbotApiClient.get<{ data: KnowledgeBaseSummary[] }>('/knowledge-base');
    return data.data;
  },

  getKnowledgeBaseByCategory: async (category: string): Promise<KnowledgeBaseDetail> => {
    const { data } = await adminChatbotApiClient.get<{ data: KnowledgeBaseDetail }>(`/knowledge-base/${category}`);
    return data.data;
  },

  createEntry: async (category: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const { data } = await adminChatbotApiClient.post<{ data: Record<string, unknown> }>(
      `/knowledge-base/${category}`,
      payload
    );
    return data.data;
  },

  updateEntry: async (
    category: string,
    id: string,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const { data } = await adminChatbotApiClient.put<{ data: Record<string, unknown> }>(
      `/knowledge-base/${category}/${id}`,
      payload
    );
    return data.data;
  },

  deleteEntry: async (category: string, id: string): Promise<void> => {
    await adminChatbotApiClient.delete(`/knowledge-base/${category}/${id}`);
  },

  getLogs: async (): Promise<AdminChatbotAuditLog[]> => {
    const { data } = await adminChatbotApiClient.get<{ data: AdminChatbotAuditLog[] }>('/logs');
    return data.data;
  },
};

export const getAdminChatbotErrorMessage = (error: unknown): string => getErrorMessage(error);
