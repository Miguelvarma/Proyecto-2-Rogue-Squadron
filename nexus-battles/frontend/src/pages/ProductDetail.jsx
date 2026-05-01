import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { globalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

const RARITY_COLOR = {
  'Común': '#8a93a8', 'Rara': '#4a9eff', 'Épica': '#a855f7', 'Legendaria': '#f59e0b'
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [ratingDone, setRatingDone]   = useState(false);
  const [msg, setMsg]                 = useState('');

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setError('');
    setLoading(true);

    globalApi.getProduct(id)
      .then(data  => { if (!cancelled) setProduct(data.product); })
      .catch(err  => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const refreshProduct = async () => {
    try {
      const data = await globalApi.getProduct(id);
      setProduct(data.product);
    } catch { /* silent */ }
  };

  const handleRating = async (stars) => {
    if (!isAuthenticated) return navigate('/login');
    if (ratingDone) return;
    try {
      await globalApi.addRating(id, stars);
      setRatingDone(true);
      setMsg('¡Calificación registrada!');
      refreshProduct();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await globalApi.addComment(id, commentText.trim());
      setCommentText('');
      refreshProduct();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;
    try {
      await globalApi.deleteComment(id, commentId);
      refreshProduct();
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  if (error) return (
    <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔮</div>
      <h2 style={{ fontFamily: "'Cinzel', serif", color: '#c9a84c', marginBottom: '0.5rem' }}>
        Producto no encontrado
      </h2>
      <p style={{ color: '#8a93a8', marginBottom: '1.5rem' }}>{error}</p>
      <button className="btn btn-outline" onClick={() => navigate('/catalog')}>
        ← Volver al catálogo
      </button>
    </div>
  );

  const rarityColor = RARITY_COLOR[product.rarity] || '#8a93a8';

  return (
    <div className="page-wrapper">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        ← Volver
      </button>

      <div style={styles.layout}>
        {/* Panel izquierdo — imagen + stats */}
        <div style={styles.leftPanel}>
          <div style={{ ...styles.imageWrap, borderColor: rarityColor + '55' }}>
            <img src={product.image} alt={product.name} style={styles.image}
              onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/fallback/300/400'; }} />
            <div style={{ ...styles.rarityBar, background: rarityColor }} />
          </div>

          {/* Stats */}
          <div style={styles.statsBox}>
            <h4 style={styles.statsTitle}>Estadísticas</h4>
            <div style={styles.statsGrid}>
              {Object.entries(product.stats || {}).map(([key, val]) => val > 0 && (
                <div key={key} style={styles.statItem}>
                  <span style={{ color: '#8a93a8', fontSize: '0.78rem', textTransform: 'uppercase' }}>{key}</span>
                  <span style={{ color: '#e8e6df', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.priceBox}>
            <span style={{ color: '#8a93a8', fontSize: '0.85rem' }}>Precio</span>
            <span style={{ fontFamily: "'Cinzel', serif", color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700 }}>
              {product.price?.toLocaleString()} 💰
            </span>
          </div>
        </div>

        {/* Panel derecho — info + comentarios */}
        <div style={styles.rightPanel}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <span className={`badge-rarity badge-${product.rarity.toLowerCase()}`}>{product.rarity}</span>
              <span style={{ marginLeft: '0.5rem', color: '#8a93a8', fontSize: '0.85rem' }}>{product.type}</span>
              <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.6rem', color: '#c9a84c', marginTop: '0.4rem' }}>
                {product.name}
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <StarRating value={product.avgRating} readonly size="1.4rem" />
              <div style={{ color: '#8a93a8', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                {product.avgRating > 0 ? `${product.avgRating} / 5` : 'Sin calificaciones'} · {product.totalRatings} voto{product.totalRatings !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <hr className="divider-gold" />

          <p style={{ color: '#c8c4bc', lineHeight: 1.75, fontSize: '0.95rem' }}>{product.description}</p>

          {/* Efectos */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>⚡ Efectos</h3>
            <p style={{ color: '#b8cce8', fontSize: '0.9rem', lineHeight: 1.7 }}>{product.effects}</p>
          </div>

          {/* Habilidades */}
          {product.abilities?.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>✨ Habilidades</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.abilities.map(ab => (
                  <span key={ab} style={styles.abilityTag}>{ab}</span>
                ))}
              </div>
            </div>
          )}

          <hr className="divider-gold" />

          {/* Calificar */}
          {isAuthenticated && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Tu calificación</h3>
              {ratingDone ? (
                <div className="alert-success">✓ {msg}</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <StarRating value={0} onChange={handleRating} size="1.8rem" />
                  <span style={{ color: '#8a93a8', fontSize: '0.82rem' }}>Solo puedes calificar una vez</span>
                </div>
              )}
              {msg && !ratingDone && <div className="alert-error" style={{ marginTop: '0.5rem' }}>{msg}</div>}
            </div>
          )}

          {/* Comentarios */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              💬 Comentarios ({product.comments?.length || 0})
            </h3>

            {/* Nuevo comentario */}
            {isAuthenticated ? (
              <form onSubmit={handleComment} style={{ marginBottom: '1.5rem' }}>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Escribe tu comentario sobre esta carta…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !commentText.trim()}
                  style={{ marginTop: '0.6rem' }}
                >
                  {submitting ? 'Publicando…' : 'Publicar comentario'}
                </button>
              </form>
            ) : (
              <p style={{ color: '#8a93a8', fontSize: '0.88rem', marginBottom: '1rem' }}>
                <button className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
                  Inicia sesión para comentar
                </button>
              </p>
            )}

            {/* Lista de comentarios */}
            {product.comments?.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div style={{ fontSize: '1.5rem' }}>💭</div>
                <p style={{ color: '#4a5568', marginTop: '0.5rem' }}>Sé el primero en comentar</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {product.comments.map(c => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    isOwn={user?.id === c.userId}
                    onDelete={() => handleDeleteComment(c.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentCard({ comment, isOwn, onDelete }) {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1e2d45',
      borderRadius: '10px', padding: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #a87c30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#0a0800',
          }}>
            {comment.apodo?.[0]?.toUpperCase()}
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#c9a84c' }}>{comment.apodo}</span>
          {comment.stars && <StarRating value={comment.stars} readonly size="0.85rem" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ color: '#4a5568', fontSize: '0.75rem' }}>
            {new Date(comment.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          {isOwn && (
            <button
              onClick={onDelete}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
              title="Eliminar comentario"
            >
              🗑
            </button>
          )}
        </div>
      </div>
      <p style={{ color: '#c8c4bc', fontSize: '0.9rem', lineHeight: 1.65 }}>{comment.text}</p>
    </div>
  );
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' },
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '80px' },
  imageWrap: {
    border: '2px solid', borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  image: { width: '100%', display: 'block', aspectRatio: '3/4', objectFit: 'cover' },
  rarityBar: { height: '4px', width: '100%' },
  statsBox: {
    background: '#0d1220', border: '1px solid #1e2d45', borderRadius: '10px', padding: '1rem',
  },
  statsTitle: { fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: '#c9a84c', marginBottom: '0.7rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  priceBox: {
    background: '#0d1220', border: '1px solid #6b5520', borderRadius: '10px', padding: '0.8rem 1rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  section: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  sectionTitle: { fontFamily: "'Cinzel', serif", fontSize: '0.95rem', color: '#c9a84c' },
  abilityTag: {
    background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)',
    color: '#c084fc', borderRadius: '6px', padding: '0.25rem 0.7rem', fontSize: '0.82rem',
  },
};
