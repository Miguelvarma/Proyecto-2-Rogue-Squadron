import { useState, useEffect, useCallback, useRef } from 'react';
import { globalApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const TYPES    = ['all', 'Héroe', 'Hechizo', 'Ítem', 'Trampa'];
const RARITIES = ['all', 'Común', 'Rara', 'Épica', 'Legendaria'];

const HERO_CHARS = [
  {
    id: 1,
    name: 'KURRAN',
    title: 'El Carnicero de Sangre',
    type: 'LEGENDARIO',
    color: '#cc0000',
    shadowColor: 'rgba(204,0,0,0.6)',
    bg: 'linear-gradient(180deg, #0d0000 0%, #1a0000 40%, #0a0000 100%)',
    aura: 'radial-gradient(ellipse 55% 45% at 50% 28%, rgba(200,0,0,0.7) 0%, rgba(100,0,0,0.4) 45%, transparent 75%)',
    silhouette: 'radial-gradient(ellipse 28% 22% at 50% 22%, rgba(30,0,0,0.95) 0%, transparent 100%)',
    emoji: '🔪',
    stats: { ATK: 95, DEF: 40, HP: 120 },
  },
  {
    id: 2,
    name: 'VEXARA',
    title: 'La Cosechadora de Almas',
    type: 'ÉPICA',
    color: '#a855f7',
    shadowColor: 'rgba(168,85,247,0.5)',
    bg: 'linear-gradient(180deg, #060010 0%, #0d0020 40%, #04000a 100%)',
    aura: 'radial-gradient(ellipse 55% 45% at 50% 28%, rgba(140,0,220,0.65) 0%, rgba(70,0,120,0.4) 45%, transparent 75%)',
    silhouette: 'radial-gradient(ellipse 28% 22% at 50% 22%, rgba(10,0,20,0.95) 0%, transparent 100%)',
    emoji: '💀',
    stats: { ATK: 75, DEF: 55, HP: 100 },
  },
  {
    id: 3,
    name: 'REX FERRO',
    title: 'El Ejecutor de Hierro',
    type: 'LEGENDARIO',
    color: '#f59e0b',
    shadowColor: 'rgba(245,158,11,0.5)',
    bg: 'linear-gradient(180deg, #0a0500 0%, #180c00 40%, #080400 100%)',
    aura: 'radial-gradient(ellipse 55% 45% at 50% 28%, rgba(200,120,0,0.65) 0%, rgba(100,60,0,0.4) 45%, transparent 75%)',
    silhouette: 'radial-gradient(ellipse 28% 22% at 50% 22%, rgba(20,10,0,0.95) 0%, transparent 100%)',
    emoji: '⚔',
    stats: { ATK: 88, DEF: 72, HP: 110 },
  },
  {
    id: 4,
    name: 'PHANTOM',
    title: 'El Acechador de Sombras',
    type: 'ÉPICA',
    color: '#06b6d4',
    shadowColor: 'rgba(6,182,212,0.5)',
    bg: 'linear-gradient(180deg, #000a0d 0%, #001520 40%, #000508 100%)',
    aura: 'radial-gradient(ellipse 55% 45% at 50% 28%, rgba(0,160,200,0.6) 0%, rgba(0,70,100,0.4) 45%, transparent 75%)',
    silhouette: 'radial-gradient(ellipse 28% 22% at 50% 22%, rgba(0,10,20,0.95) 0%, transparent 100%)',
    emoji: '🌑',
    stats: { ATK: 82, DEF: 60, HP: 95 },
  },
];

export default function Catalog() {
  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch]         = useState('');
  const [type, setType]             = useState('all');
  const [rarity, setRarity]         = useState('all');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const searchTimeout = useRef(null);

  const fetchProducts = useCallback(async (page = 1, searchVal = search, typeVal = type, rarityVal = rarity) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 16 };
      if (searchVal.trim().length >= 4) params.search = searchVal.trim();
      if (typeVal   !== 'all') params.type   = typeVal;
      if (rarityVal !== 'all') params.rarity = rarityVal;

      const data = await globalApi.getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, type, rarity]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (search === '' || search.length >= 4) fetchProducts(1, search, type, rarity);
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  useEffect(() => { fetchProducts(1, search, type, rarity); }, [type, rarity]);

  const handlePage = (p) => fetchProducts(p, search, type, rarity);

  return (
    <div>
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div style={styles.hero}>
        {/* Scanline overlay for hero */}
        <div style={styles.heroScanlines} />

        {/* Decorative blood drips top */}
        <div style={styles.bloodDrips} />

        <div style={styles.heroContent}>
          <p style={styles.heroEyebrow}>// TEMPORADA V — EL DESPERTAR BRUTAL //</p>
          <h1
            className="glitch"
            data-text="NEXUS BATTLES V"
            style={styles.heroTitle}
          >
            NEXUS BATTLES V
          </h1>
          <p style={styles.heroTagline}>
            ☠ &nbsp;Solo los más brutales sobreviven al Nexus&nbsp; ☠
          </p>
        </div>

        {/* Character Portraits */}
        <div style={styles.charRow}>
          {HERO_CHARS.map(char => (
            <div
              key={char.id}
              style={{
                ...styles.charFrame,
                borderColor: char.color + '88',
                boxShadow: `0 0 28px ${char.shadowColor}, inset 0 0 20px rgba(0,0,0,0.8)`,
              }}
            >
              {/* Art area */}
              <div style={{
                ...styles.charArt,
                background: `${char.aura}, ${char.silhouette}, ${char.bg}`,
              }}>
                <span style={{ ...styles.charEmoji, filter: `drop-shadow(0 0 12px ${char.color})` }}>
                  {char.emoji}
                </span>
                {/* Rarity badge */}
                <div style={{ ...styles.charTypeBadge, background: char.color + '22', borderColor: char.color + '66', color: char.color }}>
                  {char.type}
                </div>
              </div>

              {/* Info */}
              <div style={styles.charInfo}>
                <div style={{ ...styles.charName, color: char.color, textShadow: `0 0 10px ${char.shadowColor}` }}>
                  {char.name}
                </div>
                <div style={styles.charTitle}>{char.title}</div>
                <div style={styles.charStats}>
                  {Object.entries(char.stats).map(([k, v]) => (
                    <span key={k} style={{ ...styles.charStat, borderColor: char.color + '44', color: char.color }}>
                      {k}&nbsp;{v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Corner decorators */}
              <div style={{ ...styles.corner, top: 0, left: 0, borderColor: char.color }} />
              <div style={{ ...styles.corner, top: 0, right: 0, transform: 'rotate(90deg)', borderColor: char.color }} />
              <div style={{ ...styles.corner, bottom: 0, right: 0, transform: 'rotate(180deg)', borderColor: char.color }} />
              <div style={{ ...styles.corner, bottom: 0, left: 0, transform: 'rotate(270deg)', borderColor: char.color }} />
            </div>
          ))}
        </div>

        {/* Bottom red separator */}
        <div style={styles.heroBottomBar} />
      </div>

      {/* ── Catalog content ──────────────────────────────────────────────── */}
      <div className="page-wrapper">
        <div className="page-header">
          <h1>⚔ Catálogo Global</h1>
          <p>Explora todas las cartas y objetos disponibles en el Nexus</p>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              type="text"
              placeholder="Buscar carta… (mín. 4 chars)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search.length > 0 && search.length < 4 && (
              <span style={styles.searchHint}>{4 - search.length} más…</span>
            )}
          </div>

          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'Todos los tipos' : t}</option>
            ))}
          </select>

          <select className="form-select" value={rarity} onChange={e => setRarity(e.target.value)}>
            {RARITIES.map(r => (
              <option key={r} value={r}>{r === 'all' ? 'Todas las rarezas' : r}</option>
            ))}
          </select>

          <span style={styles.counter}>
            {pagination.total} {pagination.total === 1 ? 'carta' : 'cartas'}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : error ? (
          <div className="alert-error" style={{ marginTop: '2rem' }}>{error}</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">☠</div>
            <h3>Sin resultados</h3>
            <p>Intenta con otro término de búsqueda o ajusta los filtros</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePage}
        />
      </div>
    </div>
  );
}

