// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

// Layout
import Navbar from '@/components/Navbar';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import AuctionsPage from '@/pages/AuctionsPage';
import AuctionDetailPage from '@/pages/AuctionDetailPage';
import MissionsPage from '@/pages/MissionsPage';
import InventoryPage from '@/pages/InventoryPage';
import ItemDetailPage from '@/pages/ItemDetailPage';
import RankingsPage from '@/pages/RankingsPage';
import ProfilePage from '@/pages/ProfilePage';
import ShopPage from '@/pages/ShopPage';
import AdminPage from '@/pages/AdminPage';
import AdminProductsPage from '@/pages/AdminProductsPage';
import HomePage from '@/pages/HomePage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import HeroDetailPage from '@/pages/HeroDetailPage'; // ✅ Asegúrate de tener este import

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function WithNavbar({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function TokenRefresher() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshToken = async () => {
      const token = localStorage.getItem('refreshToken');
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: token })
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.data.accessToken);
          console.log('✅ Token refrescado');
        }
      } catch (error) {
        console.error('Error refrescando token:', error);
      }
    };
    
    const interval = setInterval(refreshToken, 50 * 60 * 1000);
    refreshToken();
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <TokenRefresher />
      
      <div className="rune-bg">
        <span>⚔</span><span>🐉</span><span>✦</span><span>⚜</span><span>🗡</span><span>🛡</span>
      </div>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><WithNavbar><DashboardPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/auctions" element={<ProtectedRoute><WithNavbar><AuctionsPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/auctions/:id" element={<ProtectedRoute><WithNavbar><AuctionDetailPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/missions" element={<ProtectedRoute><WithNavbar><MissionsPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><WithNavbar><InventoryPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/inventory/:id" element={<ProtectedRoute><WithNavbar><ItemDetailPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/rankings" element={<ProtectedRoute><WithNavbar><RankingsPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><WithNavbar><ProfilePage /></WithNavbar></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute><WithNavbar><ShopPage /></WithNavbar></ProtectedRoute>} />
        
        {/* ✅ PRODUCTOS (armas, pociones, armaduras, artefactos) */}
        <Route path="/product/:id" element={<ProtectedRoute><WithNavbar><ProductDetailPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/item/:id" element={<ProtectedRoute><WithNavbar><ProductDetailPage /></WithNavbar></ProtectedRoute>} />
        
        {/* ✅ HÉROES (usando HeroDetailPage) */}
        <Route path="/hero/:id" element={<ProtectedRoute><WithNavbar><HeroDetailPage /></WithNavbar></ProtectedRoute>} />
        
        <Route path="/admin" element={<ProtectedRoute><WithNavbar><AdminPage /></WithNavbar></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><WithNavbar><AdminProductsPage /></WithNavbar></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}