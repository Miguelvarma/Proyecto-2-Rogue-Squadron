// ══════════════════════════════════════════════════════════════
//  PRESENTATION — AuctionsModule
//  Componentes del .tsx integrados con la arquitectura hexagonal.
//  Datos reales vienen del inventario del proyecto.
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AuctionEntity, Bid } from '../../domain/entities/Auction';
import { AuctionDomainService } from '../../domain/services/AuctionDomainService';
import { useAuctionModule } from '../hooks/useAuctionModule';
import type { ItemRarity } from '@/types';

// ── Helpers de dominio (del .tsx original) ───────────────────
function rarityColor(r: ItemRarity | string): string {
  const map: Record<string, string> = {
    LEGENDARY: 'var(--gold)',
    EPIC:      'var(--arcane-glow)',
    RARE:      'var(--ice-bright)',
    COMMON:    'var(--rune-gray)',
  };
  return map[r] ?? 'var(--parchment-dim)';
}

// ── CountdownTimer (del .tsx) ─────────────────────────────────
function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState('');
  const [urgent, setUrgent]       = useState(false);
  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expirada'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 5 * 60 * 1000);
      setRemaining(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return (
    <span style={{
      color:       urgent ? 'var(--crimson-bright)' : 'var(--parchment)',
      fontFamily:  'var(--font-heading)',
      fontSize:    '.85rem',
      fontWeight:  urgent ? 700 : 400,
    }}>
      {urgent && '⚡ '}{remaining}
    </span>
  );
}

// ── Toast (del .tsx) ─────────────────────────────────────────
function Toast({ message, type = 'info', onClose }: { message: string; type?: string; onClose: () => void }) {
  const cls  = ({ success: 'nbv-notif-success', warning: 'nbv-notif-warning', error: 'nbv-notif-error', info: 'nbv-notif-info' } as Record<string, string>)[type];
  const icon = ({ success: '✦', warning: '⚠', error: '✕', info: 'ℹ' } as Record<string, string>)[type];
  return (
    <div className={`nbv-notif ${cls}`} style={{ marginTop: '.75rem' }}>
      <span>{icon}</span>
      <div style={{ flex: 1 }}><div>{message}</div></div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: .7 }}>✕</button>
    </div>
  );
}

