// src/pages/HomePage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

interface Hero {
  id: number;
  name: string;
  description: string;
  price: number;
  stars: number;
  type: string;
  image?: string;
}

export default function HomePage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/heroes')
      .then(res => res.json())
      .then(data => {
        if (data.heroes) setHeroes(data.heroes.slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Cargando el Nexus...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* HERO SECTION - Impactante */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">✦ COLECCIÓN 2026 ✦</div>
          <h1 className="hero-title">
            CONVIÉRTETE EN<br />
            <span className="hero-highlight">UNA LEYENDA</span>
          </h1>
          <p className="hero-description">
            Colecciona héroes únicos, enfréntate en batallas épicas<br />
            y forja tu destino en el Nexus.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              ✦ COMENZAR AHORA ✦
            </Link>
            <Link to="/login" className="btn btn-secondary">
              🗡️ YA TENGO CUENTA 🗡️
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Jugadores Activos</span>
            </div>
            <div className="stat">
              <span className="stat-number">150+</span>
              <span className="stat-label">Héroes Únicos</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Batallas</span>
            </div>
          </div>
        </div>
      </section>

      {/* OFERTA ESPECIAL - Urgencia */}
      <section className="offer-section">
        <div className="offer-badge">⚡ OFERTA LIMITADA ⚡</div>
        <h2>¡30% DE DESCUENTO!</h2>
        <p>En tu primera compra de cualquier héroe legendario</p>
        <div className="offer-timer">
          <div className="timer-block"><span>02</span><label>Días</label></div>
          <div className="timer-block"><span>12</span><label>Horas</label></div>
          <div className="timer-block"><span>45</span><label>Min</label></div>
          <div className="timer-block"><span>30</span><label>Seg</label></div>
        </div>
      </section>

      {/* HÉROES DESTACADOS - Productos */}
      <section className="heroes-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">✦ COLECCIÓN ESTELAR ✦</span>
            <h2 className="section-title">HÉROES DESTACADOS</h2>
            <p className="section-subtitle">
              Los más poderosos del momento. Elige a tu campeón y domina el Nexus.
            </p>
          </div>

          <div className="heroes-grid">
            {heroes.map((hero) => (
              <div key={hero.id} className="hero-card">
                <div className="card-badge">✦ DESTACADO ✦</div>
                <div className="card-image">
                  {hero.image ? (
                    <img src={hero.image} alt={hero.name} />
                  ) : (
                    <div className="card-icon">⚔️</div>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{hero.name}</h3>
                  <p className="card-description">{hero.description?.substring(0, 70)}...</p>
                  <div className="card-stars">
                    {'★'.repeat(hero.stars)}{'☆'.repeat(5 - hero.stars)}
                  </div>
                  <div className="card-type">
                    <span className={`type-tag ${hero.type.toLowerCase()}`}>{hero.type}</span>
                  </div>
                  <div className="card-footer">
                    <div className="card-price">
                      <span className="price-old">{(hero.price * 1.3).toFixed(0)}🪙</span>
                      <span className="price-new">{hero.price}🪙</span>
                    </div>
                    <button className="btn-buy">COMPRAR</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-footer">
            <Link to="/shop" className="btn btn-outline">
              VER TODOS LOS HÉROES →
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS - Por qué comprar */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="benefits-title">¿POR QUÉ ELEGIR NEXUS BATTLES?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Envío Instantáneo</h3>
              <p>Recibe tus héroes al instante en tu inventario digital</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <h3>Pago 100% Seguro</h3>
              <p>Transacciones protegidas con encriptación avanzada</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎮</div>
              <h3>Battle Ready</h3>
              <p>Usa tus héroes inmediatamente en batallas PvP</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔄</div>
              <h3>Intercambio Seguro</h3>
              <p>Marketplace oficial para intercambiar con otros</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Confianza */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="testimonials-title">✦ LO QUE DICEN LOS GUERREROS ✦</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>"Los mejores héroes que he coleccionado. Gráficos increíbles y jugabilidad épica."</p>
              <div className="testimonial-author">— DragónSlayer99</div>
              <div className="testimonial-stars">★★★★★</div>
            </div>
            <div className="testimonial-card">
              <p>"Las batallas son intensas y la comunidad es genial. ¡100% recomendado!"</p>
              <div className="testimonial-author">— MageLord</div>
              <div className="testimonial-stars">★★★★★</div>
            </div>
            <div className="testimonial-card">
              <p>"El mejor juego de cartas de héroes. Las ofertas son increíbles."</p>
              <div className="testimonial-author">— ShadowWarrior</div>
              <div className="testimonial-stars">★★★★★</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL - Conversión */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿LISTO PARA LA BATALLA?</h2>
          <p>Únete a miles de aventureros y comienza tu leyenda hoy mismo</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              ✦ REGISTRARSE GRATIS ✦
            </Link>
            <Link to="/shop" className="btn btn-secondary btn-large">
              🛒 EXPLORAR TIENDA
            </Link>
          </div>
          <p className="cta-note">✓ Sin compromiso ✓ Cancela cuando quieras</p>
        </div>
      </section>
    </div>
  );
}