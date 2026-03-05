/**
 * Sidebar.tsx — Panel lateral izquierdo
 * Muestra: tarjeta del jugador, barra de XP, stats rápidos, navegación secundaria
 * Lee: playerStore (datos en tiempo real)
 */
import { NavLink } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';

const SIDEBAR_LINKS = [
  { to: '/dashboard',  label: 'Panel de Control', icon: '⚜' },
  { to: '/shop',       label: 'Tienda Imperial',   icon: '🏪' },
  { to: '/auctions',   label: 'Casa de Subastas',  icon: '⚔' },
  { to: '/missions',   label: 'Misiones Arcanas',  icon: '🔮' },
  { to: '/inventory',  label: 'Inventario',        icon: '🎒' },
  { to: '/rankings',   label: 'Tabla de Honor',    icon: '👑' },
  { to: '/profile',    label: 'Mi Pergamino',      icon: '📜' },
];

function getRankTitle(rank: number): string {
  if (rank >= 100) return 'Leyenda Inmortal';
  if (rank >= 75)  return 'Campeón del Nexus';
  if (rank >= 50)  return 'Veterano de Guerra';
  if (rank >= 25)  return 'Caballero Arcano';
  if (rank >= 10)  return 'Escudero Valiente';
  return 'Recluta';
}

export function Sidebar() {
  const { player } = useAuthStore();
  const { profile, isLoading } = usePlayerStore();

  const username = player?.username ?? profile?.username ?? '…';
  const rank = profile?.rank ?? 0;
  const gold = profile?.gold ?? 0;
  const xp = profile?.xp ?? 0;
  const initial = username.charAt(0).toUpperCase();

  // XP simulado como porcentaje (en producción vendrá del backend)
  const xpPercent = Math.min((xp % 1000) / 10, 100);

  return (
    <aside className="nbv-sidebar">
      {/* Tarjeta del jugador */}
      <div className="nbv-sidebar__player-card">
        <div className="nbv-sidebar__avatar">
          {isLoading ? '⋯' : initial}
        </div>
        <div className="nbv-sidebar__player-name">
          {isLoading ? <span className="nbv-skeleton" style={{ height: '14px', width: '80px', display: 'block' }} /> : username}
        </div>
        <div className="nbv-sidebar__player-rank">
          {getRankTitle(rank)}
        </div>
        {/* Barra de XP */}
        <div className="nbv-sidebar__xp-label">
          XP — {xp.toLocaleString()}
        </div>
        <div className="nbv-progress-track" style={{ marginTop: '0.4rem' }}>
          <div
            className="nbv-progress-fill"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="nbv-sidebar__stats">
        <div className="nbv-sidebar__stats-label">Estadísticas</div>
        <div className="nbv-sidebar__stat">
          <span>Rango</span>
          <span className="nbv-sidebar__stat-val text-gold">#{rank}</span>
        </div>
        <div className="nbv-sidebar__stat">
          <span>Monedas</span>
          <span className="nbv-sidebar__stat-val text-gold">✦ {gold.toLocaleString()}</span>
        </div>
        <div className="nbv-sidebar__stat">
          <span>Rol</span>
          <span className="nbv-sidebar__stat-val">
            <span className="nbv-badge nbv-badge-arcane" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
              {player?.role ?? 'PLAYER'}
            </span>
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="nbv-sidebar__nav">
        <div className="nbv-sidebar__stats-label" style={{ marginBottom: '0.5rem' }}>Navegación</div>
        {SIDEBAR_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nbv-sidebar__link${isActive ? ' nbv-sidebar__link--active' : ''}`
            }
          >
            <span className="nbv-sidebar__link-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
