/**
 * Navbar.tsx — Barra de navegación superior
 * Lee: authStore (usuario) + playerStore (monedas/rango en tiempo real)
 * Incluye: logo, nav links, contador de monedas, avatar, logout
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { useChatbotStore } from '@/store/chatbotStore';

const NAV_LINKS = [
  { to: '/dashboard',  label: 'Panel',     icon: '⚜' },
  { to: '/shop',       label: 'Tienda',    icon: '🏪' },
  { to: '/auctions',   label: 'Subastas',  icon: '⚔' },
  { to: '/missions',   label: 'Misiones',  icon: '🔮' },
  { to: '/inventory',  label: 'Inventario',icon: '🎒' },
  { to: '/rankings',   label: 'Ranking',   icon: '👑' },
];

export function Navbar() {
  const { player, logout } = useAuthStore();
  const profile = usePlayerStore((s) => s.profile);
  const unreadCount = useChatbotStore((s) => s.unreadCount);
  const toggleChatbot = useChatbotStore((s) => s.toggle);
  const navigate = useNavigate();

  const coins = profile?.gold ?? 0;
  const displayName = player?.username ?? profile?.username ?? '…';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="nbv-navbar">
      {/* Logo */}
      <NavLink to="/dashboard" className="nbv-navbar__logo">
        ⚔ Nexus Battles
      </NavLink>

      {/* Links */}
      <ul className="nbv-navbar__links">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `nbv-navbar__link${isActive ? ' nbv-navbar__link--active' : ''}`
              }
            >
              <span className="nbv-navbar__link-icon">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div className="nbv-navbar__right">
        {/* Monedas */}
        <div className="nbv-coins">
          <span className="nbv-coins-icon">✦</span>
          <span>{coins.toLocaleString()}</span>
        </div>

        {/* Chatbot trigger con badge */}
        <button
          className="nbv-navbar__chatbot-btn"
          onClick={toggleChatbot}
          title="NexusBot — Oráculo"
          aria-label="Abrir chatbot"
        >
          🔮
          {unreadCount > 0 && (
            <span className="nbv-navbar__chatbot-badge">{unreadCount}</span>
          )}
        </button>

        {/* Avatar + dropdown */}
        <div className="nbv-navbar__avatar-wrap">
          <button className="nbv-navbar__avatar" title={displayName}>
            {initial}
          </button>
          <div className="nbv-navbar__dropdown">
            <div className="nbv-navbar__dropdown-name">{displayName}</div>
            <div className="nbv-navbar__dropdown-role">
              {player?.role ?? 'PLAYER'}
            </div>
            <div className="nbv-divider" style={{ margin: '0.5rem 0' }}>
              <span className="nbv-divider-icon" style={{ fontSize: '0.6rem' }}>⚔</span>
            </div>
            <NavLink to="/profile" className="nbv-navbar__dropdown-item">
              ◈ Mi Perfil
            </NavLink>
            <button
              className="nbv-navbar__dropdown-item nbv-navbar__dropdown-item--danger"
              onClick={handleLogout}
            >
              ✗ Salir del Nexus
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
