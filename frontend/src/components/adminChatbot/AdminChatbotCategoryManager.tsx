import { useEffect, useMemo, useState } from 'react';
import { adminChatbotApi, KnowledgeBaseSummary, getAdminChatbotErrorMessage } from '@/api/adminChatbot';

interface AdminChatbotCategoryManagerProps {
  summary: KnowledgeBaseSummary[];
  onRefreshSummary: () => Promise<void>;
}

function normalizeValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  try {
    return JSON.parse(trimmed);
  } catch {
    return raw;
  }
}

function extractEntryId(entry: Record<string, unknown>, index: number): string {
  const id = entry.id;
  if (id === undefined || id === null || String(id).trim() === '') {
    return String(index);
  }
  return String(id);
}

export default function AdminChatbotCategoryManager({ summary, onRefreshSummary }: AdminChatbotCategoryManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [entries, setEntries] = useState<Array<Record<string, unknown>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [newFieldKey, setNewFieldKey] = useState('');

  useEffect(() => {
    if (!selectedCategory && summary.length > 0) {
      setSelectedCategory(summary[0].category);
    }
  }, [summary, selectedCategory]);

  const availableKeys = useMemo(() => {
    const keys = new Set<string>(['id']);
    for (const entry of entries) {
      Object.keys(entry).forEach((key) => keys.add(key));
    }
    return Array.from(keys);
  }, [entries]);

  const loadCategory = async (category: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setEditingId(null);
    try {
      const detail = await adminChatbotApi.getKnowledgeBaseByCategory(category);
      setEntries(detail.entries ?? []);
      setFormFields({});
    } catch (err) {
      setError(getAdminChatbotErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCategory) return;
    loadCategory(selectedCategory);
  }, [selectedCategory]);

  const beginCreate = () => {
    setEditingId('new');
    setFormFields({});
    setError(null);
    setSuccess(null);
  };

  const beginEdit = (entry: Record<string, unknown>, index: number) => {
    const id = extractEntryId(entry, index);
    const normalized: Record<string, string> = {};
    Object.entries(entry).forEach(([key, value]) => {
      normalized[key] =
        typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
    });

    setEditingId(id);
    setFormFields(normalized);
    setError(null);
    setSuccess(null);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormFields((prev) => ({ ...prev, [key]: value }));
  };

  const addField = () => {
    const field = newFieldKey.trim();
    if (!field) return;
    if (Object.prototype.hasOwnProperty.call(formFields, field)) {
      setNewFieldKey('');
      return;
    }
    setFormFields((prev) => ({ ...prev, [field]: '' }));
    setNewFieldKey('');
  };

  const handleSave = async () => {
    if (!selectedCategory || !editingId) return;

    const payload: Record<string, unknown> = {};
    Object.entries(formFields).forEach(([key, value]) => {
      payload[key] = normalizeValue(value);
    });

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId === 'new') {
        await adminChatbotApi.createEntry(selectedCategory, payload);
        setSuccess('Entrada creada correctamente.');
      } else {
        await adminChatbotApi.updateEntry(selectedCategory, editingId, payload);
        setSuccess('Entrada actualizada correctamente.');
      }

      await loadCategory(selectedCategory);
      await onRefreshSummary();
      setEditingId(null);
      setFormFields({});
    } catch (err) {
      setError(getAdminChatbotErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entry: Record<string, unknown>, index: number) => {
    if (!selectedCategory) return;
    const id = extractEntryId(entry, index);
    const ok = window.confirm(`¿Seguro que deseas eliminar la entrada ${id}?`);
    if (!ok) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await adminChatbotApi.deleteEntry(selectedCategory, id);
      setSuccess(`Entrada ${id} eliminada correctamente.`);
      await loadCategory(selectedCategory);
      await onRefreshSummary();
    } catch (err) {
      setError(getAdminChatbotErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="admin-panel-card">
      <div className="admin-panel-row">
        <h3 className="admin-panel-title">Gestor de categorías KB</h3>
        <button className="nbv-btn nbv-btn-primary" onClick={beginCreate} type="button">
          + Nueva entrada
        </button>
      </div>

      <div className="admin-panel-row admin-panel-row-wrap">
        <label className="admin-label" htmlFor="category-select">
          Categoría
        </label>
        <select
          id="category-select"
          className="admin-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {summary.map((item) => (
            <option key={item.category} value={item.category}>
              {item.category} ({item.entriesCount})
            </option>
          ))}
        </select>

        <button
          className="nbv-btn nbv-btn-ghost"
          type="button"
          onClick={() => selectedCategory && loadCategory(selectedCategory)}
        >
          Recargar
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      {editingId && (
        <div className="admin-editor">
          <h4 className="admin-editor-title">
            {editingId === 'new' ? 'Crear nueva entrada' : `Editando entrada ${editingId}`}
          </h4>

          <div className="admin-fields-grid">
            {Object.entries(formFields).map(([key, value]) => (
              <label key={key} className="admin-field">
                <span>{key}</span>
                <textarea
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  rows={key === 'descripcion' || key === 'description' ? 4 : 2}
                />
              </label>
            ))}
          </div>

          <div className="admin-panel-row admin-panel-row-wrap">
            <input
              className="admin-input"
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              placeholder="Nuevo campo (ej: descripcion_larga)"
            />
            <button className="nbv-btn nbv-btn-ghost" type="button" onClick={addField}>
              Agregar campo
            </button>
          </div>

          <div className="admin-panel-row">
            <button className="nbv-btn nbv-btn-emerald" type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              className="nbv-btn nbv-btn-danger"
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormFields({});
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              {availableKeys
                .filter((key) => key !== 'id')
                .slice(0, 4)
                .map((key) => (
                  <th key={key}>{key}</th>
                ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6}>Cargando categoría...</td>
              </tr>
            )}
            {!isLoading && entries.length === 0 && (
              <tr>
                <td colSpan={6}>No hay entradas para esta categoría.</td>
              </tr>
            )}
            {!isLoading &&
              entries.map((entry, index) => {
                const id = extractEntryId(entry, index);
                return (
                  <tr key={`${id}-${index}`}>
                    <td>{id}</td>
                    {availableKeys
                      .filter((key) => key !== 'id')
                      .slice(0, 4)
                      .map((key) => (
                        <td key={key}>{String(entry[key] ?? '-')}</td>
                      ))}
                    <td>
                      <div className="admin-actions">
                        <button className="nbv-btn nbv-btn-ghost" type="button" onClick={() => beginEdit(entry, index)}>
                          Editar
                        </button>
                        <button
                          className="nbv-btn nbv-btn-danger"
                          type="button"
                          onClick={() => handleDelete(entry, index)}
                          disabled={isSaving}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
