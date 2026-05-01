import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const AVATARS = ['warrior', 'mage', 'archer', 'rogue', 'paladin', 'druid'];

export default function Register() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombres: '', apellidos: '', email: '',
    password: '', confirmPassword: '',
    apodo: '', avatar: 'warrior',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const data = await authApi.register(payload);
      saveSession(data.token, data.user);
      navigate('/catalog');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.emblem}>🛡</div>
          <h1 style={styles.title}>Crear cuenta</h1>
          <p style={styles.subtitle}>Únete al Nexus Battles V</p>
        </div>

        <hr className="divider-gold" />

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div className="alert-error">{error}</div>}

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nombres</label>
              <input className="form-input" type="text" placeholder="Ej: Carlos" value={form.nombres} onChange={set('nombres')} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Apellidos</label>
              <input className="form-input" type="text" placeholder="Ej: García" value={form.apellidos} onChange={set('apellidos')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Apodo (visible en el juego)</label>
            <input className="form-input" type="text" placeholder="ShadowKnight99" value={form.apodo} onChange={set('apodo')} minLength={3} maxLength={20} required />
            <span style={{ fontSize: '0.74rem', color: '#4a5568' }}>3–20 caracteres. Sin palabras ofensivas o marcas registradas.</span>
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="Min. 8 caracteres" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Confirmar</label>
              <input className="form-input" type="password" placeholder="Repetir contraseña" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#4a5568', background: '#0a0e1a', borderRadius: '6px', padding: '0.6rem 0.8rem', lineHeight: 1.7 }}>
            La contraseña debe tener: 8+ caracteres · Mayúscula · Minúscula · Número · Símbolo (!@#$%^&*)
          </div>

          {/* Avatar */}
          <div className="form-group">
            <label className="form-label">Avatar</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {AVATARS.map(av => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, avatar: av }))}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    border: `1px solid ${form.avatar === av ? '#c9a84c' : '#1e2d45'}`,
                    background: form.avatar === av ? 'rgba(201,168,76,0.15)' : 'transparent',
                    color: form.avatar === av ? '#c9a84c' : '#8a93a8',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Creando cuenta…' : 'Unirme al Nexus'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#8a93a8', fontSize: '0.88rem', marginTop: '1.2rem' }}>
          ¿Ya tienes cuenta? <Link to="/login">Ingresar aquí</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card: {
    background: '#0d1220', border: '1px solid #1e2d45', borderRadius: '16px',
    padding: '2.5rem', width: '100%', maxWidth: '520px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
  },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  emblem: { fontSize: '2.2rem', display: 'block', marginBottom: '0.7rem' },
  title: { fontFamily: "'Cinzel', serif", fontSize: '1.4rem', color: '#c9a84c', marginBottom: '0.3rem' },
  subtitle: { color: '#8a93a8', fontSize: '0.88rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'flex', gap: '1rem' },
};
