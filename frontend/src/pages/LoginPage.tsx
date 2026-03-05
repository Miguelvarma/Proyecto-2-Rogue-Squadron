/**
 * LoginPage.tsx — Pantalla de autenticación
 * Reemplaza el placeholder con la pantalla medieval de login.
 * Sin sidebar ni chatbot (GuestRoute → fuera del MainLayout).
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { useChatbotStore } from '@/store/chatbotStore';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const fetchProfile = usePlayerStore((s) => s.fetchProfile);
  const setSession   = useChatbotStore((s) => s.setSession);
  const navigate     = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await login(email.trim(), password);
      // Iniciar carga del perfil y sesión del chatbot
      const player = useAuthStore.getState().player;
      if (player?.id) {
        setSession(player.id);
        fetchProfile();
      }
      navigate('/dashboard');
    } catch {
      // El error ya está en el store
    }
  }

  return (
    <div className="auth-page">
      {/* Runas de fondo */}
      <div className="rune-bg" aria-hidden="true">
        <span>⚔</span><span>⚜</span><span>🔮</span>
        <span>⚡</span><span>✦</span><span>◈</span>
      </div>

      <div className="auth-card fade-in">
        {/* Crest */}
        <div className="auth-card__crest">⚜</div>
        <h1 className="auth-card__title">Entrar al Nexus</h1>
        <p className="auth-card__subtitle">Identifícate, aventurero</p>

        <div className="nbv-divider"><span className="nbv-divider-icon" style={{ fontSize: '0.7rem' }}>⚔</span></div>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Correo del Reino</label>
          <input
            className={`nbv-input${error ? ' error' : ''}`}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@nexus.com"
            required
            autoComplete="email"
          />

          <label className="auth-label">Contraseña Secreta</label>
          <input
            className={`nbv-input${error ? ' error' : ''}`}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="nbv-notif nbv-notif-error" style={{ marginBottom: '1rem' }}>
              <span className="nbv-notif-icon">💀</span>
              <div>
                <div className="nbv-notif-title">Acceso Denegado</div>
                <div className="nbv-notif-msg">{error}</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="nbv-btn nbv-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', clipPath: 'none' }}
            disabled={isLoading}
          >
            {isLoading ? '⚜ Verificando...' : '⚔ Entrar al Campo de Batalla'}
          </button>
        </form>

        <div className="auth-card__footer">
          ¿Eres nuevo?{' '}
          <Link to="/register">Forja tu leyenda aquí</Link>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200,134,10,0.06) 0%, transparent 70%), var(--abyss);
          padding: 1rem;
          position: relative;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(145deg, var(--stone), var(--stone-dark));
          border: 1px solid rgba(200,134,10,0.3);
          padding: 2.5rem 2rem;
          position: relative;
          z-index: 1;
          box-shadow: 0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(200,134,10,0.08);
        }
        .auth-card::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 30px; height: 30px;
          border-right: 1px solid var(--gold-dark);
          border-bottom: 1px solid var(--gold-dark);
        }
        .auth-card__crest {
          text-align: center;
          font-size: 2.5rem;
          color: var(--gold);
          filter: drop-shadow(0 0 16px rgba(200,134,10,0.6));
          margin-bottom: 0.5rem;
        }
        .auth-card__title {
          font-family: var(--font-title);
          font-size: 1.6rem;
          text-align: center;
          color: var(--gold);
          filter: drop-shadow(0 0 12px rgba(200,134,10,0.4));
          margin-bottom: 0.3rem;
        }
        .auth-card__subtitle {
          text-align: center;
          font-style: italic;
          font-size: 0.9rem;
          color: var(--parchment-dim);
          margin-bottom: 0;
        }
        .auth-label {
          display: block;
          font-family: var(--font-heading);
          font-size: 0.68rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.35rem;
        }
        .auth-card__footer {
          text-align: center;
          margin-top: 1.2rem;
          font-size: 0.85rem;
          color: var(--rune-gray);
          font-style: italic;
        }
        .auth-card__footer a { color: var(--gold); }
        .auth-card__footer a:hover { color: var(--gold-light); }
      `}</style>
    </div>
  );
}
