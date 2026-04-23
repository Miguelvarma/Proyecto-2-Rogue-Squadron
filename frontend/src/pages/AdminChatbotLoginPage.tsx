import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminChatbotStore } from '@/store/adminChatbotStore';
import { getAdminChatbotErrorMessage } from '@/api/adminChatbot';
import './AdminChatbotPanel.css';

export default function AdminChatbotLoginPage() {
  const navigate = useNavigate();
  const login = useAdminChatbotStore((s) => s.login);
  const isLoading = useAdminChatbotStore((s) => s.isLoading);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await login(username.trim(), password);
      navigate('/admin-chatbot', { replace: true });
    } catch (err) {
      setError(getAdminChatbotErrorMessage(err));
    }
  };

  return (
    <main className="admin-shell admin-login-shell">
      <section className="admin-login-card">
        <h1>Panel Admin Chatbot</h1>
        <p>Acceso restringido para gestionar la base de conocimiento y auditoría.</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>
            Usuario admin
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="AdminChatbot123"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
            />
          </label>

          {error && <div className="admin-alert admin-alert-error">{error}</div>}

          <button className="nbv-btn nbv-btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar al panel'}
          </button>
        </form>
      </section>
    </main>
  );
}
