/**
 * ChatbotBubble.tsx — Burbuja de Chatbot Global Persistente
 *
 * ARQUITECTURA:
 *   - Renderizado en MainLayout → aparece en TODAS las páginas (incluso Shop/Pagos)
 *   - Lee chatbotStore (mensajes, estado typing, unread)
 *   - Lee playerStore solo para contexto de bienvenida — NO interfiere con pagos
 *   - Comunicación con Shop: solo vía <Link to="/shop"> en mensajes del bot
 *   - position: fixed → z-index 9999 → nunca bloqueado por ningún módulo
 */
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useChatbotStore } from '@/store/chatbotStore';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';

const SUGGESTIONS = [
  '¿Qué héroes hay disponibles?',
  '¿Cómo funciona el sistema de subastas?',
  '¿Cuáles son los mejores ítems?',
  '¿Cómo completo misiones?',
  '¿Qué puedo comprar en la tienda?',
];

function formatTime(date: Date): string {
  return date.getHours().toString().padStart(2, '0') + ':' +
         date.getMinutes().toString().padStart(2, '0');
}

export function ChatbotBubble() {
  const { isOpen, isTyping, messages, unreadCount, toggle, sendMessage, clearHistory } = useChatbotStore();
  const profile = usePlayerStore((s) => s.profile);
  const { player } = useAuthStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const username = player?.username ?? profile?.username ?? 'Aventurero';

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendMessage(text);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  const showSuggestions = messages.length === 0 && !isTyping;

  return (
    <div className="chatbot-root">
      {/* ── Orb flotante ──────────────────────────────── */}
      <button
        className={`chatbot-orb${isOpen ? ' chatbot-orb--open' : ''}`}
        onClick={toggle}
        aria-label={isOpen ? 'Cerrar NexusBot' : 'Abrir NexusBot'}
        title="NexusBot — Oráculo del Nexus"
      >
        <div className="chatbot-orb__pulse" />
        <span className="chatbot-orb__icon">{isOpen ? '✕' : '⚔'}</span>
        {unreadCount > 0 && !isOpen && (
          <span className="chatbot-orb__badge">{unreadCount}</span>
        )}
      </button>

      {/* ── Ventana del chat ──────────────────────────── */}
      <div
        className={`chatbot-window${isOpen ? ' chatbot-window--open' : ''}`}
        role="dialog"
        aria-label="NexusBot — Oráculo del Nexus"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header__left">
            <div className="chatbot-header__avatar">N</div>
            <div>
              <div className="chatbot-header__title">NexusBot</div>
              <div className="chatbot-header__subtitle">
                {isTyping ? 'Consultando el oráculo…' : 'En línea'}
              </div>
            </div>
          </div>
          <div className="chatbot-header__actions">
            <button
              className="chatbot-header__btn"
              onClick={clearHistory}
              title="Limpiar historial"
            >
              🗑
            </button>
            <button
              className="chatbot-header__btn"
              onClick={toggle}
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="chatbot-messages">
          {/* Mensaje de bienvenida */}
          {messages.length === 0 && (
            <div className="chatbot-welcome">
              <div className="chatbot-welcome__icon">🔮</div>
              <div className="chatbot-welcome__title">Salve, {username}</div>
              <div className="chatbot-welcome__text">
                Soy el oráculo del Nexus. Pregúntame sobre héroes, ítems,
                misiones o cómo conquistar el campo de batalla.
              </div>
            </div>
          )}

          {/* Historial de mensajes */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chatbot-msg chatbot-msg--${msg.role}${msg.isError ? ' chatbot-msg--error' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="chatbot-msg__avatar">N</div>
              )}
              <div className="chatbot-msg__bubble">
                <div className="chatbot-msg__content">{msg.content}</div>
                <div className="chatbot-msg__time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chatbot-msg chatbot-msg--assistant">
              <div className="chatbot-msg__avatar">N</div>
              <div className="chatbot-msg__bubble">
                <div className="chatbot-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias rápidas */}
        {showSuggestions && (
          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="chatbot-suggestion"
                onClick={() => handleSuggestion(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-area">
          <input
            ref={inputRef}
            className="chatbot-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pregunta al oráculo del Nexus…"
            maxLength={500}
            disabled={isTyping}
            aria-label="Mensaje para NexusBot"
          />
          <button
            className="chatbot-send"
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            aria-label="Enviar mensaje"
            title="Enviar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
