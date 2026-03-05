/**
 * App.tsx — Punto de entrada React con React Router v6
 *
 * CAMBIOS vs versión anterior:
 *   1. MainLayout envuelve TODAS las rutas protegidas vía <Outlet>
 *   2. ChatbotBubble vive dentro del MainLayout (aparece en todas las páginas)
 *   3. playerStore se hidrata desde MainLayout.useEffect (no desde aquí)
 *   4. Rutas públicas (login/register) NO tienen sidebar/chatbot
 */
import '@/styles/globals.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/layouts/MainLayout';

// Páginas
import LoginPage      from '@/pages/LoginPage';
import RegisterPage   from '@/pages/RegisterPage';
import DashboardPage  from '@/pages/DashboardPage';
import AuctionsPage   from '@/pages/AuctionsPage';
import AuctionDetailPage from '@/pages/AuctionDetailPage';
import MissionsPage   from '@/pages/MissionsPage';
import InventoryPage  from '@/pages/InventoryPage';
import RankingsPage   from '@/pages/RankingsPage';
import ProfilePage    from '@/pages/ProfilePage';
import ShopPage       from '@/pages/ShopPage';

/** Ruta protegida: redirige a /login si no hay sesión */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Ruta pública: redirige al dashboard si ya hay sesión */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rutas públicas (sin layout) ─────────────────── */}
        <Route
          path="/login"
          element={<GuestRoute><LoginPage /></GuestRoute>}
        />
        <Route
          path="/register"
          element={<GuestRoute><RegisterPage /></GuestRoute>}
        />

        {/* ── Rutas protegidas (con MainLayout) ───────────── */}
        {/*
          MainLayout contiene: Navbar + Sidebar + <Outlet> + ChatbotBubble
          Todas las páginas hijas se renderizan en el <Outlet>
        */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"        element={<DashboardPage />} />
          <Route path="/shop"             element={<ShopPage />} />
          <Route path="/auctions"         element={<AuctionsPage />} />
          <Route path="/auctions/:id"     element={<AuctionDetailPage />} />
          <Route path="/missions"         element={<MissionsPage />} />
          <Route path="/inventory"        element={<InventoryPage />} />
          <Route path="/rankings"         element={<RankingsPage />} />
          <Route path="/profile"          element={<ProfilePage />} />
        </Route>

        {/* ── Fallback ─────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
