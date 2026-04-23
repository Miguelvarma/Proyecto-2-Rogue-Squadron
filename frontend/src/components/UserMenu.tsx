// src/components/UserMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  // Verificar si es admin (comprobar diferentes formatos de rol)
  const isAdmin = user?.role === 'admin' || 
                  user?.role === 'ADMIN' || 
                  user?.role === 'administrator' ||
                  user?.isAdmin === true;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Botón de usuario */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(135deg, #2A1F16, #1C1510)',
          border: `1px solid ${isAdmin ? '#C8860A' : 'rgba(200,134,10,0.3)'}`,
          borderRadius: '40px',
          padding: '0.3rem 0.8rem 0.3rem 0.3rem',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
      >
        {/* Avatar con borde diferenciado para admin */}
        <div style={{
          width: '32px',
          height: '32px',
          background: isAdmin 
            ? 'linear-gradient(135deg, #F5C842, #C8860A)' 
            : 'linear-gradient(135deg, #C8860A, #8B5E00)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: '#0A0705',
          fontSize: '14px'
        }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <span style={{ color: '#F5C842', fontSize: '12px' }}>▼</span>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '45px',
          right: '0',
          width: '300px',
          background: 'linear-gradient(145deg, #1C1510, #120E0A)',
          border: `1px solid ${isAdmin ? '#C8860A' : 'rgba(200,134,10,0.3)'}`,
          borderRadius: '12px',
          zIndex: 1000,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          {/* Header del menú */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid rgba(200,134,10,0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: isAdmin 
                ? 'linear-gradient(135deg, #F5C842, #C8860A)' 
                : 'linear-gradient(135deg, #C8860A, #8B5E00)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.8rem',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              boxShadow: isAdmin ? '0 0 15px rgba(200,134,10,0.5)' : 'none'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h4 style={{ color: '#F5C842', marginBottom: '0.2rem' }}>{user?.name || user?.username || 'Aventurero'}</h4>
            <p style={{ color: '#B89A6A', fontSize: '0.75rem' }}>{user?.email}</p>
            
            {/* Badge de rol diferenciado */}
            <div style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              padding: '0.3rem 0.8rem',
              background: isAdmin ? 'rgba(200,134,10,0.2)' : 'rgba(74,21,128,0.2)',
              border: `1px solid ${isAdmin ? '#C8860A' : '#7B35D0'}`,
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              color: isAdmin ? '#F5C842' : '#B06EFF'
            }}>
              {isAdmin ? '👑 ADMINISTRADOR' : '⚔️ AVENTURERO'}
            </div>
          </div>

          {/* Estadísticas (solo para jugadores normales) */}
          {!isAdmin && (
            <div style={{
              padding: '0.8rem 1rem',
              display: 'flex',
              justifyContent: 'space-around',
              borderBottom: '1px solid rgba(200,134,10,0.1)',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#F5C842' }}>💰</div>
                <div style={{ fontSize: '0.8rem', color: '#F5C842' }}>4,820</div>
                <div style={{ fontSize: '0.6rem', color: '#B89A6A' }}>Oro</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#B06EFF' }}>⚡</div>
                <div style={{ fontSize: '0.8rem', color: '#B06EFF' }}>85</div>
                <div style={{ fontSize: '0.6rem', color: '#B89A6A' }}>Energía</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#28C060' }}>🏆</div>
                <div style={{ fontSize: '0.8rem', color: '#28C060' }}>47</div>
                <div style={{ fontSize: '0.6rem', color: '#B89A6A' }}>Victorias</div>
              </div>
            </div>
          )}

          {/* Opciones para ADMIN */}
          {isAdmin && (
            <div style={{ padding: '0.5rem 0' }}>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'rgba(200,134,10,0.1)',
                fontSize: '0.7rem',
                color: '#C8860A',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Panel de Control
              </div>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '0.7rem 1rem',
                  color: '#F5C842',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,134,10,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>👑</span> Panel de Administración
              </Link>
              <Link
                to="/admin/heroes"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '0.7rem 1rem',
                  color: '#F0DEB0',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,134,10,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>⚔️</span> Gestionar Héroes
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '0.7rem 1rem',
                  color: '#F0DEB0',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,134,10,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>👥</span> Gestionar Usuarios
              </Link>
            </div>
          )}

          {/* Opciones para TODOS los usuarios */}
          <div style={{ padding: '0.5rem 0' }}>
            <div style={{
              padding: '0.5rem 1rem',
              background: 'rgba(0,0,0,0.2)',
              fontSize: '0.7rem',
              color: '#B89A6A',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Mi Cuenta
            </div>
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.7rem 1rem',
                color: '#F0DEB0',
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,134,10,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>👤</span> Mi Perfil
            </Link>
            
            <Link
              to="/inventory"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.7rem 1rem',
                color: '#F0DEB0',
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,134,10,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>🎒</span> Mi Inventario
            </Link>

            <Link
              to="/shop"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.7rem 1rem',
                color: '#F0DEB0',
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,134,10,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>🛒</span> Tienda
            </Link>

            <div style={{
              height: '1px',
              background: 'rgba(200,134,10,0.1)',
              margin: '0.3rem 0'
            }} />

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                width: '100%',
                padding: '0.7rem 1rem',
                background: 'transparent',
                border: 'none',
                color: '#FF8A8A',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(168,16,32,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>🚪</span> Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
    // En src/components/UserMenu.tsx, dentro de las opciones de admin:

{isAdmin && (
  <>
    <div style={{
      padding: '0.5rem 1rem',
      background: 'rgba(200,134,10,0.1)',
      fontSize: '0.7rem',
      color: '#C8860A',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      Panel de Control
    </div>
    <Link
      to="/admin"
      onClick={() => setIsOpen(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.7rem 1rem',
        color: '#F5C842',
        textDecoration: 'none',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,134,10,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span>⚔️</span> Gestionar Héroes
    </Link>
    <Link
      to="/admin/products"
      onClick={() => setIsOpen(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.7rem 1rem',
        color: '#F5C842',
        textDecoration: 'none',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200,134,10,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span>🏆</span> Gestionar Productos
    </Link>
  </>
)}
  