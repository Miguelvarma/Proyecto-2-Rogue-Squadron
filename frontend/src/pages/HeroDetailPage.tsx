// src/pages/HeroDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Hero {
  id: number;
  name: string;
  description: string;
  type: string;
  rarity: string;
  attack?: number;
  ataque?: number;
  defense?: number;
  defensa?: number;
  health?: number;
  vida?: number;
  power?: number;
  poder?: number;
  price?: number;
  precio?: number;
  stock?: number;
  image?: string;
  imagen?: string;
  habilidades?: string[];
  effects?: string[];
}

interface Rating {
  id: string;
  userName: string;
  stars: number;
  comment: string;
  date: string;
}

const generateRandomRatings = (heroId: number, heroName: string): Rating[] => {
  const users = [
    { name: '⚔️ GuerreroLegend', comments: ['Increíble héroe', 'Muy poderoso', 'Vale cada centavo', 'Excelente guerrero'] },
    { name: '🔮 MagoSupremo', comments: ['Perfecto para mi equipo', 'Lo recomiendo totalmente', 'Gran estratega', 'Me encanta'] },
    { name: '🛡️ TankMaster', comments: ['Gran resistencia', 'Muy útil en batalla', 'Defensa increíble', 'Impresionante'] },
    { name: '🗡️ AsesinoSilen', comments: ['Letal y efectivo', 'Daño masivo', 'Rápido y preciso', 'Excelente asesino'] },
    { name: '🌿 HealerGod', comments: ['Salva vidas', 'Indispensable', 'Gran soporte', 'Muy versátil'] },
    { name: '🐉 DragonSlayer', comments: ['Legendario', 'No puede faltar', 'Poder absoluto', 'Épico'] }
  ];

  const numRatings = Math.floor(Math.random() * 5) + 3;
  const ratings: Rating[] = [];
  
  for (let i = 0; i < numRatings; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const stars = Math.random() > 0.3 ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 2) + 3;
    const randomComment = randomUser.comments[Math.floor(Math.random() * randomUser.comments.length)];
    const randomDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    
    ratings.push({
      id: `${heroId}-${i}`,
      userName: randomUser.name,
      stars: stars,
      comment: `${randomComment}! ${heroName} es ${stars === 5 ? 'espectacular' : stars === 4 ? 'muy bueno' : 'bueno'}.`,
      date: randomDate.toISOString().split('T')[0]
    });
  }
  
  return ratings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function HeroDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchHero();
  }, [id]);

  const fetchHero = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/heroes/${id}`);
      const data = await response.json();
      
      console.log('Datos del héroe:', data);
      
      if (data.success && data.hero) {
        setHero(data.hero);
        const randomRatings = generateRandomRatings(Number(id) || data.hero.id, data.hero.name);
        setRatings(randomRatings);
      } else {
        setError('Héroe no encontrado');
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar el héroe');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!hero) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i: any) => i.id === hero.id);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ 
        id: hero.id,
        name: hero.name,
        description: hero.description,
        price: getHeroPrice(),
        stock: hero.stock,
        rarity: hero.rarity,
        category: 'hero',
        type: hero.type,
        image: getHeroImage(),
        quantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Funciones para obtener valores con nombres alternativos
  const getHeroAttack = () => hero?.attack ?? hero?.ataque ?? 0;
  const getHeroDefense = () => hero?.defense ?? hero?.defensa ?? 0;
  const getHeroHealth = () => hero?.health ?? hero?.vida ?? 0;
  const getHeroPower = () => hero?.power ?? hero?.poder ?? 0;
  const getHeroPrice = () => hero?.price ?? hero?.precio ?? 0;
  const getHeroImage = () => hero?.image ?? hero?.imagen ?? null;
  const getHeroAbilities = () => hero?.habilidades ?? hero?.effects ?? [];

  const getRarityClass = (rarity?: string) => {
    switch (rarity?.toUpperCase()) {
      case 'LEGENDARY': return 'rarity-legendary';
      case 'EPIC': return 'rarity-epic';
      case 'RARE': return 'rarity-rare';
      default: return 'rarity-common';
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toUpperCase()) {
      case 'LEGENDARY': return 'var(--rarity-legendary)';
      case 'EPIC': return 'var(--rarity-epic)';
      case 'RARE': return 'var(--rarity-rare)';
      default: return 'var(--rarity-common)';
    }
  };

  const getRarityName = (rarity?: string) => {
    switch (rarity?.toUpperCase()) {
      case 'LEGENDARY': return 'Legendario';
      case 'EPIC': return 'Épico';
      case 'RARE': return 'Raro';
      default: return 'Común';
    }
  };

  const getHeroTypeIcon = (type?: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('guerrero') || typeLower.includes('guerrer')) return '⚔️';
    if (typeLower.includes('mago') || typeLower.includes('hechicer')) return '🔮';
    if (typeLower.includes('picaro') || typeLower.includes('asesino') || typeLower.includes('susurro')) return '🗡️';
    if (typeLower.includes('sanador') || typeLower.includes('chaman') || typeLower.includes('medico')) return '💚';
    return '🧙';
  };

  const getHeroTypeName = (type?: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('guerrero') || typeLower.includes('guerrer')) return 'Guerrero';
    if (typeLower.includes('mago') || typeLower.includes('hechicer')) return 'Mago';
    if (typeLower.includes('picaro') || typeLower.includes('asesino') || typeLower.includes('susurro')) return 'Pícaro';
    if (typeLower.includes('sanador') || typeLower.includes('chaman') || typeLower.includes('medico')) return 'Sanador';
    return type || 'Héroe';
  };

  const getAvgStars = () => {
    if (ratings.length === 0) return '0';
    const avg = ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length;
    return avg.toFixed(1);
  };

  if (loading) {
    return (
      <div className="page-content" style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>⚔️</div>
        <p className="text-dim">Cargando héroe...</p>
      </div>
    );
  }

  if (error || !hero) {
    return (
      <div className="page-content" style={{ textAlign: 'center', padding: '4rem' }}>
        <p className="text-crimson">⚠️ {error || 'Héroe no encontrado'}</p>
        <button className="nbv-btn nbv-btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    );
  }

  const rarityClass = getRarityClass(hero.rarity);
  const rarityColor = getRarityColor(hero.rarity);
  const rarityName = getRarityName(hero.rarity);
  const avgStars = getAvgStars();
  const abilities = getHeroAbilities();
  const isOutOfStock = (hero.stock || 0) === 0;

  return (
    <div className="page-content">
      <div className="nbv-card" style={{ 
        borderColor: `${rarityColor}66`,
        boxShadow: `0 0 30px ${rarityColor}33`
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button className="nbv-btn nbv-btn-ghost" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <span className={`nbv-badge nbv-badge-gold ${rarityClass}`} style={{ backgroundColor: `${rarityColor}22`, borderColor: rarityColor }}>
            {rarityName}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
          {/* Imagen */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: 'rgba(0,0,0,0.3)', 
            borderRadius: '16px', 
            padding: '2rem',
            minHeight: '300px'
          }}>
            {getHeroImage() ? (
              <img src={getHeroImage()!} alt={hero.name} style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
            ) : (
              <div style={{ fontSize: '5rem' }}>{getHeroTypeIcon(hero.type)}</div>
            )}
          </div>

          {/* Información */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="nbv-badge nbv-badge-gold" style={{ width: 'fit-content' }}>
              {getHeroTypeIcon(hero.type)} {getHeroTypeName(hero.type)}
            </div>
            
            <h1 className="page-title" style={{ marginBottom: 0 }}>{hero.name}</h1>
            
            <p className="text-dim">{hero.description}</p>

            {/* ⭐ Calificaciones */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--gold-light)', letterSpacing: '2px' }}>
                  {'★'.repeat(Math.floor(Number(avgStars)))}{'☆'.repeat(5 - Math.floor(Number(avgStars)))}
                </div>
                <div>
                  <span className="text-gold" style={{ fontWeight: 'bold' }}>{avgStars}</span>
                  <span className="text-dim" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>
                    ({ratings.length} calificaciones de aventureros)
                  </span>
                </div>
              </div>

              <h4 style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '0.5rem', borderLeft: '2px solid var(--gold)', paddingLeft: '0.5rem' }}>
                ✨ Opiniones de la Comunidad ✨
              </h4>
              
              {ratings.length > 0 ? (
                ratings.slice(0, 5).map((rating) => (
                  <div key={rating.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)' }}>
                        {'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold-light)', fontWeight: 'bold' }}>{rating.userName}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--parchment-dim)', fontStyle: 'italic', margin: '0.3rem 0' }}>
                      "{rating.comment}"
                    </p>
                    <div style={{ fontSize: '0.6rem', color: 'var(--rune-gray)' }}>
                      📅 {new Date(rating.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--parchment-dim)', fontStyle: 'italic' }}>
                  ✨ Sé el primero en calificar a {hero.name} ✨
                </div>
              )}
            </div>

            {/* 📊 Estadísticas */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '0.5rem', 
              background: 'rgba(0,0,0,0.2)', 
              padding: '1rem', 
              borderRadius: '12px'
            }}>
              <div className="stat-card">
                <div className="stat-icon">❤️</div>
                <div className="stat-value">{getHeroHealth()}</div>
                <div className="stat-label">Vida</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚔️</div>
                <div className="stat-value">{getHeroAttack()}</div>
                <div className="stat-label">Ataque</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛡️</div>
                <div className="stat-value">{getHeroDefense()}</div>
                <div className="stat-label">Defensa</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💪</div>
                <div className="stat-value">{getHeroPower()}</div>
                <div className="stat-label">Poder</div>
              </div>
            </div>

            {/* 💰 Precio, Stock y Cantidad */}
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '1rem', 
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div className="nbv-coins">
                  <span className="nbv-coins-icon">💰</span>
                  <span>${getHeroPrice()} USD</span>
                </div>
                <div>
                  <span className="text-dim">📦 Stock:</span>
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    color: isOutOfStock ? 'var(--crimson-bright)' : 'var(--emerald-bright)',
                    fontWeight: 'bold'
                  }}>
                    {isOutOfStock ? 'AGOTADO' : `${hero.stock} unidades`}
                  </span>
                </div>
              </div>

              {/* Selector de cantidad */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span className="text-dim">Cantidad:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      className="nbv-btn nbv-btn-ghost" 
                      style={{ padding: '0.3rem 0.8rem', minWidth: '2rem' }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '3rem', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button 
                      className="nbv-btn nbv-btn-ghost" 
                      style={{ padding: '0.3rem 0.8rem', minWidth: '2rem' }}
                      onClick={() => setQuantity(Math.min(hero.stock || 1, quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Botón Añadir al carrito */}
              <button 
                className={`nbv-btn ${isOutOfStock ? 'nbv-btn-disabled' : 'nbv-btn-primary'}`}
                onClick={addToCart}
                disabled={isOutOfStock}
                style={{ width: '100%' }}
              >
                {isOutOfStock ? '❌ AGOTADO' : '🛒 AÑADIR AL CARRITO'}
              </button>

              {/* Mensaje de éxito */}
              {addedToCart && (
                <div style={{ 
                  marginTop: '0.8rem', 
                  padding: '0.5rem', 
                  background: 'rgba(26,140,69,0.2)', 
                  border: '1px solid var(--emerald)',
                  borderRadius: '8px', 
                  textAlign: 'center', 
                  color: 'var(--emerald-bright)',
                  animation: 'fadeOut 2s ease forwards'
                }}>
                  ✅ ¡{hero.name} añadido al carrito!
                </div>
              )}
            </div>

            {/* ⚡ Habilidades */}
            {abilities.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                <h3 style={{ color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>⚡ Habilidades Especiales</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {abilities.map((hab, idx) => (
                    <li key={idx} style={{ color: 'var(--parchment-dim)', padding: '0.3rem 0', paddingLeft: '1.5rem', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0 }}>✨</span> {hab}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; visibility: hidden; }
          }
          
          .stat-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
            background: rgba(0,0,0,0.3);
            padding: 0.8rem;
            border-radius: 8px;
            text-align: center;
          }
          
          .stat-icon {
            font-size: 1.3rem;
          }
          
          .stat-value {
            font-weight: bold;
            color: var(--gold-light);
            font-size: 1.2rem;
          }
          
          .stat-label {
            color: var(--parchment-dim);
            font-size: 0.7rem;
            letter-spacing: 1px;
          }
        `}
      </style>
    </div>
  );
}