import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auctionsApi } from '@/api/auctions';
import { getErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import type { Auction, AuctionStatus, ItemRarity } from '@/types';

function rarityColor(r: ItemRarity) {
  switch (r) {
    case 'LEGENDARY': return 'var(--gold)';
    case 'EPIC': return 'var(--arcane-glow)';
    case 'RARE': return 'var(--ice-bright)';
    case 'COMMON': return 'var(--rune-gray)';
  }
}

function statusLabel(s: AuctionStatus) {
  if (s === 'ACTIVE') return 'Activa';
  if (s === 'CLOSED') return 'Cerrada';
  return 'Cancelada';
}

function formatEnds(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function getDemoAuction(id: string): Auction {
  const n = Number(id.replace('mock-', '')) || 1;
  const now = Date.now();
  const rarity: ItemRarity = (['LEGENDARY', 'EPIC', 'RARE', 'COMMON'] as ItemRarity[])[n % 4];
  const status: AuctionStatus = (['ACTIVE', 'CLOSED', 'CANCELLED'] as AuctionStatus[])[n % 3];
  return {
    id,
    itemId: `item-${n}`,
    itemName: ['Espada del Alba', 'Manto Arcano', 'Escudo de Escarcha', 'Daga Sombría'][n % 4],
    rarity,
    startingPrice: 100 + n * 15,
    currentPrice: 140 + n * 25,
    currentWinnerId: n % 2 === 0 ? 'player-x' : null,
    status,
    endsAt: new Date(now + (n + 1) * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now - (n + 2) * 60 * 60 * 1000).toISOString(),
    bids: [],
  };
}

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const player = useAuthStore(s => s.player);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bid, setBid] = useState('');
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    setError(null);

    // Si navegamos desde el modo demo (cuando el back devuelve 501), evitamos
    // un fetch que fallará y mostramos un detalle básico.
    if (id.startsWith('mock-')) {
      setAuction(getDemoAuction(id));
      setLoading(false);
      return () => { alive = false; };
    }

    auctionsApi.getById(id)
      .then((res) => {
        if (!alive) return;
        setAuction(res.data.data);
      })
      .catch((err) => {
        if (!alive) return;
        setError(getErrorMessage(err));
      })
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [id]);

  const minBid = useMemo(() => {
    if (!auction) return 0;
    return Math.floor(auction.currentPrice + 1);
  }, [auction]);

  const canBid = !!auction && auction.status === 'ACTIVE';

  const isLoading = loading;
  const hasError = error || !auction;
  const showErrorState = !isLoading && hasError;
  const showLoadingState = isLoading;

  const submitBid = useCallback(async () => {
    if (!auction || !id) return;
    const amount = Number(bid);
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast('Ingresa una cantidad válida.');
      return;
    }
    if (amount <= auction.currentPrice) {
      setToast(`La puja debe ser mayor a ${auction.currentPrice}.`);
      return;
    }

    setPlacing(true);
    setToast(null);
    try {
      const res = await auctionsApi.placeBid(id, amount);
      setAuction(res.data.data);
      setBid('');
      setToast('Puja realizada. Que el oro te acompañe.');
    } catch (err) {
      setToast(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  }, [auction, id, bid, player]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem 2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button
          className="nbv-btn nbv-btn-ghost"
          style={{ clipPath: 'none', borderRadius: 12, padding: '0.5rem 1rem', fontSize: '0.65rem' }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
        <Link
          to="/auctions"
          className="nbv-btn nbv-btn-ghost"
          style={{ clipPath: 'none', borderRadius: 12, padding: '0.5rem 1rem', fontSize: '0.65rem' }}
        >
          🏛 Ir al Mercado
        </Link>
      </div>

      {showLoadingState ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--gold)', fontFamily: 'var(--font-heading)', letterSpacing: '0.35em', opacity: 0.85 }}>
          ⚜ Consultando pergaminos de subasta...
        </div>
      ) : null}
      {showErrorState ? (
        <div style={{
          border: '1px solid rgba(200,134,10,0.25)',
          background: 'rgba(0,0,0,0.22)',
          padding: '1.25rem',
          borderRadius: 14,
          textAlign: 'center',
          color: 'var(--parchment-dim)',
          fontStyle: 'italic',
        }}>
          ⚠️ {error || 'Subasta no encontrada'}
        </div>
      ) : null}
      {auction ? (
        <>
          <div style={{
            border: '1px solid rgba(200,134,10,0.18)',
            background: 'linear-gradient(145deg, rgba(28,21,16,0.9), rgba(18,14,10,0.9))',
            borderRadius: 18,
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(900px 240px at 0% 0%, ${rarityColor(auction.rarity)}22, transparent 55%)`,
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.10em',
                  color: rarityColor(auction.rarity),
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  opacity: 0.95,
                }}>
                  {auction.rarity}
                </div>
                <span className={`nbv-badge nbv-badge-${auction.status === 'ACTIVE' ? 'gold' : 'emerald'}`} title={auction.status}>
                  {statusLabel(auction.status)}
                </span>
              </div>

              <h1 style={{ marginTop: '.55rem' }}>{auction.itemName}</h1>

              <div style={{ marginTop: '.75rem', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '.75rem' }}>
                <div style={{ border: '1px solid rgba(200,134,10,0.12)', background: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: '.75rem .85rem' }}>
                  <div style={{ fontSize: '.7rem', letterSpacing: '.18em', opacity: .75 }}>PRECIO ACTUAL</div>
                  <div style={{ fontWeight: 900, color: 'var(--parchment)' }}>✦ {auction.currentPrice.toLocaleString()}</div>
                </div>
                <div style={{ border: '1px solid rgba(200,134,10,0.12)', background: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: '.75rem .85rem' }}>
                  <div style={{ fontSize: '.7rem', letterSpacing: '.18em', opacity: .75 }}>PRECIO INICIAL</div>
                  <div style={{ fontWeight: 900, color: 'var(--parchment)' }}>✦ {auction.startingPrice.toLocaleString()}</div>
                </div>
                <div style={{ border: '1px solid rgba(200,134,10,0.12)', background: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: '.75rem .85rem' }}>
                  <div style={{ fontSize: '.7rem', letterSpacing: '.18em', opacity: .75 }}>CIERRA</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--parchment)' }}>{formatEnds(auction.endsAt)}</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <div style={{ border: '1px solid rgba(200,134,10,0.12)', background: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: '1rem' }}>
                  <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)', letterSpacing: '.15em', marginBottom: '.5rem' }}>
                    Historial de pujas
                  </div>
                  {auction.bids.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                      {auction.bids.slice(0, 8).map((b) => (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', fontSize: '.88rem', color: 'var(--parchment-dim)' }}>
                          <span>✦ {b.amount.toLocaleString()}</span>
                          <span style={{ opacity: 0.85 }}>{new Date(b.placedAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--parchment-dim)', fontStyle: 'italic' }}>
                      Aún no hay pujas. Sé el primero en desafiar al mercado.
                    </div>
                  )}
                </div>

                <div style={{ border: '1px solid rgba(200,134,10,0.12)', background: 'rgba(0,0,0,0.18)', borderRadius: 14, padding: '1rem' }}>
                  <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)', letterSpacing: '.15em', marginBottom: '.5rem' }}>
                    Hacer una puja
                  </div>
                  <div style={{ color: 'var(--parchment-dim)', fontSize: '.85rem', marginBottom: '.55rem' }}>
                    Mínimo: ✦ {minBid.toLocaleString()}
                  </div>
                  <input
                    className="nbv-input"
                    inputMode="numeric"
                    placeholder={`${minBid}`}
                    value={bid}
                    onChange={(e) => setBid(e.target.value)}
                    disabled={!canBid || placing}
                  />
                  <button
                    className="nbv-btn nbv-btn-primary"
                    style={{ width: '100%', clipPath: 'none', borderRadius: 14 }}
                    onClick={submitBid}
                    disabled={!canBid || placing || !player}
                    title={player ? undefined : 'Inicia sesión para pujar'}
                  >
                    {placing ? '⏳ Pujando...' : '⚔ Pujar'}
                  </button>
                  {canBid ? null : (
                    <div style={{ marginTop: '.6rem', color: 'var(--parchment-dim)', fontStyle: 'italic', fontSize: '.85rem' }}>
                      Esta subasta no acepta pujas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {toast && (
            <div style={{
              marginTop: '1rem',
              border: '1px solid rgba(200,134,10,0.25)',
              background: 'rgba(0,0,0,0.22)',
              padding: '0.85rem 1rem',
              borderRadius: 14,
              color: 'var(--parchment-dim)',
              fontStyle: 'italic',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
            }}>
              <span>{toast}</span>
              <button
                className="nbv-btn nbv-btn-ghost"
                style={{ clipPath: 'none', borderRadius: 12, padding: '0.45rem 0.85rem', fontSize: '0.62rem' }}
                onClick={() => setToast(null)}
              >
                ✕
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
