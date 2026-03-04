import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./pages/AppLayout";
import InventoryPage from "./pages/InventoryPage";

import PlayPage from "./pages/PlayPage";
import MissionsPage from "./pages/MissionsPage";
import TournamentPage from "./pages/TournamentPage";
import AuctionsPage from "./pages/AuctionsPage";
import AccountPage from "./pages/AccountPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Redirección a inventario como home (puedes cambiarlo) */}
          <Route path="/" element={<Navigate to="/inventory" replace />} />

          <Route path="/play" element={<PlayPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/tournament" element={<TournamentPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/account" element={<AccountPage />} />

          <Route path="*" element={<div style={{ padding: 24, color: "#d4c9a8" }}>404</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}