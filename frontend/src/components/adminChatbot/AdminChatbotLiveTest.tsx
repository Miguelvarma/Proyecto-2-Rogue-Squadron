import { useState } from 'react';
import { chatbotFetch, getErrorMessage } from '@/api/client';

interface ChatbotResponse {
  response?: string;
  message?: string;
}

export default function AdminChatbotLiveTest() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer('');

    try {
      const userId = `admin-test-${Date.now()}`;
      const response = await chatbotFetch('/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          message: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener respuesta del chatbot.');
      }

      const data = (await response.json()) as ChatbotResponse;
      setAnswer(data.response || data.message || 'Sin respuesta del bot.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="admin-panel-card">
      <h3 className="admin-panel-title">Prueba en vivo del chatbot</h3>
      <p className="admin-panel-subtitle">
        Envía una consulta rápida para validar la respuesta del chatbot sin salir del panel admin.
      </p>

      <label className="admin-field">
        <span>Pregunta / Prompt</span>
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Dame recomendaciones para una estrategia con héroes de soporte"
        />
      </label>

      <div className="admin-panel-row">
        <button className="nbv-btn nbv-btn-arcane" type="button" onClick={handleTest} disabled={isLoading}>
          {isLoading ? 'Consultando...' : 'Probar chatbot'}
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {answer && (
        <div className="admin-answer">
          <h4>Respuesta</h4>
          <p>{answer}</p>
        </div>
      )}
    </section>
  );
}