const styles = {
  /* ── Hero ── */
  hero: {
    position: 'relative',
    background: 'linear-gradient(180deg, #0d0000 0%, #120005 50%, #07090f 100%)',
    borderBottom: '1px solid #2a0000',
    overflow: 'hidden',
    paddingTop: '2.5rem',
    paddingBottom: 0,
  },
  heroScanlines: {
    position: 'absolute',
    inset: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  bloodDrips: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, transparent 5%, #cc0000 10%, transparent 15%, #8b0000 25%, transparent 30%, #cc0000 45%, transparent 50%, #8b0000 65%, transparent 70%, #cc0000 85%, transparent 90%)',
    boxShadow: '0 0 12px rgba(204,0,0,0.9)',
    zIndex: 2,
  },
  heroContent: {
    position: 'relative',
    zIndex: 3,
    textAlign: 'center',
    padding: '0 1.5rem 1.5rem',
  },
  heroEyebrow: {
    fontFamily: "'VT323', monospace",
    fontSize: '1rem',
    color: '#5a3a3a',
    letterSpacing: '0.15em',
    marginBottom: '0.5rem',
  },
  heroTitle: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: 'clamp(1rem, 3vw, 2rem)',
    fontWeight: 400,
    color: '#cc0000',
    textShadow: '0 0 30px rgba(204,0,0,0.8), 0 0 60px rgba(204,0,0,0.4), 0 2px 4px rgba(0,0,0,0.9)',
    letterSpacing: '0.08em',
    lineHeight: 1.3,
    marginBottom: '0.8rem',
    display: 'block',
  },
  heroTagline: {
    fontFamily: "'VT323', monospace",
    fontSize: '1.4rem',
    color: '#c9a84c',
    letterSpacing: '0.1em',
    textShadow: '0 0 10px rgba(201,168,76,0.4)',
  },
  charRow: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '0 1.5rem',
    flexWrap: 'wrap',
  },
  charFrame: {
    width: '168px',
    border: '1px solid',
    background: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
  },
  charArt: {
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  charEmoji: {
    fontSize: '3.5rem',
    marginBottom: '0.5rem',
    display: 'block',
  },
  charTypeBadge: {
    position: 'absolute',
    bottom: '0.4rem',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'VT323', monospace",
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
    padding: '0.1rem 0.5rem',
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
  charInfo: {
    padding: '0.65rem 0.7rem',
    background: 'rgba(0,0,0,0.7)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  charName: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '0.55rem',
    letterSpacing: '0.06em',
    marginBottom: '0.3rem',
    lineHeight: 1.4,
  },
  charTitle: {
    fontFamily: "'VT323', monospace",
    fontSize: '0.95rem',
    color: '#5a6070',
    letterSpacing: '0.04em',
    marginBottom: '0.45rem',
    lineHeight: 1.2,
  },
  charStats: {
    display: 'flex',
    gap: '0.25rem',
    flexWrap: 'wrap',
  },
  charStat: {
    fontFamily: "'VT323', monospace",
    fontSize: '0.85rem',
    padding: '0 0.3rem',
    border: '1px solid',
    letterSpacing: '0.05em',
  },
  corner: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderStyle: 'solid',
    borderWidth: '2px 0 0 2px',
    pointerEvents: 'none',
  },
  heroBottomBar: {
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #cc0000 30%, #ff2020 50%, #cc0000 70%, transparent)',
    boxShadow: '0 0 16px rgba(204,0,0,0.7)',
    marginTop: '1.5rem',
  },

  /* ── Catalog ── */
  toolbar: {
    display: 'flex',
    gap: '0.8rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.8rem',
    padding: '1rem 1.2rem',
    background: '#0d0a0a',
    border: '1px solid #2a0000',
    borderLeft: '3px solid #cc0000',
  },
  searchIcon: {
    position: 'absolute', left: '0.7rem', top: '50%',
    transform: 'translateY(-50%)', fontSize: '0.9rem', pointerEvents: 'none',
  },
  searchHint: {
    position: 'absolute', right: '0.7rem', top: '50%',
    transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#4a5568',
  },
  counter: {
    color: '#8a93a8', fontSize: '0.83rem',
    fontFamily: "'VT323', monospace",
    fontSize: '1rem',
    letterSpacing: '0.05em',
    marginLeft: 'auto', whiteSpace: 'nowrap',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: '1.2rem',
  },
};
