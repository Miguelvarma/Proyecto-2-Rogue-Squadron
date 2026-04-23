/**
 * CheckoutModal.tsx
 * Full checkout flow: buyer info form → processing → result.
 * Renders as an overlay modal with full medieval styling.
 */

import React, { useState, useEffect } from 'react';
import type { ShopProduct, BuyerInfo } from '../../api/payments';
import type { PaymentState }           from '../../hooks/usePayment';

interface CheckoutModalProps {
  readonly product:       ShopProduct;
  readonly paymentState:  PaymentState;
  readonly onConfirm:     (buyerInfo: BuyerInfo, countryCode: string, promoCode?: string) => void;
  readonly onClose:       () => void;
}

const COUNTRIES = [
  { code: 'CO', label: 'Colombia' },
  { code: 'MX', label: 'México' },
  { code: 'AR', label: 'Argentina' },
  { code: 'CL', label: 'Chile' },
  { code: 'PE', label: 'Perú' },
  { code: 'US', label: 'Estados Unidos' },
];

const RARITY_GLOW: Record<string, string> = {
  COMMON:    'rgba(158,158,158,0.1)',
  RARE:      'rgba(26,127,170,0.15)',
  EPIC:      'rgba(123,53,208,0.2)',
  LEGENDARY: 'rgba(200,134,10,0.2)',
};

