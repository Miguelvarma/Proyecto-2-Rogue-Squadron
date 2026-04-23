import { useEffect, useState } from 'react';
import { adminChatbotApi, AdminChatbotAuditLog, getAdminChatbotErrorMessage } from '@/api/adminChatbot';

export default function AdminChatbotHistoryLog() {
  const [logs, setLogs] = useState<AdminChatbotAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminChatbotApi.getLogs();
      setLogs(data);
    } catch (err) {
      setError(getAdminChatbotErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <section className="admin-panel-card">
      <div className="admin-panel-row">
        <h3 className="admin-panel-title">Historial de cambios</h3>
        <button className="nbv-btn nbv-btn-ghost" type="button" onClick={loadLogs}>
          Recargar logs
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Acción</th>
              <th>Detalle</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5}>Cargando historial...</td>
              </tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={5}>Aún no hay registros de auditoría.</td>
              </tr>
            )}
            {!isLoading &&
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.fecha_hora).toLocaleString()}</td>
                  <td>{log.categoria}</td>
                  <td>{log.accion}</td>
                  <td>{log.detalle}</td>
                  <td>{log.admin_usuario}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
