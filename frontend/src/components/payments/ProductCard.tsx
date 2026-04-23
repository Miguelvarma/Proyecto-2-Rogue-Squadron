/**
 * ProductCard.tsx
 * Displays a purchasable item in the Nexus Battles shop.
 * Aesthetic: medieval dungeon / D&D — matches mockup palette exactly.
 */

import React from 'react';
import type { ShopProduct } from '../../api/payments';

interface ProductCardProps {
  readonly product:   ShopProduct;
  readonly onSelect:  (product: ShopProduct) => void;
  readonly disabled?: boolean;
}

const RARITY_CONFIG = {
  COMMON:    { label: 'Común',     color: '#9E9E9E', bg: 'rgba(30,30,30,0.3)',      glow: 'rgba(158,158,158,0.15)', border: 'rgba(100,100,100,0.2)' },
  RARE:      { label: 'Raro',      color: '#30B8E8', bg: 'rgba(10,64,96,0.2)',       glow: 'rgba(26,127,170,0.2)',   border: 'rgba(26,127,170,0.3)' },
  EPIC:      { label: 'Épico',     color: '#B06EFF', bg: 'rgba(74,21,128,0.2)',      glow: 'rgba(123,53,208,0.2)',   border: 'rgba(123,53,208,0.3)' },
  LEGENDARY: { label: 'Legendario',color: '#F5C842', bg: 'rgba(200,134,10,0.2)',     glow: 'rgba(200,134,10,0.2)',   border: 'rgba(200,134,10,0.4)' },
} as const;

export function ProductCard({ product, onSelect, disabled }: ProductCardProps) {
  const cfg    = RARITY_CONFIG[product.rarity];
  const price  = (product.price_cents / 100).toLocaleString('es-CO', {
    style: 'currency', currency: product.currency, maximumFractionDigits: 0,
  });
  const outOfStock = product.available_stock === 0;
  const isDisabled = disabled || outOfStock;

  return (
    <button
      style={{
        background: `linear-gradient(145deg, var(--color-stone), var(--color-stone-dark))`,
        border:     `1px solid ${cfg.border}`,
        boxShadow:  `0 0 20px ${cfg.glow}`,
        overflow:   'hidden',
        position:   'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor:     isDisabled ? 'not-allowed' : 'pointer',
        opacity:    isDisabled ? 0.6 : 1,
        display:    'block',
        width:      '100%',
      }}
      className="product-card"
      onClick={() => !isDisabled && onSelect(product)}
      disabled={isDisabled}
    >
      {/* Corner decoration */}
      <span style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', color: 'var(--color-gold-dark)', fontSize: '0.7rem', opacity: 0.5 }}>✦</span>
      <span style={{ position: 'absolute', bottom: '0.6rem', right: '0.6rem', color: 'var(--color-gold-dark)', fontSize: '0.7rem', opacity: 0.5 }}>✦</span>

      {/* Item image area */}
      <div style={{
        height:     '110px',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize:   '3rem',
        background: cfg.bg,
        position:   'relative',
      }}>
        {product.emoji}

        {/* Rarity badge */}
        <span style={{
          position:   'absolute',
          top:        '6px',
          right:      '6px',
          fontFamily: 'var(--font-heading)',
          fontSize:   '0.55rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding:    '0.15rem 0.4rem',
          color:      cfg.color,
          background: cfg.bg,
          border:     `1px solid ${cfg.border}`,
        }}>
          {cfg.label}
        </span>

        {outOfStock && (
          <div style={{
            position:   'absolute',
            inset:      0,
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10,7,5,0.7)',
            fontFamily: 'var(--font-heading)',
            fontSize:   '0.65rem',
            letterSpacing: '0.3em',
            color:      'var(--color-rune-gray)',
          }}>
            AGOTADO
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '0.9rem' }}>
        <div style={{
          fontFamily:    'var(--font-heading)',
          fontSize:      '0.82rem',
          color:         'var(--color-parchment)',
          letterSpacing: '0.05em',
          marginBottom:  '0.3rem',
        }}>
          {product.name}
        </div>

        <div style={{
          fontSize:   '0.75rem',
          color:      'var(--color-parchment-dim)',
          fontStyle:  'italic',
          marginBottom: '0.7rem',
          lineHeight:  '1.4',
          minHeight:  '2.8em',
        }}>
          {product.description}
        </div>

        {/* Divider */}
        <div style={{
          height:     '1px',
          background: `linear-gradient(90deg, transparent, ${cfg.border}, transparent)`,
          marginBottom: '0.7rem',
        }} />

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--color-rune-gray)', fontStyle: 'italic' }}>
              Precio
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize:   '1rem',
              color:      'var(--color-gold-bright)',
              textShadow: `0 0 10px rgba(232,160,32,0.4)`,
            }}>
              {price}
            </div>
          </div>

          <button
            disabled={isDisabled}
            style={{
              background:    isDisabled
                ? 'var(--color-stone-light)'
                : `linear-gradient(135deg, var(--color-gold-dark), var(--color-gold-bright))`,
              color:         isDisabled ? 'var(--color-ash)' : 'var(--color-abyss)',
              border:        'none',
              padding:       '0.45rem 0.9rem',
              fontFamily:    'var(--font-heading)',
              fontSize:      '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor:        isDisabled ? 'not-allowed' : 'pointer',
              clipPath:      'polygon(8px 0%,calc(100% - 8px) 0%,100% 50%,calc(100% - 8px) 100%,8px 100%,0% 50%)',
              boxShadow:     isDisabled ? 'none' : '0 0 12px rgba(200,134,10,0.3)',
              transition:    'box-shadow 0.2s',
            }}
          >
            Adquirir
          </button>
        </div>
      </div>

      <style>{`
        .product-card:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 25px ${cfg.glow} !important;
        }
        .product-card:focus-visible {
          outline: 2px solid ${cfg.color};
          outline-offset: 2px;
        }
      `}</style>
    </button>
  );
}