export function CheckoutModal({ product, paymentState, onConfirm, onClose }: CheckoutModalProps) {
  const [email,       setEmail]       = useState('');
  const [name,        setName]        = useState('');
  const [countryCode, setCountryCode] = useState('CO');
  const [promoCode,   setPromoCode]   = useState('');
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const { step, order, result, error } = paymentState;
  const isProcessing = step === 'CREATING_ORDER' || step === 'PROCESSING_PAYMENT';
  const isDone       = step === 'SUCCESS' || step === 'REDIRECTING' || step === 'ERROR';

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isProcessing) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isProcessing, onClose]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Email inválido';
    if (name.trim().length < 2) errs.name = 'Nombre muy corto';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onConfirm({ email: email.trim(), name: name.trim() }, countryCode, promoCode || undefined);
  }

  const price = (product.price_cents / 100).toLocaleString('es-CO', {
    style: 'currency', currency: product.currency, maximumFractionDigits: 0,
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,7,5,0.85)',
      backdropFilter: 'blur(4px)',
      padding: '1rem',
    }}>
      <div style={{
        background: `linear-gradient(145deg, var(--color-stone), var(--color-stone-dark))`,
        border:  `1px solid rgba(200,134,10,0.35)`,
        boxShadow: `0 0 60px rgba(0,0,0,0.9), 0 0 40px ${RARITY_GLOW[product.rarity]}`,
        maxWidth: '460px', width: '100%',
        position: 'relative',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.8rem 1.2rem',
          background: 'rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(200,134,10,0.2)',
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: '0.65rem',
            letterSpacing: '0.35em', color: 'var(--color-gold)', textTransform: 'uppercase',
          }}>
            ⚔ Adquisición de Ítem
          </span>
          {!isProcessing && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'var(--color-rune-gray)',
              cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.2rem 0.4rem',
            }}>✕</button>
          )}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Product summary */}
          <div style={{
            display: 'flex', gap: '1rem', alignItems: 'center',
            padding: '0.9rem', marginBottom: '1.2rem',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(200,134,10,0.15)',
          }}>
            <span style={{ fontSize: '2.2rem' }}>{product.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.85rem',
                color: 'var(--color-parchment)', letterSpacing: '0.05em',
              }}>{product.name}</div>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.7rem',
                color: 'var(--color-rune-gray)', fontStyle: 'italic', marginTop: '0.2rem',
              }}>{product.type}</div>
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
              color: 'var(--color-gold-bright)',
              textShadow: '0 0 10px rgba(232,160,32,0.4)',
            }}>{price}</div>
          </div>

          {/* ── FORM (only when IDLE) ── */}
          {step === 'IDLE' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre para la factura"
                  style={inputStyle(!!errors.name)}
                />
                {errors.name && <span style={errorStyle}>{errors.name}</span>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Correo electrónico</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  style={inputStyle(!!errors.email)}
                />
                {errors.email && <span style={errorStyle}>{errors.email}</span>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>País</label>
                <select
                  value={countryCode} onChange={e => setCountryCode(e.target.value)}
                  style={{ ...inputStyle(false), appearance: 'none' }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.4rem' }}>
                <label style={labelStyle}>Código promocional <span style={{ color: 'var(--color-rune-gray)', fontWeight: 'normal' }}>(opcional)</span></label>
                <input
                  value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="NEXUS2025"
                  style={inputStyle(false)}
                />
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(200,134,10,0.3),transparent)' }} />
                <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem' }}>⚜</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(200,134,10,0.3),transparent)' }} />
              </div>

              <button onClick={handleSubmit} style={primaryBtnStyle}>
                ⚔ Confirmar Compra — {price}
              </button>
              <button onClick={onClose} style={ghostBtnStyle}>
                Cancelar
              </button>
            </>
          )}

          {/* ── PROCESSING ── */}
          {isProcessing && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1.5s linear infinite' }}>⚜</div>
              <div style={{
                fontFamily: 'var(--font-heading)', color: 'var(--color-gold)',
                letterSpacing: '0.2em', fontSize: '0.8rem',
              }}>
                {step === 'CREATING_ORDER' ? 'Creando orden...' : 'Procesando pago...'}
              </div>
              <div style={{
                color: 'var(--color-parchment-dim)', fontSize: '0.8rem',
                fontStyle: 'italic', marginTop: '0.5rem',
              }}>
                Los dioses del tesoro están evaluando tu petición
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── REDIRECTING ── */}
          {step === 'REDIRECTING' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🏰</div>
              <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
                Redirigiendo al Portal de Pago
              </div>
              <div style={{ color: 'var(--color-parchment-dim)', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.4rem' }}>
                Serás transportado al Portal de MercadoPago...
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'SUCCESS' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>✦</div>
              <div style={{
                fontFamily: 'var(--font-heading)', color: 'var(--color-gold-light)',
                fontSize: '0.9rem', letterSpacing: '0.15em', marginBottom: '0.5rem',
              }}>
                ¡Ítem Adquirido!
              </div>
              <div style={{ color: 'var(--color-parchment-dim)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '1.2rem' }}>
                {product.name} ha sido añadido a tu inventario
              </div>
              {result?.transactionId && (
                <div style={{
                  padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(200,134,10,0.15)',
                  fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--color-rune-gray)',
                  marginBottom: '1.2rem', wordBreak: 'break-all',
                }}>
                  TX: {result.transactionId}
                </div>
              )}
              <button onClick={onClose} style={primaryBtnStyle}>Cerrar</button>
            </div>
          )}

          {/* ── ERROR ── */}
          {step === 'ERROR' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🗡</div>
              <div style={{
                fontFamily: 'var(--font-heading)', color: 'var(--color-crimson-bright)',
                fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '0.5rem',
              }}>
                Error al Procesar
              </div>
              <div style={{
                color: 'var(--color-parchment-dim)', fontSize: '0.8rem',
                fontStyle: 'italic', marginBottom: '1.2rem',
                padding: '0.6rem', background: 'rgba(168,16,32,0.1)',
                border: '1px solid rgba(168,16,32,0.3)',
              }}>
                {error}
              </div>
              <button onClick={onClose} style={primaryBtnStyle}>Intentar de Nuevo</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontFamily:    'var(--font-heading)',
  fontSize:      '0.7rem',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color:         'var(--color-gold)',
  marginBottom:  '0.4rem',
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width:      '100%',
  padding:    '0.65rem 0.9rem',
  background: 'rgba(0,0,0,0.4)',
  border:     `1px solid ${hasError ? 'var(--color-crimson)' : 'rgba(200,134,10,0.25)'}`,
  color:      'var(--color-parchment)',
  fontFamily: 'var(--font-body)',
  fontSize:   '1rem',
  outline:    'none',
  boxShadow:  hasError ? '0 0 0 2px rgba(168,16,32,0.15)' : 'none',
});

const errorStyle: React.CSSProperties = {
  display:    'block',
  fontSize:   '0.72rem',
  color:      'var(--color-crimson-bright)',
  fontStyle:  'italic',
  marginTop:  '0.25rem',
};

const primaryBtnStyle: React.CSSProperties = {
  display:       'flex',
  alignItems:    'center',
  justifyContent: 'center',
  width:         '100%',
  padding:       '0.75rem 1.5rem',
  marginBottom:  '0.6rem',
  background:    'linear-gradient(135deg, var(--color-gold-dark), var(--color-gold-bright))',
  color:         'var(--color-abyss)',
  border:        'none',
  fontFamily:    'var(--font-heading)',
  fontSize:      '0.75rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  cursor:        'pointer',
  clipPath:      'polygon(10px 0%,calc(100% - 10px) 0%,100% 50%,calc(100% - 10px) 100%,10px 100%,0% 50%)',
  boxShadow:     '0 0 20px rgba(200,134,10,0.3)',
};

const ghostBtnStyle: React.CSSProperties = {
  display:       'flex',
  alignItems:    'center',
  justifyContent: 'center',
  width:         '100%',
  padding:       '0.65rem',
  background:    'transparent',
  color:         'var(--color-parchment-dim)',
  border:        '1px solid rgba(200,134,10,0.2)',
  fontFamily:    'var(--font-heading)',
  fontSize:      '0.7rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  cursor:        'pointer',
};
