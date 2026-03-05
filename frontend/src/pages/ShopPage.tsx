/**
 * ShopPage.tsx — The Nexus Battles shop / premium store
 * Full medieval D&D aesthetic. Integrates ProductCard, CheckoutModal,
 * and the usePayment hook for the complete checkout flow.
 */

import React, { useState, useEffect } from 'react';
import { usePayment }        from '../hooks/usePayment';
import { paymentsApi }       from '../api/payments';
import { ProductCard }       from '../components/payments/ProductCard';
import { CheckoutModal }     from '../components/payments/CheckoutModal';
import { OrderStatusBadge }  from '../components/payments/OrderStatusBadge';
import type { ShopProduct, BuyerInfo } from '../api/payments';

// ── Mock products for development (replace with API call when products endpoint is ready) ──
const MOCK_PRODUCTS: ShopProduct[] = [
  {
    product_id: '11111111-1111-1111-1111-111111111111',
    name: 'Espada del Abismo',
    description: 'Forjada en las entrañas del volcán eterno. +50 ATK, +20% crítico.',
    price_cents: 4999,
    currency: 'USD',
    rarity: 'LEGENDARY',
    type: 'WEAPON',
    emoji: '⚔️',
    available_stock: 3,
    is_active: true,
  },
  {
    product_id: '22222222-2222-2222-2222-222222222222',
    name: 'Manto Arcano',
    description: 'Tejido con hilos de magia pura. +35 MAG, resistencia hechizos.',
    price_cents: 2999,
    currency: 'USD',
    rarity: 'EPIC',
    type: 'ARMOR',
    emoji: '🌌',
    available_stock: 7,
    is_active: true,
  },
  {
    product_id: '33333333-3333-3333-3333-333333333333',
    name: 'Escudo de Escarcha',
    description: 'Talla dracónica en hielo antiguo. +40 DEF, inmunidad a frío.',
    price_cents: 1999,
    currency: 'USD',
    rarity: 'RARE',
    type: 'ARMOR',
    emoji: '🛡️',
    available_stock: 12,
    is_active: true,
  },
  {
    product_id: '44444444-4444-4444-4444-444444444444',
    name: 'Poción de Vigor',
    description: 'Restaura 500 HP al instante. Sabor a manzana encantada.',
    price_cents: 299,
    currency: 'USD',
    rarity: 'COMMON',
    type: 'POTION',
    emoji: '🧪',
    available_stock: 50,
    is_active: true,
  },
  {
    product_id: '55555555-5555-5555-5555-555555555555',
    name: 'Amuleto del Dragón',
    description: 'La gema carmesí palpita con vida. +30 a todos los stats.',
    price_cents: 3499,
    currency: 'USD',
    rarity: 'EPIC',
    type: 'ARTIFACT',
    emoji: '🐉',
    available_stock: 5,
    is_active: true,
  },
  {
    product_id: '66666666-6666-6666-6666-666666666666',
    name: 'Tomo de Hechizos',
    description: 'Contiene 12 encantamientos de nivel máximo. Uso ilimitado.',
    price_cents: 1499,
    currency: 'USD',
    rarity: 'RARE',
    type: 'SPELL',
    emoji: '📜',
    available_stock: 0, // Out of stock demo
    is_active: true,
  },
];

type FilterType = 'ALL' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';

