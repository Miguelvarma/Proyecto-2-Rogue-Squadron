/**
 * chatbotStore.ts — Estado Global del Chatbot
 * AISLADO del módulo de pagos. Comunicación con Shop: vía router.push() únicamente.
 *
 * Conecta con:
 *   - authStore → player.id como sessionId para persistir historial
 *   - playerStore → perfil del jugador para personalizar respuestas del bot
 *   - Python API (puerto 8000) → /api/v1/chatbot/sessions/:id/messages
 */
import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatbotState {
  isOpen: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  sessionId: string | null;
  unreadCount: number;
  error: string | null;

  open: () => void;
  close: () => void;
  toggle: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  setSession: (userId: string) => void;
  markRead: () => void;
}

const CHATBOT_API = (import.meta.env.VITE_CHATBOT_API_URL ?? 'http://localhost:8000') + '/api/v1/chatbot';

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  isOpen: false,
  isTyping: false,
  messages: [],
  sessionId: null,
  unreadCount: 0,
  error: null,

  open: () => set({ isOpen: true, unreadCount: 0 }),
  close: () => set({ isOpen: false }),
  toggle: () => {
    const { isOpen } = get();
    if (!isOpen) {
      set({ isOpen: true, unreadCount: 0 });
    } else {
      set({ isOpen: false });
    }
  },

  markRead: () => set({ unreadCount: 0 }),

  // Llamado desde App.tsx cuando el usuario hace login
  setSession: (userId: string) => {
    set({ sessionId: userId, messages: [] });
  },

  sendMessage: async (text: string) => {
    const { sessionId, messages } = get();
    if (!text.trim() || !sessionId) return;

    const userMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    set({
      messages: [...messages, userMsg],
      isTyping: true,
      error: null,
    });

    try {
      const res = await fetch(`${CHATBOT_API}/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
        },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const botContent: string = data?.data?.reply ?? data?.reply ?? 'El oráculo guarda silencio...';

      const botMsg: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: botContent,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, botMsg],
        isTyping: false,
        // Si el chat está cerrado, incrementar no-leídos
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      }));
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: 'El oráculo no puede responder en este momento. Intenta de nuevo.',
        timestamp: new Date(),
        isError: true,
      };
      set((state) => ({
        messages: [...state.messages, errMsg],
        isTyping: false,
        error: err.message,
      }));
    }
  },

  clearHistory: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      await fetch(`${CHATBOT_API}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
        },
      });
    } catch {
      // ignorar error de red al limpiar
    } finally {
      set({ messages: [] });
    }
  },
}));
