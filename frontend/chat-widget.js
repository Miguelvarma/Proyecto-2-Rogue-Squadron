/**
 * NEXUS BATTLES V — Chat Widget v2.1
 * Estilo 100% alineado al mockup oficial del equipo.
 * Incluir junto con chat-widget.css antes de </body>.
 * No depende de ningún framework.
 */
(function () {
  'use strict';

  const API_URL = (window.NEXUS_API_URL || 'http://localhost:8000') + '/api/v1/chatbot';
  const USER_ID = 'user_' + Math.random().toString(36).substring(2, 11);

  let isOpen   = false;
  let isTyping = false;
  let unread   = 0;

  /* ── HTML ─────────────────────────────────────────────────── */
  function buildWidget() {
    const wrap = document.createElement('div');
    wrap.id = 'nx-widget-root';
    wrap.innerHTML = `
      <!-- Orb flotante -->
      <div id="nx-orb" role="button" aria-label="Abrir NexusBot" tabindex="0">
        <div id="nx-orb-pulse"></div>
        <div id="nx-orb-inner">⚔</div>
        <div id="nx-badge"></div>
      </div>

      <!-- Ventana del chat -->
      <div id="nx-window" role="dialog" aria-label="NexusBot" aria-hidden="true">

        <div id="nx-header">
          <div id="nx-header-left">
            <div id="nx-avatar">N</div>
            <div>
              <div id="nx-title">NexusBot</div>
              <div id="nx-subtitle">En línea</div>
            </div>
          </div>
          <div id="nx-header-actions">
            <button class="nx-hbtn" id="nx-clear-btn" title="Limpiar historial">🗑</button>
            <button class="nx-hbtn" id="nx-close-btn" title="Cerrar">✕</button>
          </div>
        </div>

        <div id="nx-messages"></div>
        <div id="nx-suggestions"></div>

        <div id="nx-input-area">
          <input
            id="nx-input"
            type="text"
            placeholder="Pregunta al oráculo del Nexus..."
            maxlength="500"
            autocomplete="off"
          />
          <button id="nx-send" title="Enviar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

      </div>
    `;
    document.body.appendChild(wrap);
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function timestamp() {
    const d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  function scrollBottom() {
    const el = document.getElementById('nx-messages');
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  function appendMessage(content, role) {
    const msgs = document.getElementById('nx-messages');
    const div  = document.createElement('div');
    div.className = 'nx-msg ' + (role === 'user' ? 'nx-msg-user' : 'nx-msg-bot');
    div.innerHTML = `<div>${content}</div><div class="nx-msg-time">${timestamp()}</div>`;
    msgs.appendChild(div);
    scrollBottom();
    if (!isOpen && role === 'bot') { unread++; showBadge(unread); }
  }

  function showTypingIndicator() {
    removeTypingIndicator();
    const msgs = document.getElementById('nx-messages');
    const div  = document.createElement('div');
    div.id = 'nx-typing';
    div.innerHTML = '<div class="nx-dot"></div><div class="nx-dot"></div><div class="nx-dot"></div>';
    msgs.appendChild(div);
    scrollBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('nx-typing');
    if (el) el.remove();
  }

  function setSuggestions(list) {
    const c = document.getElementById('nx-suggestions');
    c.innerHTML = '';
    (list || []).forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'nx-sug';
      btn.textContent = text;
      btn.addEventListener('click', () => sendMessage(text));
      c.appendChild(btn);
    });
  }

  function showBadge(count) {
    const b = document.getElementById('nx-badge');
    if (!b) return;
    b.style.display = 'flex';
    b.textContent = count > 9 ? '9+' : count;
  }

  function clearBadge() {
    unread = 0;
    const b = document.getElementById('nx-badge');
    if (b) b.style.display = 'none';
  }

  /* ── Abrir / cerrar ──────────────────────────────────────── */
  function openChat() {
    isOpen = true;
    const win = document.getElementById('nx-window');
    const orb = document.getElementById('nx-orb');
    win.classList.add('nx-open');
    win.setAttribute('aria-hidden', 'false');
    orb.style.opacity = '0';
    orb.style.pointerEvents = 'none';
    clearBadge();
    setTimeout(() => { const i = document.getElementById('nx-input'); if (i) i.focus(); }, 320);
  }

  function closeChat() {
    isOpen = false;
    const win = document.getElementById('nx-window');
    const orb = document.getElementById('nx-orb');
    win.classList.remove('nx-open');
    win.setAttribute('aria-hidden', 'true');
    orb.style.opacity = '';
    orb.style.pointerEvents = '';
  }

  function toggleChat() { isOpen ? closeChat() : openChat(); }

  /* ── Enviar mensaje ──────────────────────────────────────── */
  async function sendMessage(text) {
    const input   = document.getElementById('nx-input');
    const message = (text || input.value).trim();
    if (!message || isTyping) return;

    input.value = '';
    isTyping = true;

    appendMessage(escapeHTML(message), 'user');
    showTypingIndicator();

    try {
      const res = await fetch(API_URL + '/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id: USER_ID, message }),
      });

      removeTypingIndicator();

      if (res.status === 429) {
        appendMessage('⏳ Demasiados mensajes. Espera un momento, aventurero.', 'bot');
        isTyping = false;
        return;
      }

      if (!res.ok) {
        appendMessage('⚠️ El oráculo no responde en este momento. Intenta de nuevo.', 'bot');
        isTyping = false;
        return;
      }

      const data = await res.json();
      appendMessage(formatBotResponse(data.response), 'bot');
      if (data.suggestions && data.suggestions.length) setSuggestions(data.suggestions);

    } catch (_) {
      removeTypingIndicator();
      appendMessage('❌ Sin conexión con el servidor. Verifica que el backend esté corriendo.', 'bot');
    }

    isTyping = false;
  }

  /* ── Limpiar historial ───────────────────────────────────── */
  async function clearHistory() {
    try { await fetch(API_URL + '/' + USER_ID, { method: 'DELETE' }); } catch (_) {}
    document.getElementById('nx-messages').innerHTML = '';
    showWelcome();
  }

  /* ── Bienvenida — tono del mockup ───────────────────────── */
  function showWelcome() {
    appendMessage(
      '⚜ <strong>Saludos, aventurero.</strong> Soy <strong>NexusBot</strong>, el oráculo del Nexus.<br>' +
      'Puedo guiarte sobre héroes, ítems, armas, armaduras y mecánicas de batalla.',
      'bot'
    );
    setSuggestions([
      '⚔ Héroes disponibles',
      '🗡 Armas y armaduras',
      '🎒 Ítems de equipamiento',
      '🎴 ¿Cómo se juega?',
    ]);
  }

  /* ── Utilidades ──────────────────────────────────────────── */
  function escapeHTML(str) {
    return str
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function formatBotResponse(text) {
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    buildWidget();

    document.getElementById('nx-orb').addEventListener('click', toggleChat);
    document.getElementById('nx-orb').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') toggleChat();
    });
    document.getElementById('nx-close-btn').addEventListener('click', closeChat);
    document.getElementById('nx-clear-btn').addEventListener('click', clearHistory);
    document.getElementById('nx-send').addEventListener('click', () => sendMessage());
    document.getElementById('nx-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeChat();
    });

    showWelcome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
