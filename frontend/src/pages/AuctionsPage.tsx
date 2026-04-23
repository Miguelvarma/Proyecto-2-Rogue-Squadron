// ══════════════════════════════════════════════════════════════
//  AuctionsPage — Página que monta el módulo hexagonal
//  Subastas + Pasarela de Tokens del remixed-f0776914.tsx
// ══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { AuctionsModule }     from '@/modules/auctions';
import { TokenGatewayModule } from '@/modules/payments';
import { useAuthStore }       from '@/store/authStore';

export default function AuctionsPage() {
  const player = useAuthStore(s => s.player);
  const [showTokenGateway, setShowTokenGateway] = useState(false);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 2.5rem' }}>
      {/* Módulo de Subastas (arquitectura hexagonal) */}
      <AuctionsModule onTokensNeeded={() => setShowTokenGateway(true)} />

      {/* Modal de compra de tokens (arquitectura hexagonal) */}
      {showTokenGateway && (
        <TokenGatewayModule
          playerId={player?.id ?? 'guest'}
          onClose={() => setShowTokenGateway(false)}
          onPurchaseComplete={(_tokensAdded) => {
            // Aquí se puede disparar un refresh del perfil si el backend lo soporta
            setShowTokenGateway(false);
          }}
        />
      )}
    </div>
  );
}
