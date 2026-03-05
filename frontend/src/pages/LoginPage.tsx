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
import { authApi } from '@/api/auth';
import { getErrorMessage } from '@/api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const fetchProfile = usePlayerStore((s) => s.fetchProfile);
  const setSession = useChatbotStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email: email.trim(), password });
      setAuth(response.user);
      
      // Iniciar carga del perfil y sesión del chatbot
      const player = useAuthStore.getState().player;
      if (player?.id) {
        setSession(player.id);
        fetchProfile();
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Runas de fondo */}
      <div className="rune-bg" aria-hidden="true">
        <span>⚔</span>
        <span>⚜</span>
        <span>🔮</span>
        <span>⚡</span>
        <span>✦</span>
        <span>◈</span>
      </div>

      <div className="auth-card fade-in">
        {/* Crest */}
        <div className="auth-card__crest">⚜</div>
        <h1 className="auth-card__title">Entrar al Nexus</h1>
        <p className="auth-card__subtitle">Identifícate, aventurero</p>

        <div className="nbv-divider">
          <span className="nbv-divider-icon" style={{ fontSize: '0.7rem' }}>⚔</span>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Correo del Reino</label>
          <input
            className={`nbv-input${error ? ' error' : ''}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@nexus.com"
            required
            autoComplete="email"
            disabled={isLoading}
          />

          <label className="auth-label">Contraseña Secreta</label>
          <input
            className={`nbv-input${error ? ' error' : ''}`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            disabled={isLoading}
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
            style={{ 
              width: '100%', 
              marginTop: '0.5rem', 
              padding: '0.75rem', 
              clipPath: 'none',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
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
        
        .rune-bg {
          position: absolute;
          inset: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          align-items: center;
          opacity: 0.03;
          pointer-events: none;
          font-size: 8rem;
          color: var(--gold);
          overflow: hidden;
        }
        
        .rune-bg span {
          transform: rotate(var(--rotation, 0deg));
          animation: floatRune 20s infinite alternate;
        }
        
        @keyframes floatRune {
          0% { transform: rotate(-5deg) translateY(0); }
          100% { transform: rotate(5deg) translateY(-20px); }
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
          bottom: 0;
          right: 0;
          width: 30px;
          height: 30px;
          border-right: 1px solid var(--gold-dark);
          border-bottom: 1px solid var(--gold-dark);
          opacity: 0.5;
        }
        
        .auth-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 30px;
          height: 30px;
          border-left: 1px solid var(--gold-dark);
          border-top: 1px solid var(--gold-dark);
          opacity: 0.5;
        }
        
        .auth-card__crest {
          text-align: center;
          font-size: 2.5rem;
          color: var(--gold);
          filter: drop-shadow(0 0 16px rgba(200,134,10,0.6));
          margin-bottom: 0.5rem;
          animation: crestPulse 3s infinite alternate;
        }
        
        @keyframes crestPulse {
          0% { filter: drop-shadow(0 0 8px rgba(200,134,10,0.4)); }
          100% { filter: drop-shadow(0 0 20px rgba(200,134,10,0.8)); }
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
        
        .nbv-input {
          width: 100%;
          padding: 0.7rem 1rem;
          margin-bottom: 1rem;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(200,134,10,0.25);
          color: var(--parchment);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        
        .nbv-input:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 2px rgba(200,134,10,0.2);
        }
        
        .nbv-input.error {
          border-color: var(--crimson);
        }
        
        .nbv-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .nbv-btn {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: linear-gradient(135deg, var(--gold-dark), var(--gold-bright));
          color: var(--abyss);
          border: none;
          transition: all 0.2s ease;
        }
        
        .nbv-btn:hover:not(:disabled) {
          filter: brightness(1.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(200,134,10,0.3);
        }
        
        .nbv-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .nbv-notif {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 0.75rem;
          border: 1px solid;
          background: rgba(0,0,0,0.2);
        }
        
        .nbv-notif-error {
          border-color: var(--crimson);
          color: var(--crimson-bright);
        }
        
        .nbv-notif-icon {
          font-size: 1.2rem;
        }
        
        .nbv-notif-title {
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        .nbv-notif-msg {
          font-size: 0.85rem;
          opacity: 0.9;
        }
        
        .nbv-divider {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
        }
        
        .auth-card__footer {
          text-align: center;
          margin-top: 1.2rem;
          font-size: 0.85rem;
          color: var(--rune-gray);
          font-style: italic;
        }
        
        .auth-card__footer a {
          color: var(--gold);
          text-decoration: none;
          border-bottom: 1px dashed transparent;
          transition: border-color 0.2s ease;
        }
        
        .auth-card__footer a:hover {
          border-bottom-color: var(--gold);
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 480px) {
          .auth-card {
            padding: 2rem 1.5rem;
          }
          
          .auth-card__title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}