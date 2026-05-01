import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/catalog',     label: 'Catálogo'    },
  { to: '/inventory',   label: 'Mi Inventario' },
  { to: '#',           label: 'Jugar Online',  disabled: true },
  { to: '#',           label: 'Misiones',      disabled: true },
  { to: '#',           label: 'Torneo',        disabled: true },
  { to: '#',           label: 'Subasta',       disabled: true },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      {/* blood stripe at top */}
      <div style={styles.bloodStripe} />
      <div style={styles.inner}>

        {/* Logo */}
        <Link to="/catalog" style={styles.logo}>
          <span style={styles.logoIcon}>☠</span>
          <span style={styles.logoText}>
            <span style={styles.logoNexus}>NEXUS</span>
            <span style={styles.logoBattles}> BATTLES</span>
            <span style={styles.logoV}> V</span>
          </span>
        </Link>

        {/* Nav links */}
        <ul style={styles.links}>
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              {link.disabled ? (
                <span style={styles.linkDisabled} title="Próximamente">{link.label}</span>
              ) : (
                <NavLink
                  to={link.to}
                  style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
                >
                  {link.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* User area */}
        <div style={styles.userArea}>
          {isAuthenticated ? (
            <div style={styles.userMenu}>
              <div style={styles.userInfo}>
                <span style={styles.userAvatar}>{user?.apodo?.[0]?.toUpperCase() || '?'}</span>
                <span style={styles.userName}>{user?.apodo}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: '0.82rem' }}>
                Salir
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login"    className="btn btn-outline" style={{ fontSize: '0.75rem' }}>Ingresar</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(5,3,3,0.96)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #2a0000',
    boxShadow: '0 2px 30px rgba(0,0,0,0.7), 0 0 20px rgba(150,0,0,0.1)',
  },
  bloodStripe: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #cc0000 20%, #ff2020 50%, #cc0000 80%, transparent)',
    boxShadow: '0 0 12px rgba(204,0,0,0.8)',
  },
  inner: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: '1.4rem',
    filter: 'drop-shadow(0 0 6px rgba(204,0,0,0.8))',
  },
  logoText: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 0,
  },
  logoNexus: {
    fontFamily: "'Press Start 2P', monospace",
    fontWeight: 400,
    fontSize: '0.62rem',
    color: '#cc0000',
    textShadow: '0 0 12px rgba(204,0,0,0.7), 0 0 24px rgba(204,0,0,0.3)',
    letterSpacing: '0.05em',
  },
  logoBattles: {
    fontFamily: "'Press Start 2P', monospace",
    fontWeight: 400,
    fontSize: '0.62rem',
    color: '#c9a84c',
    textShadow: '0 0 8px rgba(201,168,76,0.4)',
    letterSpacing: '0.03em',
  },
  logoV: {
    fontFamily: "'Press Start 2P', monospace",
    fontWeight: 400,
    fontSize: '0.62rem',
    color: '#ff2020',
    textShadow: '0 0 14px rgba(255,32,32,0.9)',
  },
  links: {
    display: 'flex',
    gap: '0.1rem',
    listStyle: 'none',
    flex: 1,
  },
  link: {
    color: '#8a93a8',
    textDecoration: 'none',
    fontSize: '0.78rem',
    padding: '0.35rem 0.65rem',
    borderRadius: '0',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: "'Exo 2', sans-serif",
  },
  linkActive: {
    color: '#ff2020',
    background: 'rgba(204,0,0,0.12)',
    borderBottom: '2px solid #cc0000',
  },
  linkDisabled: {
    color: '#3a3a3a',
    fontSize: '0.78rem',
    padding: '0.35rem 0.65rem',
    cursor: 'not-allowed',
    fontWeight: 500,
    textTransform: 'uppercase',
    fontFamily: "'Exo 2', sans-serif",
  },
  userArea: { marginLeft: 'auto', flexShrink: 0 },
  userMenu: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  userAvatar: {
    width: '32px', height: '32px',
    background: 'linear-gradient(135deg, #cc0000, #6b0000)',
    borderRadius: '0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: 700, color: '#ffcccc',
    border: '1px solid #cc0000',
    boxShadow: '0 0 8px rgba(204,0,0,0.4)',
    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
  },
  userName: { fontSize: '0.88rem', color: '#e8e6df', fontWeight: 500 },
};
