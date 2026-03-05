import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Componentes
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Runas flotantes de fondo */}
      <div className="rune-bg">
        <span>⚔</span><span>🐉</span><span>✦</span><span>⚜</span><span>🗡</span><span>🛡</span>
      </div>

      <Routes>
        {/* Public routes - SIN NAVBAR */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected routes - CON NAVBAR */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <DashboardPage />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <InventoryPage />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/inventory/:id"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ItemDetailPage />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <MissionsPage />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/auctions"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <AuctionsPage />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/auctions/:id"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <AuctionDetailPage />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/rankings"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <RankingsPage />
              </>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ProfilePage />
              </>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}