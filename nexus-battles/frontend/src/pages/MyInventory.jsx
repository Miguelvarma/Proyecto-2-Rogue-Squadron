import { useState, useEffect, useCallback } from 'react';
import { personalApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import CardArt from '../components/CardArt';
import Pagination from '../components/Pagination';

const TABS = ['items', 'decks'];
const TYPES    = ['all', 'Héroe', 'Hechizo', 'Ítem', 'Trampa'];
const RARITIES = ['all', 'Común', 'Rara', 'Épica', 'Legendaria'];

export default function MyInventory() {
  const [tab, setTab]               = useState('items');
  const [items, setItems]           = useState([]);
  const [decks, setDecks]           = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [summary, setSummary]       = useState({});
  const [search, setSearch]         = useState('');
  const [type, setType]             = useState('all');
  const [rarity, setRarity]         = useState('all');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [deckModal, setDeckModal]   = useState(false);
  const [editDeck, setEditDeck]     = useState(null);
  const [msg, setMsg]               = useState('');

  const fetchInventory = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const params = { page, limit: 16 };
      if (search.trim().length >= 4) params.search = search.trim();
      if (type   !== 'all') params.type   = type;
      if (rarity !== 'all') params.rarity = rarity;
      const data = await personalApi.getInventory(params);
      setItems(data.items);
      setPagination(data.pagination);
      setSummary(data.summary || {});
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [search, type, rarity]);

  const fetchDecks = async () => {
    try {
      const data = await personalApi.getDecks();
      setDecks(data.decks || []);
    } catch (err) { setError(err.message); }
  };

  useEffect(() => { fetchInventory(1); }, [type, rarity]);
  useEffect(() => { fetchDecks(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val === '' || val.length >= 4) fetchInventory(1);
  };

  const handleDeleteDeck = async (id) => {
    if (!window.confirm('¿Eliminar este mazo?')) return;
    try {
      await personalApi.deleteDeck(id);
      setMsg('Mazo eliminado');
      fetchDecks();
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>🎒 Mi Inventario</h1>
        <p>Tu colección personal de cartas y mazos</p>
      </div>

      {/* Resumen */}
      <div style={styles.summaryBar}>
        <SummaryPill icon="🃏" label="Cartas"  value={summary.totalItems || 0} />
        <SummaryPill icon="📚" label="Mazos"   value={summary.totalDecks || 0} />
        <SummaryPill icon="💰" label="Créditos" value="1,000" />
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t === 'items' ? '🃏 Mis Cartas' : '📚 Mis Mazos'}
          </button>
        ))}
      </div>

      {msg && (
        <div className="alert-success" style={{ marginBottom: '1rem' }}>
          {msg} <button style={styles.closeMsg} onClick={() => setMsg('')}>✕</button>
        </div>
      )}

      {/* ── TAB: CARTAS ─────────────────────────────────────────────────── */}
      {tab === 'items' && (
        <>
          {/* Barra de filtros */}
          <div style={styles.toolbar}>
            <input
              className="form-input"
              style={{ flex: 1, maxWidth: '320px' }}
              placeholder="Buscar en mi inventario… (mín. 4 letras)"
              value={search}
              onChange={handleSearch}
            />
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'Todos los tipos' : t}</option>)}
            </select>
            <select className="form-select" value={rarity} onChange={e => setRarity(e.target.value)}>
              {RARITIES.map(r => <option key={r} value={r}>{r === 'all' ? 'Todas las rarezas' : r}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Sin cartas</h3>
              <p>Visita el catálogo para encontrar cartas</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {items.map(item => (
                <ProductCard key={item.instanceId} product={item} showPrice={false} />
              ))}
            </div>
          )}

          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={p => fetchInventory(p)} />
        </>
      )}

      {/* ── TAB: MAZOS ──────────────────────────────────────────────────── */}
      {tab === 'decks' && (
        <>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => { setEditDeck(null); setDeckModal(true); }}>
              + Crear Mazo
            </button>
          </div>

          {decks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Sin mazos</h3>
              <p>Crea tu primer mazo con 30 cartas de tu inventario</p>
            </div>
          ) : (
            <div style={styles.decksGrid}>
              {decks.map(deck => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  onEdit={() => { setEditDeck(deck); setDeckModal(true); }}
                  onDelete={() => handleDeleteDeck(deck.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de mazo */}
      {deckModal && (
        <DeckModal
          deck={editDeck}
          ownedCards={items}
          onClose={() => setDeckModal(false)}
          onSave={async (name, cardIds) => {
            try {
              if (editDeck) {
                await personalApi.updateDeck(editDeck.id, { name, cardIds });
                setMsg('Mazo actualizado');
              } else {
                await personalApi.createDeck(name, cardIds);
                setMsg('Mazo creado exitosamente');
              }
              setDeckModal(false);
              fetchDecks();
            } catch (err) { return err.message; }
          }}
        />
      )}
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function SummaryPill({ icon, label, value }) {
  return (
    <div style={{ background: '#0d1220', border: '1px solid #1e2d45', borderRadius: '10px', padding: '0.8rem 1.4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{icon}</div>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', color: '#c9a84c', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#8a93a8' }}>{label}</div>
    </div>
  );
}

function DeckCard({ deck, onEdit, onDelete }) {
  return (
    <div style={{ background: '#0d1220', border: '1px solid #1e2d45', borderRadius: '12px', padding: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', color: '#c9a84c' }}>{deck.name}</h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={onEdit}>Editar</button>
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem', color: '#ef4444' }} onClick={onDelete}>Eliminar</button>
        </div>
      </div>
      <p style={{ color: '#8a93a8', fontSize: '0.82rem' }}>
        🃏 {deck.cardIds?.length || 0} / 30 cartas
      </p>
      <p style={{ color: '#4a5568', fontSize: '0.75rem', marginTop: '0.4rem' }}>
        Creado: {new Date(deck.createdAt).toLocaleDateString('es-CO')}
      </p>
    </div>
  );
}

function DeckModal({ deck, ownedCards, onClose, onSave }) {
  const DECK_SIZE = 30;
  const [name, setName]           = useState(deck?.name || '');
  const [selected, setSelected]   = useState(deck?.cardIds || []);
  const [saving, setSaving]       = useState(false);
  const [modalError, setModalError] = useState('');

  const toggle = (productId) => {
    setSelected(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return setModalError('El mazo necesita un nombre');
    if (selected.length !== DECK_SIZE) return setModalError(`Debes seleccionar exactamente ${DECK_SIZE} cartas (tienes ${selected.length})`);
    setSaving(true);
    const err = await onSave(name, selected);
    if (err) setModalError(err);
    setSaving(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9a84c', fontSize: '1.1rem' }}>
            {deck ? 'Editar Mazo' : 'Crear Mazo'}
          </h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {modalError && <div className="alert-error" style={{ marginBottom: '1rem' }}>{modalError}</div>}

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Nombre del mazo</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Mi mazo épico" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', alignItems: 'center' }}>
          <span style={{ color: '#8a93a8', fontSize: '0.85rem' }}>Selecciona 30 cartas de tu inventario</span>
          <span style={{
            fontWeight: 700, fontSize: '0.88rem',
            color: selected.length === DECK_SIZE ? '#10b981' : selected.length > DECK_SIZE ? '#ef4444' : '#c9a84c',
          }}>
            {selected.length} / {DECK_SIZE}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto', padding: '0.5rem 0' }}>
          {ownedCards.map(card => {
            const isSelected = selected.includes(card.productId);
            return (
              <div
                key={card.instanceId}
                onClick={() => toggle(card.productId)}
                style={{
                  position: 'relative',
                  background: isSelected ? 'rgba(201,168,76,0.15)' : '#111827',
                  border: `2px solid ${isSelected ? '#c9a84c' : '#1e2d45'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  overflow: 'hidden',
                  aspectRatio: '130 / 160',
                  boxShadow: isSelected ? '0 0 16px rgba(201,168,76,0.3)' : 'none',
                }}
              >
                {/* CardArt como fondo */}
                <div style={{ width: '100%', height: '100%', opacity: 0.9 }}>
                  <CardArt productId={card.productId} height={160} />
                </div>

                {/* Overlay con info y marca de selección */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isSelected ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.5)',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '0.6rem',
                  backdropFilter: 'blur(2px)',
                }}>
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '0.4rem', right: '0.4rem',
                      background: '#10b981', color: '#fff',
                      width: '24px', height: '24px',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 700,
                      boxShadow: '0 0 12px rgba(16,185,129,0.5)',
                    }}>
                      ✓
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#e8e6df', lineHeight: 1.2, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {card.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : deck ? 'Actualizar mazo' : 'Crear mazo'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  summaryBar: { display: 'flex', gap: '1rem', marginBottom: '1.8rem', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: '0.3rem', marginBottom: '1.5rem', borderBottom: '1px solid #1e2d45', paddingBottom: '0' },
  tab: {
    background: 'transparent', border: 'none', borderBottom: '2px solid transparent',
    color: '#8a93a8', padding: '0.7rem 1.2rem', cursor: 'pointer',
    fontSize: '0.9rem', fontFamily: "'Exo 2', sans-serif", fontWeight: 500,
    transition: 'all 0.2s', marginBottom: '-1px',
  },
  tabActive: { color: '#c9a84c', borderBottomColor: '#c9a84c' },
  toolbar: { display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1.2rem' },
  decksGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  closeMsg: { background: 'none', border: 'none', cursor: 'pointer', color: '#6ee7b7', marginLeft: '0.5rem' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: '1rem',
  },
  modal: {
    background: '#0d1220', border: '1px solid #1e2d45',
    borderRadius: '16px', padding: '2rem',
    width: '100%', maxWidth: '640px',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
  },
};
