import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Catalog     from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import MyInventory from './pages/MyInventory';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Públicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalog"  element={<Catalog />} />
          <Route path="/catalog/:id" element={<ProductDetail />} />

          {/* Protegidas — requieren login */}
          <Route path="/inventory" element={
            <ProtectedRoute><MyInventory /></ProtectedRoute>
          } />

          {/* Default */}
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
