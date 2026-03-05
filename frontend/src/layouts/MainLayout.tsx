/**
 * MainLayout.tsx — Layout principal de la aplicación
 *
 * ESTRUCTURA:
 *   ┌──────────────────────────── Navbar (fixed) ─────────────────────────────┐
 *   │ Logo │ Nav Links │ Coins │ ChatbotBtn │ Avatar                          │
 *   └─────────────────────────────────────────────────────────────────────────┘
 *   ┌─────────────────┬───────────────────────────────────────────────────────┐
 *   │ Sidebar (sticky)│  <Outlet /> — Contenido de la página actual           │
 *   │ Player card     │                                                        │
 *   │ Stats           │                                                        │
 *   │ Nav             │                                                        │
 *   └─────────────────┴───────────────────────────────────────────────────────┘
 *                                              ChatbotBubble (fixed bottom-right)
 *
 * CICLO DE VIDA:
 *   - Al montar: carga el perfil del jugador (playerStore.fetchProfile)
 *   - Al autenticar: sincroniza sessionId del bot con userId
 *   - Al hacer logout: limpia ambos stores
 */
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatbotBubble } from '@/components/chatbot/ChatbotBubble';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { useChatbotStore } from '@/store/chatbotStore';

import '@/components/layout/layout.css';
import '@/components/chatbot/ChatbotBubble.css';

export function MainLayout() {
  const { player, isAuthenticated } = useAuthStore();
  const { fetchProfile } = usePlayerStore();
  const { setSession } = useChatbotStore();

  // Hidrata datos del jugador y conecta sesión del chatbot al montar
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  // Sincroniza sessionId del chatbot con el userId real del jugador
  useEffect(() => {
    if (player?.id) {
      setSession(player.id);
    }
  }, [player?.id, setSession]);

  return (
    <div className="nbv-layout">
      {/* Runas flotantes de fondo */}
      <div className="rune-bg" aria-hidden="true">
        <span>⚔</span>
        <span>⚜</span>
        <span>🔮</span>
        <span>⚡</span>
        <span>✦</span>
        <span>◈</span>
      </div>

      {/* Navbar fijo */}
      <Navbar />

      {/* Cuerpo: Sidebar + Contenido */}
      <div className="nbv-layout__body">
        <Sidebar />
        <main className="nbv-layout__main">
          <Outlet />
        </main>
      </div>

      {/* Chatbot — SIEMPRE presente, independiente de la ruta activa */}
      <ChatbotBubble />
    </div>
  );
}
