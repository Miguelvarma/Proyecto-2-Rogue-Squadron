import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardArt from './CardArt';

const RARITY_CONFIG = {
  'Común':      { cls: 'badge-common',    color: '#8a93a8', glow: 'rgba(138,147,168,0.2)' },
  'Rara':       { cls: 'badge-rare',      color: '#4a9eff', glow: 'rgba(74,158,255,0.25)' },
  'Épica':      { cls: 'badge-epic',      color: '#a855f7', glow: 'rgba(168,85,247,0.25)' },
  'Legendaria': { cls: 'badge-legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
};

const TYPE_ICON = { 'Héroe': '🦸', 'Hechizo': '✨', 'Ítem': '🗡️', 'Trampa': '🪤' };

function Stars({ rating }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '0.75rem', letterSpacing: '1px' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span style={{ color: '#8a93a8', marginLeft: '0.3rem', fontSize: '0.72rem' }}>
        {rating > 0 ? rating.toFixed(1) : 'Sin calificar'}
      </span>
    </span>
  );
}

export default function ProductCard({ product, showPrice = true }) {
  const navigate = useNavigate();
  const rarity = RARITY_CONFIG[product.rarity] || RARITY_CONFIG['Común'];
  const [artHover, setArtHover] = useState(false);

  return (
    <div
      className="card"
      onClick={() => navigate(`/catalog/${product.id}`)}
      style={{
        cursor: 'pointer',
        borderColor: rarity.color + '44',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      title={product.name}
    >
      {/* Arte animado de la carta */}
      <div style={{ position: 'relative', overflow: 'hidden' }}
        onMouseEnter={() => setArtHover(true)}
        onMouseLeave={() => setArtHover(false)}
      >
        <div style={{
          width: '100%',
          height: '160px',
          display: 'block',
          transition: 'transform 0.35s ease',
          transform: artHover ? 'scale(1.07)' : 'scale(1)',
        }}>
          <CardArt productId={product.id} height={160} />
        </div>
        {/* Overlay de rareza en imagen */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to bottom, transparent 50%, ${rarity.glow} 100%)`,
          pointerEvents: 'none',
        }} />
        {/* Tipo */}
        <span style={{
          position: 'absolute', top: '0.5rem', left: '0.5rem',
          fontSize: '1.2rem', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
        }}>
          {TYPE_ICON[product.type] || '📦'}
        </span>
        {/* Maná */}
        {product.stats?.mana > 0 && (
          <span style={{
            position: 'absolute', top: '0.4rem', right: '0.5rem',
            background: 'rgba(74,158,255,0.85)',
            color: '#fff', borderRadius: '50%',
            width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700,
            boxShadow: '0 0 8px rgba(74,158,255,0.6)',
          }}>
            {product.stats.mana}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h3 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#e8e6df',
            lineHeight: 1.3,
            flex: 1,
          }}>
            {product.name}
          </h3>
          <span className={`badge-rarity ${rarity.cls}`} style={{ flexShrink: 0 }}>
            {product.rarity}
          </span>
        </div>

        <span style={{ fontSize: '0.78rem', color: '#8a93a8' }}>
          {product.type}
        </span>

        {/* Stats rápidos */}
        {product.stats && (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
            {product.stats.atk > 0 && <StatPill label="ATK" value={product.stats.atk} color="#ef4444" />}
            {product.stats.def > 0 && <StatPill label="DEF" value={product.stats.def} color="#3b82f6" />}
            {product.stats.hp  > 0 && <StatPill label="HP"  value={product.stats.hp}  color="#10b981" />}
          </div>
        )}

        {/* Habilidades */}
        {product.abilities?.length > 0 && (
          <p style={{ fontSize: '0.75rem', color: '#8a93a8', marginTop: '0.2rem', fontStyle: 'italic' }}>
            {product.abilities.slice(0, 2).join(' · ')}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stars rating={product.avgRating || 0} />
          {showPrice && (
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: '#c9a84c', fontWeight: 600 }}>
              {product.price?.toLocaleString()} 💰
            </span>
          )}
        </div>
      </div>

      {/* Borde inferior de rareza */}
      <div style={{ height: '3px', background: rarity.color, opacity: 0.7 }} />
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 600,
      padding: '0.1rem 0.4rem', borderRadius: '4px',
      background: color + '20', color, border: `1px solid ${color}44`,
    }}>
      {label} {value}
    </span>
  );
}
