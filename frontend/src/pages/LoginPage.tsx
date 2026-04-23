// src/pages/LoginPage.tsx - Versión con fetch directo
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log("Intentando login con:", { email });

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Status:", response.status);
      const data = await response.json();
      console.log("Respuesta:", data);

      if (response.ok) {
        // Guardar el token
        const token = data.data?.accessToken || data.data?.token;
        const refreshToken = data.data?.refreshToken;
        const user = data.data?.player || data.data?.user;
        
        if (token) {
          localStorage.setItem('accessToken', token);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          if (user) localStorage.setItem('user', JSON.stringify(user));
          
          setAuth(data.data);
          navigate('/dashboard');
        } else {
          setError("No se recibió token de autenticación");
        }
      } else {
        setError(data.message || data.error || "Credenciales incorrectas");
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError("Error de conexión con el servidor. ¿El backend está corriendo?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#120E0A'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        background: 'linear-gradient(145deg, #1C1510, #120E0A)',
        border: '1px solid #C8860A',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚜</div>
        <h1 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '1.3rem',
          color: '#C8860A',
          marginBottom: '0.3rem'
        }}>
          Entrar al Nexus
        </h1>
        <p style={{
          fontStyle: 'italic',
          color: '#B89A6A',
          fontSize: '0.9rem',
          marginBottom: '1.8rem'
        }}>
          Identifícate, aventurero
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo..."
            required
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              marginBottom: '0.6rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(200,134,10,0.25)',
              color: '#F0DEB0',
              fontSize: '1rem'
            }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña secreta..."
            required
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              marginBottom: '0.6rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(200,134,10,0.25)',
              color: '#F0DEB0',
              fontSize: '1rem'
            }}
          />

          {error && (
            <div style={{
              padding: '0.5rem',
              marginBottom: '0.6rem',
              background: 'rgba(168,16,32,0.1)',
              border: '1px solid #A81020',
              color: '#FF8A8A',
              fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.7rem 1.5rem',
              marginTop: '0.5rem',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #8B5E00, #C8860A)',
              color: '#0A0705',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Entrando...' : '⚔ ENTRAR AL CAMPO DE BATALLA'}
          </button>
        </form>

        <div style={{
          marginTop: '1rem',
          fontSize: '0.8rem',
          color: '#7A6A58',
          fontStyle: 'italic'
        }}>
          ¿Eres nuevo?{' '}
          <Link
            to="/register"
            style={{
              color: '#C8860A',
              textDecoration: 'none'
            }}
          >
            Forja tu leyenda aquí
          </Link>
        </div>

        {/* Botón para probar conexión */}
        <button
          type="button"
          onClick={async () => {
            try {
              const res = await fetch('http://localhost:3000/health');
              const data = await res.json();
              alert(`✅ Backend conectado: ${JSON.stringify(data)}`);
            } catch (err) {
              alert(`❌ Backend NO responde. Asegúrate que está corriendo en puerto 3000`);
            }
          }}
          style={{
            marginTop: '1rem',
            background: 'transparent',
            border: '1px solid #666',
            color: '#666',
            padding: '0.3rem 0.8rem',
            fontSize: '0.7rem',
            cursor: 'pointer'
          }}
        >
          Probar conexión
        </button>
      </div>
    </div>
  );
}