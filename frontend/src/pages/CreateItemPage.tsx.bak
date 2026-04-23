import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { inventoryApi, CreateItemDTO } from '@/api/inventory';
import { getErrorMessage } from '@/api/client';

const TIPOS = ['Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica'] as const;
const RAREZAS = ['Común', 'Rara', 'Épica', 'Legendaria'] as const;

export default function CreateItemPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔧 CRÍTICO: Verificar que el usuario sea ADMIN
  useEffect(() => {
    const userRol = (user as any)?.rol;
    if (userRol !== 'ADMIN') {
      setError('❌ Acceso denegado. Solo administradores pueden crear cartas.');
      setTimeout(() => navigate('/inventory'), 2000);
    }
  }, [user, navigate]);

  const [form, setForm] = useState<CreateItemDTO>({
    nombre: '',
    tipo: 'Arma',
    rareza: 'Común',
    descripcion: '',
    ataque: 0,
    defensa: 0,
    habilidades: [],
    efectos: [],
    imagen: '',
  });

  const [habilidadInput, setHabilidadInput] = useState('');
  const [efectoInput, setEfectoInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'ataque' || name === 'defensa' ? Number(value) : value,
    }));
  };

  const addTag = (field: 'habilidades' | 'efectos', value: string, setter: (v: string) => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm(prev => ({ ...prev, [field]: [...(prev[field] ?? []), trimmed] }));
    setter('');
  };

  const removeTag = (field: 'habilidades' | 'efectos', idx: number) => {
    setForm(prev => ({ ...prev, [field]: prev[field]?.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log('📤 [CreateItemPage] Iniciando creación con datos:', form);
      const payload: CreateItemDTO = { ...form };
      if (!payload.imagen) delete payload.imagen;
      console.log('📤 [CreateItemPage] Payload enviado:', payload);
      
      const response = await inventoryApi.createItem(payload);
      
      console.log('✅ [CreateItemPage] Respuesta recibida:', response);
      alert('✅ Ítem creado exitosamente');
      navigate('/inventory');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error('❌ [CreateItemPage] Error capturado:', err);
      console.error('❌ [CreateItemPage] Error message:', errorMsg);
      setError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 Si no es ADMIN, no renderizar el formulario
  const userRol = (user as any)?.rol;
  if (userRol !== 'ADMIN') {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <h1 style={{ color: '#ff4444' }}>❌ Acceso Denegado</h1>
        <p style={{ color: 'var(--color-rune-gray)', marginBottom: '1rem' }}>
          Solo los administradores pueden crear cartas.
        </p>
        <button 
          onClick={() => navigate('/inventory')} 
          style={{ background: 'var(--color-gold, #f0c040)', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          ← Volver al Inventario
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <button onClick={() => navigate('/inventory')} style={{ marginBottom: '1rem', background: 'none', border: '1px solid var(--color-rune-gray)', color: 'var(--color-rune-gray)', padding: '0.4rem 1rem', cursor: 'pointer', borderRadius: 4 }}>
        ← Volver
      </button>

      <h1 style={{ color: 'var(--color-gold, #f0c040)', marginBottom: '1.5rem' }}>✨ Crear Nueva Carta</h1>

      {error && <div style={{ color: '#ff4444', marginBottom: '1rem', padding: '0.75rem', border: '1px solid #ff4444', borderRadius: 4 }}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Nombre *
          <input name="nombre" value={form.nombre} onChange={handleChange} required minLength={2} maxLength={100}
            style={inputStyle} placeholder="Ej: Espada del Nexus" />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Tipo *
            <select name="tipo" value={form.tipo} onChange={handleChange} style={inputStyle}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Rareza
            <select name="rareza" value={form.rareza} onChange={handleChange} style={inputStyle}>
              {RAREZAS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Ataque
            <input name="ataque" type="number" min={0} value={form.ataque} onChange={handleChange} style={inputStyle} />
          </label>
          <label>
            Defensa
            <input name="defensa" type="number" min={0} value={form.defensa} onChange={handleChange} style={inputStyle} />
          </label>
        </div>

        <label>
          Descripción
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
            style={{ ...inputStyle, resize: 'vertical' }} placeholder="Descripción del ítem..." />
        </label>

        <label>
          URL de Imagen (opcional)
          <input name="imagen" value={form.imagen ?? ''} onChange={handleChange} style={inputStyle}
            placeholder="https://..." />
        </label>

        <label>
          Habilidades
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={habilidadInput} onChange={e => setHabilidadInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('habilidades', habilidadInput, setHabilidadInput))}
              style={{ ...inputStyle, flex: 1 }} placeholder="Escribe y presiona Enter" />
            <button type="button" onClick={() => addTag('habilidades', habilidadInput, setHabilidadInput)} style={tagBtnStyle}>+</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
            {form.habilidades?.map((h, i) => (
              <span key={i} style={tagStyle}>{h} <button type="button" onClick={() => removeTag('habilidades', i)} style={tagRemoveStyle}>×</button></span>
            ))}
          </div>
        </label>

        <label>
          Efectos
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={efectoInput} onChange={e => setEfectoInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('efectos', efectoInput, setEfectoInput))}
              style={{ ...inputStyle, flex: 1 }} placeholder="Escribe y presiona Enter" />
            <button type="button" onClick={() => addTag('efectos', efectoInput, setEfectoInput)} style={tagBtnStyle}>+</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
            {form.efectos?.map((ef, i) => (
              <span key={i} style={tagStyle}>{ef} <button type="button" onClick={() => removeTag('efectos', i)} style={tagRemoveStyle}>×</button></span>
            ))}
          </div>
        </label>

        <button type="submit" disabled={loading} style={{
          padding: '0.75rem', background: 'var(--color-gold, #f0c040)', color: '#000',
          border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Creando...' : '✨ Crear Carta'}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', marginTop: '0.3rem',
  padding: '0.5rem', background: '#1a1a2e', border: '1px solid #444',
  color: '#fff', borderRadius: 4, boxSizing: 'border-box',
};
const tagStyle: React.CSSProperties = {
  background: '#2a2a4e', border: '1px solid #555', borderRadius: 12,
  padding: '0.2rem 0.6rem', fontSize: '0.85rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: '0.3rem',
};
const tagBtnStyle: React.CSSProperties = {
  padding: '0.5rem 0.8rem', background: '#444', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer',
};
const tagRemoveStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#ff6666', cursor: 'pointer', padding: 0, fontSize: '1rem',
};
