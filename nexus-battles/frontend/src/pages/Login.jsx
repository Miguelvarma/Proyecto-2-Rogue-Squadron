import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function Login() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/catalog';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(form);
      saveSession(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.emblem}>☠</div>
          <h1 style={styles.title}>NEXUS BATTLES V</h1>
          <p style={styles.subtitle}>Ingresa a tu cuenta de jugador</p>
        </div>

        <hr className="divider-gold" />

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-input"
              type="email"
              placeholder="jugador@nexus.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Ingresando…' : 'Ingresar al Nexus'}
          </button>
        </form>

        {/* Demo hint */}
        <div style={styles.demo}>
          <p style={{ color: '#4a5568', fontSize: '0.78rem', marginBottom: '0.4rem' }}>Cuentas demo:</p>
          <code style={{ color: '#8a93a8', fontSize: '0.78rem' }}>demo@nexus.com · Demo@12345</code>
        </div>

        <p style={{ textAlign: 'center', color: '#8a93a8', fontSize: '0.88rem', marginTop: '1.2rem' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: '#0a0505',
    border: '1px solid #2a0000',
    borderTop: '2px solid #cc0000',
    borderRadius: '0',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(204,0,0,0.1)',
    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
  },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  emblem: { fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' },
  title: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '0.85rem',
    color: '#cc0000',
    textShadow: '0 0 16px rgba(204,0,0,0.6)',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em',
    lineHeight: 1.5,
  },
  subtitle: { color: '#8a93a8', fontSize: '0.88rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  demo: {
    background: '#0a0e1a',
    border: '1px dashed #1e2d45',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginTop: '1rem',
    textAlign: 'center',
  },
};
