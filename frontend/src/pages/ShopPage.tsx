// src/pages/ShopPage.tsx (versión corregida)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePayment } from '../hooks/usePayment';
import { paymentsApi } from '../api/payments';
import { ProductCard } from '../components/payments/ProductCard';
import { CheckoutModal } from '../components/payments/CheckoutModal';
import { OrderStatusBadge } from '../components/payments/OrderStatusBadge';
import type { ShopProduct, BuyerInfo } from '../api/payments';
import { useAuthStore } from '@/store/authStore';
import "../styles/shop.css";

interface Hero {
  id: number;
  name: string;
  description: string;
  price: number;
  stars: number;
  type: string;
  image?: string;
  stock?: number;
  poder?: number;
  vida?: number;
  defensa?: number;
  ataque?: string;
  damage?: string;
  efecto?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  rarity: string;
  category: string;
  emoji: string;
  image?: string;
  poder?: number;
  ataque?: string;
  damage?: string;
  vida?: number;
  defensa?: number;
  efecto?: string;
  descuento?: number;
}

type FilterType = 'ALL' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON' | 'HEROES' | 'WEAPONS' | 'ARMOR';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<any>(null);
  const { user } = useAuthStore();
  const { state: paymentState, startCheckout, reset } = usePayment();

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const addToInventoryBackend = async (product: any, type: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showNotification('❌ Debes iniciar sesión', 'error');
        return false;
      }

      const body = {
        productId: product.product_id || product.id?.toString(),
        name: product.name,
        rarity: product.rarity || 'COMMON',
        metadata: {
          type: product.type || product.category,
          price: product.price_cents ? product.price_cents / 100 : product.price,
          description: product.description || 'Sin descripción'
        }
      };

      const response = await fetch('http://localhost:3000/api/v1/inventory/purchase/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return response.ok;
    } catch (error) {
      showNotification('❌ Error de conexión', 'error');
      return false;
    }
  };

  // ✅ Cargar productos desde el backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/products');
      const data = await response.json();
      console.log('📦 Productos recibidos:', data);
      
      if (data.success && data.products) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.warn('Formato de productos no reconocido:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

 // ShopPage.tsx - Modifica fetchHeroes
const fetchHeroes = async () => {
  try {
    console.log('🟢 Llamando a /api/v1/heroes...');
    const response = await fetch('http://localhost:3000/api/v1/heroes');
    console.log('🟢 Respuesta recibida, status:', response.status);
    
    const data = await response.json();
    console.log('📦 Datos de héroes:', data);
    
    if (data.success && data.heroes) {
      console.log(`✅ ${data.heroes.length} héroes cargados`);
      const heroesWithStock = data.heroes.map((hero: Hero) => ({
        ...hero,
        stock: hero.stock || Math.floor(Math.random() * 10) + 1
      }));
      setHeroes(heroesWithStock);
    } else {
      console.warn('⚠️ No se recibieron héroes:', data);
    }
  } catch (error) {
    console.error('❌ Error fetching heroes:', error);
  }
};

  useEffect(() => {
    Promise.all([fetchProducts(), fetchHeroes()]).finally(() => setLoading(false));
  }, []);

  const handleBuyNow = (item: any, type: 'hero' | 'product') => {
    let shopProduct: ShopProduct;
    
    if (type === 'hero') {
      shopProduct = {
        product_id: item.id.toString(),
        name: item.name,
        description: item.description,
        price_cents: Math.round(item.price * 100),
        currency: 'USD',
        rarity: item.stars >= 4 ? 'EPIC' : 'COMMON',
        type: item.type,
        emoji: '⚔️',
        available_stock: item.stock || 1,
        is_active: true,
        image: item.image
      };
    } else {
      shopProduct = {
        product_id: item.id.toString(),
        name: item.name,
        description: item.description,
        price_cents: Math.round(item.price * 100),
        currency: 'USD',
        rarity: item.rarity || 'COMMON',
        type: item.category,
        emoji: item.emoji || '📦',
        available_stock: item.stock,
        is_active: true,
        image: item.image
      };
    }
    
    if (shopProduct.available_stock === 0) {
      showNotification('❌ Producto agotado', 'error');
      return;
    }
    
    reset();
    setSelectedProduct(shopProduct);
  };
  
  async function handleConfirm(buyerInfo: BuyerInfo, countryCode: string, promoCode?: string) {
    if (!selectedProduct) return;
    
    try {
      await startCheckout(selectedProduct, buyerInfo, countryCode, promoCode, 'mock');
      const saved = await addToInventoryBackend(selectedProduct, 'product');
      
      if (saved) {
        setLastPurchase({
          name: selectedProduct.name,
          price: selectedProduct.price_cents / 100,
          orderId: `TXN-${Date.now()}`,
          type: 'product'
        });
        setShowSuccessModal(true);
        showNotification(`✅ ${selectedProduct.name} añadido a tu inventario`, 'success');
      }
      
      setSelectedProduct(null);
      reset();
    } catch (error: any) {
      showNotification(`❌ Error: ${error.message || 'No se pudo procesar el pago'}`, 'error');
    }
  }

  function handleCloseModal() {
    if (paymentState.step === 'CREATING_ORDER' || paymentState.step === 'PROCESSING_PAYMENT') return;
    setSelectedProduct(null);
    reset();
  }

  // ✅ Filtrar items según categoría seleccionada
  const getFilteredItems = () => {
    let filteredProducts = [...products];
    let filteredHeroes = [...heroes];

    if (filter === 'HEROES') {
      filteredHeroes = heroes;
      filteredProducts = [];
    } else if (filter === 'WEAPONS') {
      filteredProducts = products.filter(p => p.category === 'weapon');
    } else if (filter === 'ARMOR') {
      filteredProducts = products.filter(p => p.category === 'armor');
    } else if (filter !== 'ALL' && filter !== 'HEROES') {
      filteredProducts = products.filter(p => p.rarity === filter);
    }

    return { products: filteredProducts, heroes: filteredHeroes };
  };

  const { products: filteredProducts, heroes: filteredHeroes } = getFilteredItems();

  const FILTERS: { key: FilterType; label: string; color?: string }[] = [
    { key: 'ALL', label: 'Todos' },
    { key: 'HEROES', label: '⚔️ Héroes', color: '#F5C842' },
    { key: 'WEAPONS', label: '🗡️ Armas', color: '#30B8E8' },
    { key: 'ARMOR', label: '🛡️ Armaduras', color: '#B06EFF' },
    { key: 'LEGENDARY', label: 'Legendario', color: '#F5C842' },
    { key: 'EPIC', label: 'Épico', color: '#B06EFF' },
    { key: 'RARE', label: 'Raro', color: '#30B8E8' },
    { key: 'COMMON', label: 'Común', color: '#9E9E9E' },
  ];

  if (loading) {
    return (
      <div className="shop-loading">
        <div className="loading-spinner">⚔️</div>
        <p>Cargando el mercado...</p>
      </div>
    );
  }

  return (
    <div className="shop-container">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {showSuccessModal && lastPurchase && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✨</div>
            <h2>¡Ítem Adquirido!</h2>
            <p className="success-product">{lastPurchase.name}</p>
            <p className="success-message">ha sido añadido a tu inventario</p>
            <div className="success-order">TX: {lastPurchase.orderId}</div>
            <button onClick={() => setShowSuccessModal(false)} className="success-btn">
              IR AL INVENTARIO
            </button>
          </div>
        </div>
      )}

      <div className="shop-content">
        <div className="shop-header">
          <div className="torch-left"><div className="torch"></div></div>
          <div className="torch-right"><div className="torch"></div></div>
          <div className="shop-badge">✦ El Emporio del Nexus ✦</div>
          <h1 className="shop-title">Armería Legendaria</h1>
          <p className="shop-subtitle">Armas, reliquias, artefactos y héroes para dominar el Nexus</p>
        </div>

        <div className="filter-row">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`filter-btn ${filter === f.key ? 'active' : ''}`}
              style={filter === f.key ? { borderColor: f.color, color: f.color } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ✅ Productos (Armas, Armaduras, etc.) */}
        {filteredProducts.length > 0 && (
          <div className="products-section">
            <div className="section-divider">
              <span>🏆 ARTEFACTOS PODEROSOS 🏆</span>
            </div>
            <p className="section-subtitle">Armas, armaduras y objetos mágicos para tu aventura</p>
            
            <div className="products-grid">
              {filteredProducts.map(product => {
                const rarityClass = product.rarity?.toLowerCase() || 'common';
                return (
                 <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
                    <div className="product-card">
                      <div className="card-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="card-icon">{product.emoji || '📦'}</div>
                        )}
                        {product.stock < 5 && (
                          <div className="stock-badge low-stock">¡Últimas!</div>
                        )}
                      </div>
                      <div className="card-info">
                        <h3>{product.name}</h3>
                        <p>{product.description?.substring(0, 80)}...</p>
                        <div className="product-meta">
                          <span className={`rarity-badge ${rarityClass}`}>{product.rarity || 'COMÚN'}</span>
                          <span className="type-badge">{product.category === 'weapon' ? 'Arma' : product.category === 'armor' ? 'Armadura' : product.category || 'Item'}</span>
                        </div>
                        <div className="card-footer">
                          <div className="price">
                            <span className="price-value">${product.price} USD</span>
                            <span className="stock">Stock: {product.stock}</span>
                          </div>
                          <button 
                            className="buy-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleBuyNow(product, 'product');
                            }}
                            disabled={product.stock === 0}
                          >
                            {product.stock > 0 ? 'COMPRAR' : 'AGOTADO'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ✅ Héroes */}
        {filteredHeroes.length > 0 && (
          <div className="heroes-section">
            <div className="section-divider">
              <span>⚔️ HÉROES LEGENDARIOS ⚔️</span>
            </div>
            <p className="section-subtitle">Colecciona los guerreros más poderosos del Nexus</p>
            
            <div className="heroes-grid">
              {filteredHeroes.map(hero => (
                <Link to={`/hero/${hero.id}`} key={hero.id} style={{ textDecoration: 'none' }}>
                  <div className="hero-card">
                    <div className="card-image">
                      {hero.image ? (
                        <img src={hero.image} alt={hero.name} />
                      ) : (
                        <div className="card-icon">⚔️</div>
                      )}
                      {hero.stock && hero.stock < 5 && (
                        <div className="stock-badge low-stock">¡Últimas!</div>
                      )}
                      <div className="hero-type-badge">{hero.type}</div>
                    </div>
                    <div className="card-info">
                      <h3>{hero.name}</h3>
                      <p>{hero.description?.substring(0, 80)}...</p>
                      <div className="hero-stars">
                        {'★'.repeat(hero.stars)}{'☆'.repeat(5 - hero.stars)}
                      </div>
                      <div className="card-footer">
                        <div className="price">
                          <span className="price-value">${hero.price} USD</span>
                          <span className="stock">Stock: {hero.stock}</span>
                        </div>
                        <button 
                          className="buy-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleBuyNow(hero, 'hero');
                          }}
                          disabled={hero.stock === 0}
                        >
                          {hero.stock > 0 ? 'COMPRAR' : 'AGOTADO'}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && filteredHeroes.length === 0 && (
          <div className="empty-state">
            <p>No hay ítems en esta categoría por ahora</p>
          </div>
        )}

        <div className="orders-section">
          <div className="section-divider">
            <span>Historial de Órdenes</span>
          </div>
          <div className="orders-placeholder">
            <span>
              <OrderStatusBadge status="PAID" size="sm" />
              <OrderStatusBadge status="PENDING" size="sm" />
              <OrderStatusBadge status="REFUNDED" size="sm" />
            </span>
            <div>Las órdenes completadas aparecerán aquí</div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          paymentState={paymentState}
          onConfirm={handleConfirm}
          onClose={handleCloseModal}
        />
      )}

      <style>{`
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 2000;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        .notification.success {
          background: linear-gradient(135deg, #1A8C45, #0D5A28);
          color: white;
        }
        
        .notification.error {
          background: linear-gradient(135deg, #A81020, #7A0010);
          color: #FF8A8A;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .success-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(4px);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .success-modal {
          background: linear-gradient(145deg, #1C1510, #120E0A);
          border: 1px solid rgba(200,134,10,0.3);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          max-width: 400px;
          width: 90%;
          animation: fadeInUp 0.3s ease;
        }
        
        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .success-modal h2 {
          color: #F5C842;
          font-family: 'Cinzel', serif;
          margin-bottom: 1rem;
        }
        
        .success-product {
          font-size: 1.2rem;
          color: #C8860A;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .success-message {
          color: #B89A6A;
          margin-bottom: 1rem;
        }
        
        .success-order {
          font-size: 0.7rem;
          color: #7A6A58;
          font-family: monospace;
          margin-bottom: 1.5rem;
        }
        
        .success-btn {
          background: linear-gradient(135deg, #C8860A, #8B5E00);
          border: none;
          padding: 0.7rem 1.5rem;
          border-radius: 30px;
          color: #0A0705;
          font-family: 'Cinzel', serif;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .success-btn:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #E8A020, #C8860A);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}