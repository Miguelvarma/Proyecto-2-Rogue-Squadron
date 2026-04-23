// src/pages/UnifiedDetailPage.tsx (versión mejorada con fallback)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import "../styles/product-detail.css";

interface UnifiedItem {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  descuento?: number;
  efecto?: string;
  category: string;
  item_type: 'hero' | 'product';
  stars?: number;
  poder?: number;
  vida?: number;
  defensa?: number;
  ataque?: string;
  damage?: string;
  rarity?: string;
  emoji?: string;
}

interface Rating {
  id: string;
  userName: string;
  stars: number;
  comment: string;
  date: string;
}

const generateRandomRatings = (itemId: number, itemName: string): Rating[] => {
  const users = [
    { name: '⚔️ GuerreroLegend', comments: ['Increíble', 'Poderoso', 'Vale cada centavo'] },
    { name: '🔮 MagoSupremo', comments: ['Excelente', 'Lo recomiendo', 'Perfecto'] },
    { name: '🛡️ TankMaster', comments: ['Gran resistencia', 'Útil', 'Impresionante'] },
    { name: '🗡️ AsesinoSilen', comments: ['Letal', 'Daño masivo', 'Rápido'] },
    { name: '🌿 HealerGod', comments: ['Salva vidas', 'Indispensable', 'Gran soporte'] },
    { name: '🐉 DragonSlayer', comments: ['Legendario', 'Épico', 'Poder absoluto'] }
  ];

  const numRatings = Math.floor(Math.random() * 4) + 2;
  const ratings: Rating[] = [];
  
  for (let i = 0; i < numRatings; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const stars = Math.random() > 0.3 ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 2) + 3;
    const randomComment = randomUser.comments[Math.floor(Math.random() * randomUser.comments.length)];
    const randomDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    
    ratings.push({
      id: `${itemId}-${i}`,
      userName: randomUser.name,
      stars: stars,
      comment: `${randomComment}! ${itemName} es ${stars === 5 ? 'espectacular' : stars === 4 ? 'muy bueno' : 'bueno'}.`,
      date: randomDate.toISOString().split('T')[0]
    });
  }
  
  return ratings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function UnifiedDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<UnifiedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      // Intentar primero con el nuevo endpoint unificado
      const response = await fetch(`http://localhost:3000/api/v1/shop/${id}`);
      const data = await response.json();
      
      if (data.success && data.item) {
        setItem(data.item);
        const randomRatings = generateRandomRatings(Number(id) || data.item.id, data.item.name);
        setRatings(randomRatings);
        return;
      }
    } catch (error) {
      console.log('Endpoint unificado no disponible, usando fallback...');
    }
    
    // Fallback: usar endpoints antiguos
    await fetchItemLegacy();
    setLoading(false);
  };

  const fetchItemLegacy = async () => {
    try {
      // PRIMERO: Buscar en productos (armas, armaduras, etc.)
      let response = await fetch(`http://localhost:3000/api/v1/products/${id}`);
      let data = await response.json();
      
      if (data.success && data.product) {
        setItem({ 
          ...data.product, 
          category: data.product.category || 'weapon', 
          item_type: 'product' 
        });
        const randomRatings = generateRandomRatings(Number(id) || data.product.id, data.product.name);
        setRatings(randomRatings);
        return;
      }
      
      // SEGUNDO: Buscar en héroes
      response = await fetch(`http://localhost:3000/api/v1/heroes/${id}`);
      data = await response.json();
      
      if (data.success && data.hero) {
        setItem({ 
          ...data.hero, 
          category: 'hero', 
          item_type: 'hero' 
        });
        const randomRatings = generateRandomRatings(Number(id) || data.hero.id, data.hero.name);
        setRatings(randomRatings);
        return;
      }
      
      // No encontrado
      console.error('Item no encontrado en products ni heroes');
      navigate('/shop');
      
    } catch (error) {
      console.error('Error en fetchItemLegacy:', error);
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i: any) => i.id === item?.id);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...item, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getRarityColor = () => {
    switch (item?.rarity?.toUpperCase()) {
      case 'LEGENDARY': return '#F5C842';
      case 'EPIC': return '#B06EFF';
      case 'RARE': return '#30B8E8';
      default: return '#9E9E9E';
    }
  };

  const getRarityName = () => {
    switch (item?.rarity?.toUpperCase()) {
      case 'LEGENDARY': return 'Legendario';
      case 'EPIC': return 'Épico';
      case 'RARE': return 'Raro';
      default: return 'Común';
    }
  };

  const getAvgStars = () => {
    if (ratings.length === 0) return '0';
    const avg = ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length;
    return avg.toFixed(1);
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="loading-spinner">⚔️</div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!item) return null;

  const finalPrice = item.descuento ? item.price * (1 - item.descuento / 100) : item.price;
  const hasDiscount = item.descuento && item.descuento > 0;
  const rarityColor = getRarityColor();
  const rarityName = getRarityName();
  const avgStars = getAvgStars();

  return (
    <div className="product-detail-container">
      <div className="product-detail-card" style={{ borderColor: rarityColor, boxShadow: `0 0 30px ${rarityColor}33` }}>
        
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate('/shop')}>← Volver</button>
          <div className="product-rarity" style={{ backgroundColor: rarityColor }}>
            {rarityName}
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-image">
            {item.image ? (
              <img src={item.image} alt={item.name} />
            ) : (
              <div className="detail-icon" style={{ fontSize: '5rem' }}>
                {item.category === 'hero' ? '⚔️' : 
                 item.category === 'weapon' ? '🗡️' :
                 item.category === 'armor' ? '🛡️' :
                 item.category === 'potion' ? '🧪' : '📦'}
              </div>
            )}
            {hasDiscount && <div className="discount-badge">-{item.descuento}%</div>}
          </div>

          <div className="detail-info">
            <h1 className="detail-name">{item.name}</h1>
            <div className="detail-type">
              <span className="type-badge">
                {item.category === 'hero' ? 'Héroe' :
                 item.category === 'weapon' ? 'Arma' :
                 item.category === 'armor' ? 'Armadura' :
                 item.category === 'potion' ? 'Poción' : 'Artefacto'}
              </span>
              {item.rarity && (
                <span className="rarity-badge-detail" style={{ color: rarityColor }}>
                  {rarityName}
                </span>
              )}
            </div>
            <p className="detail-description">{item.description}</p>

            {/* Calificaciones */}
            <div className="detail-rating-section">
              <div className="rating-header">
                <div className="stars-display">
                  {'★'.repeat(Math.floor(Number(avgStars)))}{'☆'.repeat(5 - Math.floor(Number(avgStars)))}
                </div>
                <div className="rating-info">
                  <span className="rating-value">{avgStars}</span>
                  <span className="rating-count">({ratings.length} calificaciones)</span>
                </div>
              </div>

              <div className="ratings-list">
                <h4>✨ Opiniones de Aventureros ✨</h4>
                {ratings.length > 0 ? (
                  ratings.map((rating) => (
                    <div key={rating.id} className="rating-item">
                      <div className="rating-header-item">
                        <div className="rating-stars">
                          {'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)}
                        </div>
                        <span className="rating-user">{rating.userName}</span>
                      </div>
                      <p className="rating-comment-text">"{rating.comment}"</p>
                      <div className="rating-meta">
                        <span className="rating-date">📅 {new Date(rating.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-ratings">
                    <p>✨ Sé el primero en calificar ✨</p>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas específicas */}
            {item.category === 'hero' && (
              <div className="detail-stats-grid">
                <div className="stat-item"><span className="stat-icon">⭐</span><span className="stat-value">{item.stars}</span><span className="stat-label">Estrellas</span></div>
                <div className="stat-item"><span className="stat-icon">💪</span><span className="stat-value">{item.poder}</span><span className="stat-label">Poder</span></div>
                <div className="stat-item"><span className="stat-icon">❤️</span><span className="stat-value">{item.vida}</span><span className="stat-label">Vida</span></div>
                <div className="stat-item"><span className="stat-icon">🛡️</span><span className="stat-value">{item.defensa}</span><span className="stat-label">Defensa</span></div>
                <div className="stat-item full-width"><span className="stat-icon">⚔️</span><span className="stat-value">{item.ataque}</span><span className="stat-label">Ataque</span></div>
                <div className="stat-item full-width"><span className="stat-icon">🎲</span><span className="stat-value">{item.damage}</span><span className="stat-label">Daño</span></div>
              </div>
            )}

            {(item.category === 'weapon' || item.category === 'artifact') && (
              <div className="detail-stats-grid">
                {item.poder && item.poder > 0 && (
                  <div className="stat-item"><span className="stat-icon">💪</span><span className="stat-value">{item.poder}</span><span className="stat-label">Poder</span></div>
                )}
                {item.ataque && (
                  <div className="stat-item full-width"><span className="stat-icon">⚔️</span><span className="stat-value">{item.ataque}</span><span className="stat-label">Ataque</span></div>
                )}
                {item.damage && (
                  <div className="stat-item full-width"><span className="stat-icon">🎲</span><span className="stat-value">{item.damage}</span><span className="stat-label">Daño</span></div>
                )}
              </div>
            )}

            {item.category === 'armor' && (
              <div className="detail-stats-grid">
                <div className="stat-item"><span className="stat-icon">❤️</span><span className="stat-value">{item.vida}</span><span className="stat-label">Vida</span></div>
                <div className="stat-item"><span className="stat-icon">🛡️</span><span className="stat-value">{item.defensa}</span><span className="stat-label">Defensa</span></div>
              </div>
            )}

            {item.efecto && (
              <div className="detail-effect">
                <span className="effect-icon">✨</span>
                <span className="effect-text">{item.efecto}</span>
              </div>
            )}

            {/* Precio y compra */}
            <div className="detail-footer">
              <div className="detail-price">
                {hasDiscount ? (
                  <>
                    <span className="price-old">${item.price.toFixed(2)} USD</span>
                    <span className="price-new">${finalPrice.toFixed(2)} USD</span>
                  </>
                ) : (
                  <span className="price-new">${item.price.toFixed(2)} USD</span>
                )}
                <span className="stock">Stock: {item.stock}</span>
              </div>

              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button className="add-to-cart-btn" onClick={addToCart} disabled={item.stock === 0}>
                {item.stock > 0 ? '🛒 Añadir al carrito' : 'AGOTADO'}
              </button>
            </div>

            {addedToCart && <div className="success-message">✅ ¡Añadido al carrito!</div>}
          </div>
        </div>
      </div>

      <style>{`
        .rating-header-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        .rating-user {
          font-size: 0.7rem;
          color: #F5C842;
          font-weight: bold;
        }
        .rating-comment-text {
          font-size: 0.75rem;
          color: #B89A6A;
          font-style: italic;
          margin: 0.3rem 0;
        }
        .rating-date {
          font-size: 0.6rem;
          color: #7A6A58;
        }
        .ratings-list h4 {
          color: #C8860A;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
          border-left: 2px solid #C8860A;
          padding-left: 0.5rem;
        }
        .no-ratings {
          text-align: center;
          padding: 1rem;
          color: #B89A6A;
          font-style: italic;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          margin: 0.5rem 0;
        }
        .rarity-badge-detail {
          display: inline-block;
          padding: 0.2rem 0.8rem;
          background: rgba(0,0,0,0.3);
          border-radius: 20px;
          font-size: 0.7rem;
          margin-left: 0.5rem;
        }
        .detail-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          background: rgba(0,0,0,0.2);
          padding: 1rem;
          border-radius: 12px;
          margin: 1rem 0;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0,0,0,0.3);
          padding: 0.5rem;
          border-radius: 8px;
        }
        .stat-item.full-width {
          grid-column: span 2;
        }
        .stat-icon {
          font-size: 1rem;
        }
        .stat-value {
          font-weight: bold;
          color: #F5C842;
          font-size: 0.9rem;
        }
        .stat-label {
          color: #B89A6A;
          font-size: 0.7rem;
          margin-left: auto;
        }
        .detail-effect {
          background: linear-gradient(135deg, rgba(176,110,255,0.1), rgba(245,200,66,0.1));
          padding: 0.8rem;
          border-radius: 10px;
          margin: 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-left: 3px solid #B06EFF;
        }
        .effect-icon {
          font-size: 1.2rem;
        }
        .effect-text {
          color: #B06EFF;
          font-style: italic;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}