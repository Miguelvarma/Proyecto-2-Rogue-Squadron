import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatbotState {
  isOpen: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  unreadCount: number;
  toggle: () => void;
  clearHistory: () => void;
  sendMessage: (text: string) => Promise<void>;
}

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function oracleReply(input: string): string {
  const t = input.toLowerCase();
  if (t.includes('héroe') || t.includes('heroes')) return 'En el Nexus hay héroes de daño, tanque y soporte. Dime tu estilo y te recomiendo uno.';
  if (t.includes('subasta')) return 'Las subastas son tiempo real: pujas, precio actual y cierre por tiempo. Vigila el reloj y administra tus monedas.';
  if (t.includes('ítem') || t.includes('item')) return 'Los ítems se clasifican por rareza. Prioriza sinergias con tu rol y stats: ataque/defensa/magia.';
  if (t.includes('misión') || t.includes('mision')) return 'Completa misiones para oro y XP. Empieza por dificultad EASY/MEDIUM y sube cuando tengas equipo.';
  if (t.includes('tienda') || t.includes('shop')) return 'En la tienda puedes comprar paquetes/ítems. Si me dices tu objetivo (oro, progreso, cosmético), te guío.';
  return 'Te escucho, aventurero. Pregúntame sobre héroes, subastas, ítems, misiones o la tienda.';
}

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isTyping: false,
      messages: [],
      unreadCount: 0,

      toggle: () =>
        set((s) => ({
          isOpen: !s.isOpen,
          unreadCount: s.isOpen ? s.unreadCount : 0,
        })),

      clearHistory: () => set({ messages: [], unreadCount: 0, isTyping: false }),

      sendMessage: async (text: string) => {
        const userMsg: ChatMessage = {
          id: nowId(),
          role: 'user',
          content: text,
          timestamp: new Date(),
        };

        set((s) => ({
          messages: [...s.messages, userMsg],
          isTyping: true,
        }));

        // Respuesta local para que la UI funcione aunque el backend del bot no esté.
        await new Promise((r) => setTimeout(r, 450));

        const assistantMsg: ChatMessage = {
          id: nowId(),
          role: 'assistant',
          content: oracleReply(text),
          timestamp: new Date(),
        };

        const isOpen = get().isOpen;
        set((s) => ({
          messages: [...s.messages, assistantMsg],
          isTyping: false,
          unreadCount: isOpen ? 0 : s.unreadCount + 1,
        }));
      },
    }),
    {
      name: 'chatbot-storage',
      partialize: (s) => ({
        isOpen: s.isOpen,
        messages: s.messages,
        unreadCount: s.unreadCount,
      }),
      // Date no se serializa bien; restauramos timestamps.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.messages = (state.messages ?? []).map((m: any) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
      },
    }
  )
);

