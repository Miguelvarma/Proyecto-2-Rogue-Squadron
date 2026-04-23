// ══════════════════════════════════════════════════════════════
//  PRESENTATION — TokenGatewayModule
//  Modal de compra de tokens del .tsx, usando PaymentAdapter.
// ══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { TOKEN_PACKAGES, CardDomainService } from '../../domain/entities/TokenPackage';
import type { TokenPackage, CardData } from '../../domain/entities/TokenPackage';
import { PaymentAdapter } from '../../infrastructure/adapters/PaymentAdapter';

const paymentAdapter = new PaymentAdapter();

function rarityColor(r: string): string {
  return ({ LEGENDARY: 'var(--gold)', EPIC: 'var(--arcane-glow)', RARE: 'var(--ice-bright)', COMMON: 'var(--rune-gray)' } as Record<string, string>)[r] ?? 'var(--parchment-dim)';
}

// ── PackageCard (del .tsx) ────────────────────────────────────
function PackageCard({ pkg, selected, onSelect }: { pkg: TokenPackage; selected: TokenPackage | null; onSelect: (p: TokenPackage) => void }) {
  const rc = rarityColor(pkg.rarity);
  const isSelected = selected?.id === pkg.id;
  const totalTokens = pkg.tokens + pkg.bonusTokens;
  return (
    <div onClick={() => onSelect(pkg)} style={{ cursor: 'pointer', background: 'linear-gradient(145deg, var(--stone-dark), var(--stone))', border: isSelected ? `2px solid ${rc}` : pkg.highlight ? '1px solid var(--arcane)' : '1px solid rgba(200,134,10,.2)', borderRadius: 16, padding: '1.1rem', position: 'relative', overflow: 'hidden', transition: 'all 250ms ease', boxShadow: isSelected ? `0 0 25px ${rc}40` : pkg.highlight ? '0 0 20px rgba(74,21,128,.25)' : 'none', transform: isSelected ? 'scale(1.02)' : 'scale(1)' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(400px 120px at 0% 0%, ${rc}15, transparent 60%)`, pointerEvents: 'none' }} />
      {pkg.highlight && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, var(--arcane), var(--arcane-bright))', padding: '.2rem .8rem', borderRadius: '0 0 8px 8px', fontFamily: 'var(--font-heading)', fontSize: '.58rem', letterSpacing: '.2em', color: 'var(--arcane-glow)' }}>★ MÁS ELEGIDO</div>}
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '.4rem', marginTop: pkg.highlight ? '.8rem' : 0 }}>{pkg.icon}</div>
        <div style={{ fontFamily: 'var(--font-title)', color: rc, fontSize: '.85rem', marginBottom: '.3rem', lineHeight: 1.2, filter: `drop-shadow(0 0 8px ${rc}60)` }}>{pkg.name}</div>
        <span className={`nbv-badge nbv-badge-${({ LEGENDARY: 'gold', EPIC: 'arcane', RARE: 'ice', COMMON: 'gray' } as Record<string,string>)[pkg.rarity]}`}>{pkg.rarity}</span>
        <div style={{ margin: '.75rem 0' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--gold-light)', textShadow: '0 0 15px rgba(200,134,10,.5)' }}>✦ {pkg.tokens.toLocaleString()}</div>
          {pkg.bonusTokens > 0 && <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.75rem', color: 'var(--emerald-bright)', marginTop: '.15rem' }}>+ {pkg.bonusTokens.toLocaleString()} bonus</div>}
          {pkg.bonusTokens > 0 && <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.68rem', color: 'var(--rune-gray)', marginTop: '.1rem' }}>Total: ✦ {totalTokens.toLocaleString()}</div>}
        </div>
        <p style={{ fontSize: '.8rem', fontStyle: 'italic', marginBottom: '.75rem', color: 'var(--parchment-dim)' }}>{pkg.description}</p>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: isSelected ? rc : 'var(--parchment)' }}>${pkg.priceUSD.toFixed(2)} USD</div>
        <div style={{ fontSize: '.72rem', color: 'var(--rune-gray)' }}>≈ ${pkg.priceCOP.toLocaleString()} COP</div>
      </div>
    </div>
  );
}

// ── CardInput (del .tsx) ──────────────────────────────────────
function CardInput({ label, value, onChange, placeholder, type = 'text', maxLength, error }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; maxLength?: number; error?: string }) {
  return (
    <div style={{ marginBottom: '.9rem' }}>
      <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '.65rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.35rem' }}>{label}</label>
      <input className={`nbv-input${error ? ' error' : ''}`} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} style={{ borderRadius: 6 }} />
      {error && <span style={{ fontSize: '.72rem', color: 'var(--crimson-bright)', fontStyle: 'italic' }}>{error}</span>}
    </div>
  );
}

// ── PaymentForm (del .tsx) ────────────────────────────────────
function PaymentForm({ pkg, playerId, onSuccess, onBack }: { pkg: TokenPackage; playerId: string; onSuccess: (tokensAdded: number) => void; onBack: () => void }) {
  const [step, setStep]         = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [card, setCard]         = useState<CardData>({ number: '', expiry: '', cvv: '', holder: '' });
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [txResult, setTxResult] = useState<{ transactionId: string; last4: string } | null>(null);
  const [tokensAdded, setTokensAdded] = useState(0);
  const [errMsg, setErrMsg]     = useState('');
  const totalTokens = pkg.tokens + pkg.bonusTokens;

  const handleSubmit = async () => {
    const formErrors = CardDomainService.validate(card);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;
    setStep('processing');
    try {
      const result = await paymentAdapter.processCard({ card, pkg, playerId });
      setTxResult({ transactionId: result.transaction.transactionId, last4: result.transaction.last4 });
      setTokensAdded(result.tokensAdded);
      setStep('success');
      onSuccess(result.tokensAdded);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Error al procesar pago');
      setStep('error');
    }
  };

  if (step === 'processing') return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⚜</div>
      <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)', letterSpacing: '.2em', fontSize: '.85rem' }}>Procesando pago...</div>
    </div>
  );

  if (step === 'success') return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="fade-in">
      <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px rgba(200,134,10,.7))' }}>✦</div>
      <h3 style={{ marginBottom: '.5rem' }}>¡Transacción Exitosa!</h3>
      <p style={{ marginBottom: '1.25rem' }}>Se acreditaron <strong style={{ color: 'var(--gold-light)' }}>✦ {tokensAdded.toLocaleString()} tokens</strong> a tu cuenta.</p>
      <div style={{ display: 'inline-block', padding: '.6rem 1.2rem', background: 'rgba(0,0,0,.3)', border: '1px solid rgba(200,134,10,.2)', borderRadius: 10, marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.6rem', letterSpacing: '.2em', color: 'var(--rune-gray)', marginBottom: '.2rem' }}>TRANSACCIÓN</div>
        <div style={{ fontFamily: 'monospace', fontSize: '.75rem', color: 'var(--parchment-dim)' }}>{txResult?.transactionId}</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.6rem', color: 'var(--rune-gray)', marginTop: '.2rem' }}>Tarjeta: **** {txResult?.last4}</div>
      </div>
      <button className="nbv-btn nbv-btn-primary" style={{ clipPath: 'none', borderRadius: 14 }} onClick={onBack}>Volver al mercado</button>
    </div>
  );

  if (step === 'error') return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="fade-in">
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗡</div>
      <h3 style={{ color: 'var(--crimson-bright)', marginBottom: '.5rem' }}>Error en el pago</h3>
      <div className="nbv-notif nbv-notif-error" style={{ textAlign: 'left', marginBottom: '1.25rem' }}><span>✕</span><div>{errMsg}</div></div>
      <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="nbv-btn nbv-btn-ghost" style={{ clipPath: 'none', borderRadius: 12 }} onClick={() => setStep('form')}>Reintentar</button>
        <button className="nbv-btn nbv-btn-ghost" style={{ clipPath: 'none', borderRadius: 12 }} onClick={onBack}>Cancelar</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Resumen del paquete */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '.9rem 1rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,.25)', border: '1px solid rgba(200,134,10,.15)', borderRadius: 12 }}>
        <span style={{ fontSize: '1.8rem' }}>{pkg.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--parchment)', fontSize: '.9rem' }}>{pkg.name}</div>
          <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)', fontSize: '.78rem' }}>✦ {totalTokens.toLocaleString()} tokens</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)', fontSize: '1.1rem' }}>${pkg.priceUSD} USD</div>
          <div style={{ fontSize: '.7rem', color: 'var(--rune-gray)' }}>≈ ${pkg.priceCOP.toLocaleString()} COP</div>
        </div>
      </div>

      {/* Formulario de tarjeta */}
      <CardInput label="Número de tarjeta" value={card.number} onChange={v => setCard(c => ({ ...c, number: CardDomainService.formatNumber(v) }))} placeholder="1234 5678 9012 3456" maxLength={19} error={errors.number} />
      <CardInput label="Titular" value={card.holder} onChange={v => setCard(c => ({ ...c, holder: v.toUpperCase() }))} placeholder="NOMBRE APELLIDO" error={errors.holder} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
        <CardInput label="Vencimiento" value={card.expiry} onChange={v => setCard(c => ({ ...c, expiry: CardDomainService.formatExpiry(v) }))} placeholder="MM/AA" maxLength={5} error={errors.expiry} />
        <CardInput label="CVV" value={card.cvv} onChange={v => setCard(c => ({ ...c, cvv: v.replace(/\D/g, '').slice(0, 4) }))} placeholder="•••" type="password" maxLength={4} error={errors.cvv} />
      </div>
      <div style={{ marginTop: '.5rem', padding: '.6rem .8rem', background: 'rgba(0,0,0,.2)', border: '1px solid rgba(122,106,88,.2)', borderRadius: 8, fontSize: '.72rem', color: 'var(--rune-gray)', fontStyle: 'italic', marginBottom: '1rem' }}>
        🔒 Demo. No se procesan pagos reales. Usa cualquier número excepto xxxx xxxx xxxx 0000 para simular éxito.
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem', padding: '.6rem .8rem', background: 'rgba(200,134,10,.05)', border: '1px solid rgba(200,134,10,.15)', borderRadius: 10 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '.75rem', color: 'var(--parchment-dim)' }}>Total a pagar</span>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--gold-light)' }}>${pkg.priceUSD.toFixed(2)} USD</span>
      </div>
      <button className="nbv-btn nbv-btn-primary" style={{ width: '100%', clipPath: 'polygon(10px 0%,calc(100% - 10px) 0%,100% 50%,calc(100% - 10px) 100%,10px 100%,0% 50%)', marginBottom: '.6rem', padding: '.8rem' }} onClick={handleSubmit}>
        ⚔ Confirmar Compra — ${pkg.priceUSD.toFixed(2)} USD
      </button>
      <button className="nbv-btn nbv-btn-ghost" style={{ width: '100%', clipPath: 'none', borderRadius: 12 }} onClick={onBack}>Cancelar</button>
    </div>
  );
}

// ── TokenGatewayModule (modal principal exportado) ────────────
interface TokenGatewayModuleProps {
  playerId:         string;
  onClose:          () => void;
  onPurchaseComplete: (tokensAdded: number) => void;
}

export function TokenGatewayModule({ playerId, onClose, onPurchaseComplete }: TokenGatewayModuleProps) {
  const [selectedPkg, setSelectedPkg] = useState<TokenPackage | null>(null);
  const [step, setStep]               = useState<'packages' | 'checkout'>('packages');

  const handleBack = useCallback(() => {
    if (step === 'checkout') setStep('packages');
    else onClose();
  }, [step, onClose]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,7,5,.9)', backdropFilter: 'blur(6px)', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'linear-gradient(145deg, var(--stone-dark), var(--stone))', border: '1px solid rgba(200,134,10,.3)', boxShadow: '0 0 80px rgba(0,0,0,.9), 0 0 40px rgba(200,134,10,.1)', borderRadius: 20, width: '100%', maxWidth: step === 'packages' ? 680 : 480, maxHeight: '90vh', overflowY: 'auto', position: 'relative', transition: 'max-width .3s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1.3rem', background: 'rgba(0,0,0,.4)', borderBottom: '1px solid rgba(200,134,10,.18)', borderRadius: '20px 20px 0 0' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '.65rem', letterSpacing: '.35em', color: 'var(--gold)', textTransform: 'uppercase' }}>✦ Emporio de Tokens del Nexus</span>
            {step === 'checkout' && selectedPkg && <div style={{ fontFamily: 'var(--font-title)', fontSize: '.78rem', color: 'var(--parchment-dim)', marginTop: '.1rem' }}>Comprando: {selectedPkg.name}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--rune-gray)', cursor: 'pointer', fontSize: '1.1rem', padding: '.2rem .4rem' }}>✕</button>
        </div>

        <div style={{ padding: '1.3rem' }}>
          {step === 'packages' && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '.3rem' }}>Elige tu Paquete de Tokens</h3>
                <p style={{ fontStyle: 'italic', fontSize: '.88rem' }}>Tokens para pujar, comprar y dominar el Nexus.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.75rem', marginBottom: '1.25rem' }}>
                {TOKEN_PACKAGES.map(pkg => <PackageCard key={pkg.id} pkg={pkg} selected={selectedPkg} onSelect={setSelectedPkg} />)}
              </div>
              {selectedPkg && (
                <div className="fade-in" style={{ padding: '.75rem 1rem', background: 'rgba(200,134,10,.06)', border: '1px solid rgba(200,134,10,.2)', borderRadius: 12, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.72rem', color: 'var(--gold)', letterSpacing: '.08em' }}>Seleccionado</div>
                    <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--parchment)', fontSize: '.88rem' }}>{selectedPkg.icon} {selectedPkg.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)' }}>✦ {(selectedPkg.tokens + selectedPkg.bonusTokens).toLocaleString()} tokens</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--parchment-dim)' }}>${selectedPkg.priceUSD.toFixed(2)} USD</div>
                  </div>
                </div>
              )}
              <button className="nbv-btn nbv-btn-primary" style={{ width: '100%', clipPath: 'polygon(10px 0%,calc(100% - 10px) 0%,100% 50%,calc(100% - 10px) 100%,10px 100%,0% 50%)', padding: '.75rem' }} disabled={!selectedPkg} onClick={() => setStep('checkout')}>
                ⚔ Proceder al pago
              </button>
            </div>
          )}
          {step === 'checkout' && selectedPkg && (
            <PaymentForm
              pkg={selectedPkg}
              playerId={playerId}
              onSuccess={(tokensAdded) => { onPurchaseComplete(tokensAdded); onClose(); }}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