export default function ShopPage() {
  const [products,       setProducts]       = useState<ShopProduct[]>(MOCK_PRODUCTS);
  const [filter,         setFilter]         = useState<FilterType>('ALL');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);

  const { state: paymentState, startCheckout, reset } = usePayment();

  // Try to load real products from the API; fall back to mock
  useEffect(() => {
    setLoadingProducts(true);
    paymentsApi.getShopProducts()
      .then(res => { if (res.data?.data?.length) setProducts(res.data.data); })
      .catch(() => {/* use mock */})
      .finally(() => setLoadingProducts(false));
  }, []);

  const filtered = filter === 'ALL'
    ? products
    : products.filter(p => p.rarity === filter);

  function handleSelectProduct(p: ShopProduct) {
    reset();
    setSelectedProduct(p);
  }

  async function handleConfirm(buyerInfo: BuyerInfo, countryCode: string, promoCode?: string) {
    if (!selectedProduct) return;
    await startCheckout(selectedProduct, buyerInfo, countryCode, promoCode, 'mock');
  }

  function handleCloseModal() {
    if (paymentState.step === 'CREATING_ORDER' || paymentState.step === 'PROCESSING_PAYMENT') return;
    setSelectedProduct(null);
    reset();
  }

  const FILTERS: { key: FilterType; label: string; color?: string }[] = [
    { key: 'ALL',       label: 'Todos' },
    { key: 'LEGENDARY', label: 'Legendario', color: '#F5C842' },
    { key: 'EPIC',      label: 'Épico',      color: '#B06EFF' },
    { key: 'RARE',      label: 'Raro',       color: '#30B8E8' },
    { key: 'COMMON',    label: 'Común',      color: '#9E9E9E' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-abyss)',
      color: 'var(--color-parchment)',
      fontFamily: 'var(--font-body)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Floating rune background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {['⚔', '🐉', '✦', '⚜', '🗡', '🛡'].map((rune, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-gold)',
            opacity: 0.04,
            fontSize: `${2 + (i % 3)}rem`,
            left: `${10 + i * 16}%`,
            top: `${10 + (i * 17) % 80}%`,
            animation: `float-rune ${20 + i * 3}s infinite linear`,
            animationDelay: `-${i * 4}s`,
          }}>{rune}</span>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1300px', margin: '0 auto', padding: '0 2rem 4rem' }}>

        {/* ── Header ── */}
        <div style={{
          textAlign: 'center',
          padding: '4rem 0 2.5rem',
          borderBottom: '1px solid rgba(200,134,10,0.2)',
          marginBottom: '2rem',
          position: 'relative',
        }}>
          {/* Torch left */}
          <div style={{ position: 'absolute', left: '5%', top: '50%', transform: 'translateY(-50%)' }}>
            <TorchDecor />
          </div>
          {/* Torch right */}
          <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)' }}>
            <TorchDecor />
          </div>

          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.8rem',
            letterSpacing: '0.5em', color: 'var(--color-gold)',
            textTransform: 'uppercase', marginBottom: '0.8rem', opacity: 0.8,
          }}>
            ✦ El Emporio del Nexus ✦
          </div>

          <h1 style={{
            fontFamily:  'var(--font-title)',
            fontSize:    'clamp(2rem, 5vw, 3.5rem)',
            fontWeight:  900,
            lineHeight:  1.05,
            background:  'linear-gradient(180deg, var(--color-gold-light) 0%, var(--color-gold) 40%, var(--color-gold-dark) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
            filter:      'drop-shadow(0 0 25px rgba(200,134,10,0.5))',
            marginBottom: '0.4rem',
          }}>
            Armería Legendaria
          </h1>

          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
            color: 'var(--color-parchment-dim)', letterSpacing: '0.1em',
            fontStyle: 'italic',
          }}>
            Armas, reliquias y artefactos para el guerrero que se atreve a dominar el Nexus
          </p>
        </div>

        {/* ── Filter row ── */}
        <div style={{
          display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '2.5rem',
        }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                fontFamily:    'var(--font-heading)',
                fontSize:      '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding:       '0.35rem 0.9rem',
                border:        filter === f.key
                  ? `1px solid ${f.color ?? 'var(--color-gold)'}`
                  : '1px solid rgba(200,134,10,0.2)',
                color:         filter === f.key
                  ? (f.color ?? 'var(--color-gold)')
                  : 'var(--color-parchment-dim)',
                background:    filter === f.key
                  ? `rgba(${f.color ? hexToRgb(f.color) : '200,134,10'},0.1)`
                  : 'transparent',
                cursor:        'pointer',
                transition:    'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Product grid ── */}
        {loadingProducts ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', letterSpacing: '0.3em' }}>
            ⚜ Cargando el armario del herrero...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-parchment-dim)', fontStyle: 'italic' }}>
            No hay ítems en esta categoría por ahora
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.2rem',
          }}>
            {filtered.map(p => (
              <ProductCard
                key={p.product_id}
                product={p}
                onSelect={handleSelectProduct}
                disabled={!!selectedProduct && selectedProduct.product_id !== p.product_id}
              />
            ))}
          </div>
        )}

        {/* ── Recent orders section (placeholder) ── */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(200,134,10,0.3),transparent)' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.4em', color: 'var(--color-gold)', textTransform: 'uppercase', opacity: 0.8 }}>
              Historial de Órdenes
            </span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(200,134,10,0.3),transparent)' }} />
          </div>
          <div style={{
            padding: '1.5rem', background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(200,134,10,0.1)',
            textAlign: 'center', color: 'var(--color-rune-gray)',
            fontStyle: 'italic', fontSize: '0.9rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <OrderStatusBadge status="PAID" size="sm" />
              <OrderStatusBadge status="PENDING" size="sm" />
              <OrderStatusBadge status="REFUNDED" size="sm" />
            </span>
            <div style={{ marginTop: '0.8rem' }}>
              Las órdenes completadas aparecerán aquí
            </div>
          </div>
        </div>
      </div>

      {/* ── Checkout Modal ── */}
      {selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          paymentState={paymentState}
          onConfirm={handleConfirm}
          onClose={handleCloseModal}
        />
      )}

      <style>{`
        @keyframes float-rune {
          0%   { transform: translateY(0)    rotate(0deg);  opacity: 0.04; }
          50%  { opacity: 0.07; }
          100% { transform: translateY(-30px) rotate(5deg); opacity: 0.04; }
        }
      `}</style>
    </div>
  );
}

// ── Torch decoration ──────────────────────────────────────────────────────────

function TorchDecor() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <div style={{
        width: '16px', height: '32px',
        background: 'radial-gradient(ellipse at 50% 80%, #F5C842 0%, #C8860A 40%, #A81020 70%, transparent 100%)',
        borderRadius: '50% 50% 30% 30%',
        animation: 'flicker 0.15s infinite alternate',
        filter: 'blur(1px)',
        boxShadow: '0 0 20px 8px rgba(200,134,10,0.45)',
      }}/>
      <div style={{ width:'5px', height:'32px', background:'linear-gradient(180deg,#4A2800,#2A1500)', borderRadius:'1px' }}/>
      <div style={{ width:'10px', height:'4px', background:'#3A2010', borderRadius:'1px' }}/>
      <style>{`
        @keyframes flicker {
          0%   { transform: scaleX(1)    scaleY(1)   rotate(-1deg); }
          100% { transform: scaleX(0.85) scaleY(1.1) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}

// ── Util ──────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
