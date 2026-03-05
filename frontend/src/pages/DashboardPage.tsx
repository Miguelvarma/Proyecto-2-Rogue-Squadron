/**
 * DashboardPage.tsx — Panel principal del jugador
 * Reemplaza el placeholder con una página real.
 * Lee: playerStore + API calls a missions y auctions.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { missionsApi } from '@/api/missions';
import { auctionsApi } from '@/api/auctions';
import type { Mission, Auction } from '@/types';

const RARITY_COLOR: Record<string, string> = {
  COMMON:    'var(--rarity-common)',
  RARE:      'var(--ice-bright)',
  EPIC:      'var(--arcane-glow)',
  LEGENDARY: 'var(--gold-light)',
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Activa',     cls: 'nbv-badge-arcane' },
  COMPLETED: { label: 'Completada', cls: 'nbv-badge-emerald' },
  FAILED:    { label: 'Fallida',    cls: 'nbv-badge-crimson' },
  EXPIRED:   { label: 'Expirada',   cls: 'nbv-badge-gray' },
};

export default function DashboardPage() {
  const { player } = useAuthStore();
  const { profile, isLoading: profileLoading } = usePlayerStore();
  const [missions, setMissions]   = useState<Mission[]>([]);
  const [auctions, setAuctions]   = useState<Auction[]>([]);
  const [loading, setLoading]     = useState(true);

  const username = player?.username ?? profile?.username ?? 'Aventurero';
  const gold     = profile?.gold ?? 0;
  const rank     = profile?.rank ?? 0;
  const xp       = profile?.xp  ?? 0;
  const xpPct    = Math.min((xp % 1000) / 10, 100);

  useEffect(() => {
    Promise.allSettled([
      missionsApi.getActive().then(r => setMissions(r.data.data.slice(0, 3))),
      auctionsApi.getAll({ limit: 4 }).then(r => setAuctions(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content fade-in">

      {/* ── Header de bienvenida ─────────────────────────────── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero__torches" aria-hidden="true">
          <TorchDecor /> <TorchDecor />
        </div>
        <div className="dashboard-hero__content">
          <div className="dashboard-hero__eyebrow">⚜ Panel del Guerrero ⚜</div>
          <h1 className="dashboard-hero__title">
            Salve, {username}
          </h1>
          <p className="dashboard-hero__sub">
            {rank > 0 ? `Rango #${rank} en el Nexus` : 'Recluta del Nexus'}
          </p>
        </div>
      </div>

      {/* ── Stats rápidos ─────────────────────────────────────── */}
      <div className="dashboard-stats">
        <StatCard icon="✦" label="Monedas de Oro" value={gold.toLocaleString()} color="var(--gold)" />
        <StatCard icon="👑" label="Posición Global" value={rank > 0 ? `#${rank}` : 'Sin rango'} color="var(--gold-light)" />
        <StatCard icon="⚡" label="Puntos de XP" value={xp.toLocaleString()} color="var(--arcane-glow)" />
        <StatCard icon="🎒" label="Rol" value={player?.role ?? 'PLAYER'} color="var(--ice-bright)" />
      </div>

      {/* ── Barra de XP ───────────────────────────────────────── */}
      <div className="dashboard-xp-section">
        <div className="dashboard-xp-label">
          <span className="font-heading" style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            Progreso de XP
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--parchment-dim)' }}>
            {xp % 1000} / 1000
          </span>
        </div>
        <div className="nbv-progress-track">
          <div className="nbv-progress-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      {/* ── Grid principal ────────────────────────────────────── */}
      <div className="dashboard-grid">

        {/* Misiones activas */}
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">🔮 Misiones Arcanas</h2>
            <Link to="/missions" className="dashboard-section__link">Ver todas →</Link>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : missions.length === 0 ? (
            <EmptyState
              icon="🔮"
              text="No tienes misiones activas"
              action={<Link to="/missions" className="nbv-btn nbv-btn-arcane" style={{ marginTop: '0.8rem', display: 'inline-flex' }}>Generar Misión</Link>}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {missions.map(m => (
                <MissionRow key={m.id} mission={m} />
              ))}
            </div>
          )}
        </section>

        {/* Subastas recientes */}
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2 className="dashboard-section__title">⚔ Subastas Activas</h2>
            <Link to="/auctions" className="dashboard-section__link">Ver todas →</Link>
          </div>

          {loading ? (
            <SkeletonList count={4} />
          ) : auctions.length === 0 ? (
            <EmptyState icon="⚔" text="No hay subastas activas ahora" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {auctions.map(a => (
                <AuctionRow key={a.id} auction={a} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Acciones rápidas ──────────────────────────────────── */}
      <div className="dashboard-actions">
        <div className="nbv-divider"><span className="nbv-divider-icon">⚜</span></div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link to="/shop"      className="nbv-btn nbv-btn-primary">🏪 Visitar Tienda</Link>
          <Link to="/missions"  className="nbv-btn nbv-btn-arcane">🔮 Ver Misiones</Link>
          <Link to="/auctions"  className="nbv-btn nbv-btn-ghost">⚔ Ir a Subastas</Link>
          <Link to="/inventory" className="nbv-btn nbv-btn-ghost">🎒 Mi Inventario</Link>
        </div>
      </div>

      <style>{`
        .dashboard-hero {
          position: relative;
          text-align: center;
          padding: 3rem 2rem 2.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(200,134,10,0.2);
          background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200,134,10,0.06) 0%, transparent 70%);
          overflow: hidden;
        }
        .dashboard-hero__torches {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 5%;
          pointer-events: none;
        }
        .dashboard-hero__content { position: relative; z-index: 1; }
        .dashboard-hero__eyebrow {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          letter-spacing: 0.5em;
          color: var(--gold);
          opacity: 0.8;
          margin-bottom: 0.6rem;
          text-transform: uppercase;
        }
        .dashboard-hero__title {
          font-family: var(--font-title);
          font-size: clamp(1.8rem, 4vw, 3rem);
          background: linear-gradient(180deg, var(--gold-light) 0%, var(--gold) 50%, var(--gold-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(200,134,10,0.5));
          margin-bottom: 0.3rem;
        }
        .dashboard-hero__sub {
          font-family: var(--font-heading);
          color: var(--parchment-dim);
          font-size: 0.85rem;
          letter-spacing: 0.15em;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }

        .dashboard-xp-section {
          margin-bottom: 2rem;
          padding: 0 0.2rem;
        }
        .dashboard-xp-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }

        .dashboard-section {
          background: linear-gradient(145deg, var(--stone-dark), var(--dungeon));
          border: 1px solid rgba(200,134,10,0.18);
          padding: 1.2rem;
          position: relative;
        }
        .dashboard-section::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 20px; height: 20px;
          border-right: 1px solid var(--gold-dark);
          border-bottom: 1px solid var(--gold-dark);
        }
        .dashboard-section__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid rgba(200,134,10,0.1);
        }
        .dashboard-section__title {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          color: var(--gold);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          filter: none;
        }
        .dashboard-section__link {
          font-family: var(--font-heading);
          font-size: 0.65rem;
          color: var(--parchment-dim);
          letter-spacing: 0.1em;
          transition: color 0.15s;
        }
        .dashboard-section__link:hover { color: var(--gold); }

        .dashboard-actions { margin-top: 1rem; text-align: center; }

        /* Stat card */
        .stat-card {
          background: linear-gradient(145deg, var(--stone), var(--stone-dark));
          border: 1px solid rgba(200,134,10,0.18);
          padding: 1rem 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          position: relative;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 14px; height: 14px;
          border-right: 1px solid var(--gold-dark);
          border-bottom: 1px solid var(--gold-dark);
        }
        .stat-card__icon { font-size: 1.4rem; }
        .stat-card__value {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .stat-card__label {
          font-size: 0.72rem;
          color: var(--parchment-dim);
          font-style: italic;
        }

        /* Mission row */
        .mission-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.65rem 0.8rem;
          background: rgba(74,21,128,0.08);
          border: 1px solid rgba(123,53,208,0.2);
          border-left: 3px solid var(--arcane-bright);
          transition: border-color 0.15s;
        }
        .mission-row:hover { border-color: rgba(176,110,255,0.4); }
        .mission-row__icon {
          width: 30px; height: 30px;
          background: rgba(74,21,128,0.2);
          border: 1px solid rgba(123,53,208,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
        }
        .mission-row__name {
          font-family: var(--font-heading);
          font-size: 0.78rem;
          color: var(--parchment);
          letter-spacing: 0.04em;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mission-row__reward {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          color: var(--gold);
          white-space: nowrap;
        }

        /* Auction row */
        .auction-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.55rem 0.8rem;
          border: 1px solid rgba(200,134,10,0.15);
          transition: border-color 0.15s;
        }
        .auction-row:hover { border-color: rgba(200,134,10,0.35); }
        .auction-row__name {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          color: var(--parchment);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .auction-row__price {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          color: var(--gold-bright);
          white-space: nowrap;
        }

        /* Skeleton */
        .skel-row {
          height: 42px;
          border-radius: 2px;
          margin-bottom: 0.5rem;
        }

        @keyframes torch-flicker {
          0%   { transform: scaleX(1) scaleY(1) rotate(-1deg); }
          100% { transform: scaleX(0.85) scaleY(1.1) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

function MissionRow({ mission }: { mission: Mission }) {
  const cfg = STATUS_CONFIG[mission.status] ?? STATUS_CONFIG.ACTIVE;
  return (
    <Link to="/missions" style={{ textDecoration: 'none' }}>
      <div className="mission-row">
        <div className="mission-row__icon">🔮</div>
        <span className="mission-row__name">{mission.title}</span>
        <span className={`nbv-badge ${cfg.cls}`}>{cfg.label}</span>
        {mission.reward && (
          <span className="mission-row__reward">+✦{mission.reward.gold}</span>
        )}
      </div>
    </Link>
  );
}

function AuctionRow({ auction }: { auction: Auction }) {
  const rarityColor = RARITY_COLOR[auction.rarity] ?? 'var(--parchment-dim)';
  const price = auction.currentPrice.toLocaleString();
  return (
    <Link to={`/auctions/${auction.id}`} style={{ textDecoration: 'none' }}>
      <div className="auction-row">
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: rarityColor, flexShrink: 0, boxShadow: `0 0 4px ${rarityColor}` }} />
        <span className="auction-row__name">{auction.itemName}</span>
        <span className="auction-row__price">✦ {price}</span>
      </div>
    </Link>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="nbv-skeleton skel-row" />
      ))}
    </>
  );
}

function EmptyState({ icon, text, action }: { icon: string; text: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--rune-gray)', fontStyle: 'italic' }}>
      <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem', opacity: 0.5 }}>{icon}</div>
      <p style={{ fontSize: '0.85rem' }}>{text}</p>
      {action}
    </div>
  );
}

function TorchDecor() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{
        width: 14, height: 28,
        background: 'radial-gradient(ellipse at 50% 80%, #F5C842 0%, #C8860A 40%, #A81020 70%, transparent 100%)',
        borderRadius: '50% 50% 30% 30%',
        animation: 'torch-flicker 0.15s infinite alternate',
        filter: 'blur(1px)',
        boxShadow: '0 0 16px 6px rgba(200,134,10,0.4)',
      }}/>
      <div style={{ width: 4, height: 28, background: 'linear-gradient(180deg,#4A2800,#2A1500)', borderRadius: 1 }}/>
      <div style={{ width: 8, height: 3, background: '#3A2010', borderRadius: 1 }}/>
    </div>
  );
}
