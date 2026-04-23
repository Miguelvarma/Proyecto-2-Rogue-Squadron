import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { inventoryApi, Item } from '@/api/inventory';
import { ratingsApi } from '@/api/ratings';
import RatingStars from '@/components/RatingStars';
import { getErrorMessage } from '@/api/client';
import './ItemDetailPage.css';

// ✅ Función para extraer número del ID (ej: "item-1" → 1)
const extractNumberFromId = (id: string): number => {
  if (!id) return 0;
  // Si es solo número
  if (/^\d+$/.test(id)) {
    return parseInt(id, 10);
  }
  // Si tiene formato "item-1", "product-2", etc.
  const match = id.match(/\d+$/);
  if (!match) {
    console.warn('ID sin número al final, usando 0:', id);
    return 0;
  }
  return parseInt(match[0], 10);
};

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [average, setAverage] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Extraer número antes de usar
        const numericId = extractNumberFromId(id);
        
        const [itemRes, ratingRes] = await Promise.all([
          inventoryApi.getItemById(id), // ✅ El inventoryApi usa string, no cambiar
          ratingsApi.getProductRating(numericId) // ✅ number para ratings
        ]);
        
        setItem(itemRes.item);
        setAverage(ratingRes.average);
        setTotalRatings(ratingRes.count);
        setUserRating(ratingRes.userRating);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleRateComplete = async () => {
    if (!id) return;
    try {
      const numericId = extractNumberFromId(id); // ✅ Extraer número
      const ratingRes = await ratingsApi.getProductRating(numericId);
      setAverage(ratingRes.average);
      setTotalRatings(ratingRes.count);
      setUserRating(ratingRes.userRating);
    } catch (err) {
      console.error('Error al recargar ratings:', err);
    }
  };

  const handleDelete = async () => {
    if (!id || !item) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar "${item.nombre}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await inventoryApi.deleteItem(id);
      navigate('/inventory');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const getRarityColor = (rareza: string) => {
    switch (rareza) {
      case 'Legendaria': return 'var(--rarity-legendary)';
      case 'Épica': return 'var(--rarity-epic)';
      case 'Rara': return 'var(--rarity-rare)';
      case 'Común': return 'var(--rarity-common)';
      default: return 'var(--color-rune-gray)';
    }
  };

  const getTypeEmoji = (tipo: string) => {
    switch (tipo) {
      case 'Arma': return '⚔️';
      case 'Armadura': return '🛡️';
      case 'Héroe': return '🧙';
      case 'Habilidad': return '🔮';
      case 'Ítem': return '📜';
      case 'Épica': return '👑';
      default: return '❓';
    }
  };

  // 🔧 CRÍTICO: Verificar si el usuario actual es ADMIN (puede eliminar items)
  const userRol = (user as any)?.rol;
  const canDelete = userRol === 'ADMIN';

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>CARGANDO DETALLE...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="error-container">
        <div className="error-message">⚠️ {error || 'Ítem no encontrado'}</div>
        <button className="back-button" onClick={() => navigate('/inventory')}>
          ← Volver al Inventario
        </button>
      </div>
    );
  }

  return (
    <div className="item-detail-page">
      <div className="item-detail-container">
        <button className="back-button" onClick={() => navigate('/inventory')}>
          ← Volver
        </button>

        <div 
          className="item-detail-card"
          style={{
            borderColor: getRarityColor(item.rareza),
            boxShadow: `0 0 30px ${getRarityColor(item.rareza)}66`
          }}
        >
          <div className="item-detail-image">
            {item.imagen && !item.imagen.includes('example') ? (
              <img src={item.imagen} alt={item.nombre} />
            ) : (
              <span className="item-emoji-large">{getTypeEmoji(item.tipo)}</span>
            )}
          </div>

          <h1 className="item-detail-name" style={{ color: getRarityColor(item.rareza) }}>
            {item.nombre}
          </h1>

          <div className="item-detail-badges">
            <span 
              className="rarity-badge"
              style={{
                background: `${getRarityColor(item.rareza)}33`,
                borderColor: getRarityColor(item.rareza),
                color: getRarityColor(item.rareza)
              }}
            >
              {item.rareza}
            </span>
            <span className="type-badge">
              {item.tipo}
            </span>
          </div>

          {/* ⭐ SECCIÓN DE CALIFICACIONES */}
          <div className="item-rating-section">
            <h3>Calificaciones</h3>
            <RatingStars
              productId={id!}  // ✅ Pasar el string completo, RatingStars extraerá el número
              initialRating={userRating}
              average={average}
              totalRatings={totalRatings}
              onRate={handleRateComplete}
            />
          </div>

          <p className="item-detail-description">
            {item.descripcion}
          </p>

          <div className="item-detail-stats">
            <div className="stat-box">
              <div className="stat-label">ATAQUE</div>
              <div className="stat-value attack">{item.ataque}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">DEFENSA</div>
              <div className="stat-value defense">{item.defensa}</div>
            </div>
          </div>

          {item.habilidades?.length > 0 && (
            <div className="item-abilities">
              <h3>⚡ Habilidades</h3>
              <ul>
                {item.habilidades.map((hab, idx) => (
                  <li key={idx}>• {hab}</li>
                ))}
              </ul>
            </div>
          )}

          {item.efectos?.length > 0 && (
            <div className="item-effects">
              <h3>✨ Efectos</h3>
              <ul>
                {item.efectos.map((efecto, idx) => (
                  <li key={idx}>• {efecto}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 🔧 CRÍTICO: Mostrar botón DELETE solo si es ADMIN */}
          {canDelete && (
            <button
              className="delete-button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '🗑️ Eliminando...' : '🗑️ Eliminar Ítem'}
            </button>
          )}
          
          {!canDelete && (
            <div style={{ padding: '1rem', color: 'var(--color-rune-gray)', textAlign: 'center', fontSize: '0.9em', marginTop: '1rem' }}>
              💡 Solo los administradores pueden eliminar items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}