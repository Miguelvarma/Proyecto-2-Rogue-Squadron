import { useEffect, useState } from 'react';
import { adminChatbotApi, KnowledgeBaseSummary, getAdminChatbotErrorMessage } from '@/api/adminChatbot';
import { useAdminChatbotStore } from '@/store/adminChatbotStore';
import AdminChatbotCategoryManager from '@/components/adminChatbot/AdminChatbotCategoryManager';
import AdminChatbotHistoryLog from '@/components/adminChatbot/AdminChatbotHistoryLog';
import AdminChatbotLiveTest from '@/components/adminChatbot/AdminChatbotLiveTest';
import './AdminChatbotPanel.css';

type AdminTab = 'dashboard' | 'manager' | 'history' | 'live-test';

export default function AdminChatbotPanelPage() {
  const username = useAdminChatbotStore((s) => s.username);
  const logout = useAdminChatbotStore((s) => s.logout);

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [summary, setSummary] = useState<KnowledgeBaseSummary[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoadingSummary(true);
    setError(null);
    try {
      const data = await adminChatbotApi.getKnowledgeBaseSummary();
      setSummary(data);
    } catch (err) {
      setError(getAdminChatbotErrorMessage(err));
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const totalEntries = summary.reduce((acc, item) => acc + item.entriesCount, 0);

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <h1>Nexus Admin Panel</h1>
          <p>Gestión local del chatbot, categorías KB y auditoría.</p>
        </div>

        <div className="admin-topbar-actions">
          <span className="nbv-badge nbv-badge-gold">Admin: {username ?? 'N/A'}</span>
          <button className="nbv-btn nbv-btn-danger" type="button" onClick={logout}>
            Cerrar sesión admin
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
          Dashboard
        </button>
        <button className={tab === 'manager' ? 'active' : ''} onClick={() => setTab('manager')}>
          CRUD categorías
        </button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          Historial
        </button>
        <button className={tab === 'live-test' ? 'active' : ''} onClick={() => setTab('live-test')}>
          Live chatbot
        </button>
      </nav>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {tab === 'dashboard' && (
        <section className="admin-dashboard-grid">
          <article className="admin-metric-card">
            <h3>Categorías disponibles</h3>
            <p>{isLoadingSummary ? 'Cargando...' : summary.length}</p>
          </article>

          <article className="admin-metric-card">
            <h3>Total entradas KB</h3>
            <p>{isLoadingSummary ? 'Cargando...' : totalEntries}</p>
          </article>

          <article className="admin-metric-card">
            <h3>Archivos monitoreados</h3>
            <p>{isLoadingSummary ? 'Cargando...' : summary.map((item) => item.fileName).length}</p>
          </article>

          <article className="admin-metric-card admin-metric-card-wide">
            <div className="admin-panel-row">
              <h3>Detalle por categoría JSON</h3>
              <button className="nbv-btn nbv-btn-ghost" type="button" onClick={fetchSummary}>
                Actualizar
              </button>
            </div>

            <div className="admin-summary-grid">
              {summary.map((item) => (
                <div className="admin-summary-item" key={item.category}>
                  <div>
                    <strong>{item.category}</strong>
                    <span>{item.fileName}</span>
                  </div>
                  <b>{item.entriesCount}</b>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {tab === 'manager' && <AdminChatbotCategoryManager summary={summary} onRefreshSummary={fetchSummary} />}
      {tab === 'history' && <AdminChatbotHistoryLog />}
      {tab === 'live-test' && <AdminChatbotLiveTest />}
    </main>
  );
}