// ── BidHistoryRow (del .tsx) ──────────────────────────────────
function BidHistoryRow({ bid, isTop }: { bid: Bid; isTop: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '.45rem .6rem', borderRadius: 8,
      background: isTop ? 'rgba(200,134,10,.08)' : 'transparent',
      border: isTop ? '1px solid rgba(200,134,10,.15)' : '1px solid transparent',
      transition: 'all .25s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--stone-light), var(--stone-dark))', border: `1px solid ${isTop ? 'var(--gold-dark)' : 'var(--ash)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: '.65rem', color: isTop ? 'var(--gold)' : 'var(--parchment-dim)' }}>
          {bid.bidderUsername.charAt(0)}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.75rem', color: isTop ? 'var(--gold)' : 'var(--parchment)', letterSpacing: '.05em' }}>{bid.bidderUsername}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--rune-gray)' }}>{new Date(bid.placedAt).toLocaleTimeString()}</div>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', color: isTop ? 'var(--gold-light)' : 'var(--parchment-dim)', fontSize: '.9rem' }}>
        {isTop && '👑 '}✦ {bid.amount.toLocaleString()}
      </div>
    </div>
  );
}

// ── AuctionCard (del .tsx) ────────────────────────────────────
function AuctionCard({ auction, onSelect }: { auction: AuctionEntity; onSelect: (a: AuctionEntity) => void }) {
  const isActive = auction.status === 'ACTIVE';
  const isClosed = auction.status === 'CLOSED';
  const rc = rarityColor(auction.itemSnapshot.rarity);
  return (
    <div onClick={() => onSelect(auction)} className="nbv-card" style={{ cursor: 'pointer', borderRadius: 16, border: `1px solid ${rc}44`, overflow: 'hidden', position: 'relative', transition: 'all 250ms ease' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(600px 120px at 0% 0%, ${rc}18, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRight: `1px solid ${rc}80`, borderBottom: `1px solid ${rc}80` }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '.65rem', letterSpacing: '.2em', color: rc, textTransform: 'uppercase' }}>{auction.itemSnapshot.rarity}</span>
          <span className={`nbv-badge nbv-badge-${isActive ? 'gold' : isClosed ? 'emerald' : 'crimson'}`}>{isActive ? 'Activa' : isClosed ? 'Cerrada' : 'Cancelada'}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '.95rem', lineHeight: 1.2, marginBottom: '.65rem' }}>{auction.itemSnapshot.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', marginBottom: '.6rem' }}>
          <div style={{ background: 'rgba(0,0,0,.2)', border: '1px solid rgba(200,134,10,.1)', borderRadius: 10, padding: '.55rem .7rem' }}>
            <div style={{ fontSize: '.62rem', letterSpacing: '.18em', color: 'var(--rune-gray)', fontFamily: 'var(--font-heading)', marginBottom: '.15rem' }}>PRECIO</div>
            <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--parchment)', fontSize: '.9rem' }}>✦ {auction.currentPrice.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,.2)', border: '1px solid rgba(200,134,10,.1)', borderRadius: 10, padding: '.55rem .7rem' }}>
            <div style={{ fontSize: '.62rem', letterSpacing: '.18em', color: 'var(--rune-gray)', fontFamily: 'var(--font-heading)', marginBottom: '.15rem' }}>CIERRE</div>
            {isActive ? <CountdownTimer endsAt={auction.endsAt} /> : <span style={{ fontFamily: 'var(--font-heading)', fontSize: '.85rem', color: 'var(--rune-gray)' }}>Finalizada</span>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--parchment-dim)' }}>
          <span>Pujas: <strong style={{ color: 'var(--parchment)' }}>{auction.bids.length}</strong></span>
          <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)', fontSize: '.72rem' }}>Ver detalles →</span>
        </div>
      </div>
    </div>
  );
}

// ── AuctionDetail (del .tsx) ──────────────────────────────────
function AuctionDetail({
  auction, onBack, onBidPlaced, onTokensNeeded,
}: {
  auction: AuctionEntity;
  onBack: () => void;
  onBidPlaced: (updated: AuctionEntity, bid: Bid) => void;
  onTokensNeeded: () => void;
}) {
  const { player, placeBid } = useAuctionModule();
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing]     = useState(false);
  const [toast, setToast]         = useState<{ message: string; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const minBid  = AuctionDomainService.computeMinBid(auction);
  const canBid  = auction.status === 'ACTIVE' && !AuctionDomainService.isExpired(auction);
  const rc      = rarityColor(auction.itemSnapshot.rarity);
  const isWinner = auction.currentWinnerId === player?.id;

  // Balance del jugador desde el store de auth (gold del perfil)
  const tokenBalance = (player as any)?.gold ?? 9999;
  const username     = player?.apodo ?? player?.email ?? 'Jugador';

  const handleBid = async () => {
    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast({ message: 'Ingresa una cantidad válida.', type: 'error' });
      return;
    }
    setPlacing(true);
    setToast(null);
    try {
      const bid = await placeBid({
        auctionId: auction.id,
        amount,
        player: { id: player!.id, username, tokenBalance },
      });
      // El store ya actualizó `auction` con setSelected
      const { selected } = (await import('../../infrastructure/store/auctionStore')).useAuctionStore.getState();
      onBidPlaced(selected ?? auction, bid);
      setBidAmount('');
      setToast({ message: `¡Puja de ✦ ${amount.toLocaleString()} colocada!`, type: 'success' });
      inputRef.current?.focus();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error al pujar', type: 'error' });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="fade-in">
      <button className="nbv-btn nbv-btn-ghost" style={{ clipPath: 'none', borderRadius: 12, padding: '.45rem 1rem', fontSize: '.65rem', marginBottom: '1rem' }} onClick={onBack}>← Volver al mercado</button>

      {/* Item snapshot */}
      <div style={{ background: 'linear-gradient(145deg, var(--stone-dark), var(--stone))', border: '1px solid rgba(200,134,10,.2)', borderRadius: 18, padding: '1.25rem', position: 'relative', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(900px 200px at 0% 0%, ${rc}20, transparent 60%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: '.75rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.7rem', letterSpacing: '.2em', color: rc, textTransform: 'uppercase', marginBottom: '.35rem' }}>{auction.itemSnapshot.rarity} · {auction.itemSnapshot.type}</div>
              <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', marginBottom: '.25rem' }}>{auction.itemSnapshot.name}</h2>
              <p style={{ fontStyle: 'italic', fontSize: '.9rem' }}>{auction.itemSnapshot.description}</p>
            </div>
            <span className={`nbv-badge nbv-badge-${auction.status === 'ACTIVE' ? 'gold' : auction.status === 'CLOSED' ? 'emerald' : 'crimson'}`} style={{ alignSelf: 'flex-start' }}>
              {auction.status === 'ACTIVE' ? '⚡ Activa' : auction.status === 'CLOSED' ? '✓ Cerrada' : '✕ Cancelada'}
            </span>
          </div>

          {/* Stats del ítem */}
          {Object.keys(auction.itemSnapshot.stats).length > 0 && (
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {Object.entries(auction.itemSnapshot.stats).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.15rem', padding: '.4rem .6rem', background: 'rgba(0,0,0,.25)', border: '1px solid rgba(200,134,10,.12)', borderRadius: 8 }}>
                  <span style={{ fontSize: '.62rem', letterSpacing: '.18em', color: 'var(--rune-gray)', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>{k}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '.88rem', color: rc, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.75rem' }}>
            {[
              { label: 'PRECIO ACTUAL',  value: `✦ ${auction.currentPrice.toLocaleString()}`, highlight: true,  timer: false },
              { label: 'PRECIO INICIAL', value: `✦ ${auction.startingPrice.toLocaleString()}`, highlight: false, timer: false },
              { label: 'CIERRA EN',      value: null,                                           highlight: false, timer: true  },
            ].map((cell, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,.22)', border: '1px solid rgba(200,134,10,.1)', borderRadius: 12, padding: '.7rem .85rem' }}>
                <div style={{ fontSize: '.62rem', letterSpacing: '.18em', color: 'var(--rune-gray)', fontFamily: 'var(--font-heading)', marginBottom: '.25rem' }}>{cell.label}</div>
                {cell.timer
                  ? auction.status === 'ACTIVE'
                    ? <CountdownTimer endsAt={auction.endsAt} />
                    : <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--rune-gray)' }}>Finalizada</span>
                  : <div style={{ fontFamily: 'var(--font-heading)', color: cell.highlight ? 'var(--gold-light)' : 'var(--parchment)', fontSize: '1rem' }}>{cell.value}</div>
                }
              </div>
            ))}
          </div>
          {isWinner && (
            <div style={{ marginTop: '.75rem', padding: '.6rem 1rem', background: 'rgba(200,134,10,.1)', border: '1px solid rgba(200,134,10,.3)', borderRadius: 10, fontFamily: 'var(--font-heading)', color: 'var(--gold-light)', fontSize: '.78rem', textAlign: 'center' }}>
              👑 ¡Actualmente eres el mejor postor!
            </div>
          )}
        </div>
      </div>

      {/* Historial + Formulario de puja */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr .7fr', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(145deg, var(--stone-dark), var(--stone))', border: '1px solid rgba(200,134,10,.15)', borderRadius: 16, padding: '1.1rem' }}>
          <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)', letterSpacing: '.15em', fontSize: '.78rem', marginBottom: '.75rem' }}>📜 Historial de Pujas ({auction.bids.length})</div>
          {auction.bids.length === 0
            ? <p style={{ fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>Sé el primero en desafiar al mercado.</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem', maxHeight: 260, overflowY: 'auto', paddingRight: '.25rem' }}>
                {auction.bids.map((b, i) => <BidHistoryRow key={b.id} bid={b} isTop={i === 0} />)}
              </div>
            )
          }
        </div>

        <div style={{ background: 'linear-gradient(145deg, var(--stone-dark), var(--stone))', border: '1px solid rgba(200,134,10,.15)', borderRadius: 16, padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
          <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)', letterSpacing: '.15em', fontSize: '.78rem' }}>⚔ Hacer una Puja</div>
          {canBid ? (
            <>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.65rem', letterSpacing: '.2em', color: 'var(--parchment-dim)', marginBottom: '.35rem' }}>MÍNIMO: ✦ {minBid.toLocaleString()}</div>
                <input
                  ref={inputRef}
                  className="nbv-input"
                  type="number"
                  inputMode="numeric"
                  placeholder={`${minBid}`}
                  value={bidAmount}
                  min={minBid}
                  onChange={e => setBidAmount(e.target.value)}
                  disabled={placing}
                />
              </div>
              {bidAmount && Number(bidAmount) >= minBid && (
                <div style={{ padding: '.5rem .7rem', background: 'rgba(200,134,10,.06)', border: '1px solid rgba(200,134,10,.18)', borderRadius: 8, fontSize: '.78rem', color: 'var(--parchment-dim)' }}>
                  Puja confirmada: <strong style={{ color: 'var(--gold)' }}>✦ {Number(bidAmount).toLocaleString()}</strong>
                </div>
              )}
              <button className="nbv-btn nbv-btn-primary" style={{ width: '100%', clipPath: 'none', borderRadius: 12, marginTop: 'auto' }} onClick={handleBid} disabled={placing || !bidAmount}>
                {placing ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚜</span> Pujando...</> : '⚔ Pujar'}
              </button>
              {toast && <Toast {...toast} onClose={() => setToast(null)} />}
              <button className="nbv-btn nbv-btn-arcane" style={{ clipPath: 'none', borderRadius: 10, fontSize: '.62rem', padding: '.35rem' }} onClick={onTokensNeeded}>✦ Obtener Tokens</button>
            </>
          ) : (
            <div className="nbv-notif nbv-notif-warning"><p style={{ fontStyle: 'italic' }}>Esta subasta no acepta nuevas pujas.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AuctionsModule (componente principal exportado) ───────────
interface AuctionsModuleProps {
  onTokensNeeded: () => void;
}

export function AuctionsModule({ onTokensNeeded }: AuctionsModuleProps) {
  const { auctions, loading, error, filter, setFilter, setSelected } = useAuctionModule();
  const [selectedAuction, setSelectedAuction] = useState<AuctionEntity | null>(null);

  const handleSelect = useCallback((a: AuctionEntity) => {
    setSelectedAuction(a);
    setSelected(a);
  }, [setSelected]);

  const handleBidPlaced = useCallback((updated: AuctionEntity) => {
    setSelectedAuction(updated);
  }, []);

  if (selectedAuction) {
    return (
      <AuctionDetail
        auction={selectedAuction}
        onBack={() => { setSelectedAuction(null); setSelected(null); }}
        onBidPlaced={handleBidPlaced}
        onTokensNeeded={onTokensNeeded}
      />
    );
  }

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.7rem', letterSpacing: '.45em', color: 'var(--gold)', textTransform: 'uppercase', opacity: .85, marginBottom: '.6rem' }}>🏛 Mercado del Nexus</div>
        <h2 style={{ marginBottom: '.3rem' }}>Casa de Subastas</h2>
        <p style={{ fontStyle: 'italic' }}>Reliquias raras. Pujas en tiempo real. Solo los más audaces prevalecen.</p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.25rem' }}>
        {(['ALL', 'ACTIVE', 'CLOSED'] as const).map(f => (
          <button key={f} className="nbv-btn nbv-btn-ghost" onClick={() => setFilter(f)} style={{ clipPath: 'none', borderRadius: 20, padding: '.35rem .85rem', fontSize: '.62rem', borderColor: filter === f ? 'rgba(200,134,10,.55)' : 'rgba(200,134,10,.2)', color: filter === f ? 'var(--gold)' : 'var(--parchment-dim)', background: filter === f ? 'rgba(200,134,10,.08)' : 'transparent' }}>
            {f === 'ALL' ? 'Todas' : f === 'ACTIVE' ? 'Activas' : 'Cerradas'}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: 'rgba(200,134,10,.06)', border: '1px solid rgba(200,134,10,.18)', borderRadius: 12, padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.82rem', color: 'var(--parchment-dim)', fontStyle: 'italic' }}>
          Conectando con el mercado… mostrando datos de demostración.
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.9rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="nbv-skeleton" style={{ height: 160, borderRadius: 16 }} />)}
        </div>
      ) : auctions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--parchment-dim)', fontStyle: 'italic' }}>No hay subastas para este filtro.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.9rem' }}>
          {auctions.map(a => <AuctionCard key={a.id} auction={a} onSelect={handleSelect} />)}
        </div>
      )}

      {/* CTA tokens */}
      <div style={{ marginTop: '1.25rem', padding: '.75rem 1rem', background: 'rgba(200,134,10,.04)', border: '1px solid rgba(200,134,10,.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '.7rem', color: 'var(--parchment-dim)', letterSpacing: '.08em' }}>¿Necesitas más tokens para pujar?</div>
        <button className="nbv-btn nbv-btn-arcane" style={{ clipPath: 'none', borderRadius: 12, padding: '.4rem 1rem', fontSize: '.65rem' }} onClick={onTokensNeeded}>✦ Obtener Tokens</button>
      </div>
    </div>
  );
}
