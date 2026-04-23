// ══════════════════════════════════════════════════════════════
//  DOMAIN — Payment Entities
//  Extraídas del .tsx original. Sin dependencias externas.
// ══════════════════════════════════════════════════════════════

export interface TokenPackage {
  id:           string;
  name:         string;
  tokens:       number;
  bonusTokens:  number;
  priceUSD:     number;
  priceCOP:     number;
  highlight:    boolean;
  description:  string;
  icon:         string;
  rarity:       'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface CardData {
  number:  string;
  expiry:  string;
  cvv:     string;
  holder:  string;
}

export interface PaymentTransaction {
  transactionId: string;
  status:        'APPROVED' | 'DECLINED';
  gateway:       string;
  approvedAt:    string;
  last4:         string;
  amount:        number;
}

// ── Catálogo de paquetes (del .tsx original) ─────────────────
export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'pkg-starter',  name: 'Bolsa del Novato',       tokens: 500,  bonusTokens: 0,    priceUSD: 4.99,  priceCOP: 21900,  highlight: false, description: 'El primer paso hacia la leyenda.',              icon: '💰', rarity: 'COMMON'    },
  { id: 'pkg-warrior',  name: 'Tesoro del Guerrero',    tokens: 1200, bonusTokens: 150,  priceUSD: 9.99,  priceCOP: 43900,  highlight: false, description: 'Un equilibrio de poder y valor.',              icon: '⚔️', rarity: 'RARE'      },
  { id: 'pkg-champion', name: 'Cofre del Campeón',      tokens: 3000, bonusTokens: 600,  priceUSD: 19.99, priceCOP: 87900,  highlight: true,  description: 'El favorito de los grandes conquistadores.',   icon: '🏆', rarity: 'EPIC'      },
  { id: 'pkg-legend',   name: 'Arcas Legendarias',      tokens: 8000, bonusTokens: 2400, priceUSD: 49.99, priceCOP: 219900, highlight: false, description: 'Para quienes dominan el Nexus.',               icon: '🐉', rarity: 'LEGENDARY' },
];

// ── Domain Service: validación y formateo de tarjeta ─────────
export const CardDomainService = {
  formatNumber(v: string): string {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  },
  formatExpiry(v: string): string {
    const n = v.replace(/\D/g, '').slice(0, 4);
    return n.length >= 3 ? n.slice(0, 2) + '/' + n.slice(2) : n;
  },
  validate(card: CardData): Record<string, string> {
    const e: Record<string, string> = {};
    if (card.number.replace(/\s/g, '').length < 16) e.number = 'Número de tarjeta inválido';
    if (card.expiry.length < 5)                      e.expiry = 'Fecha inválida (MM/AA)';
    if (card.cvv.length < 3)                         e.cvv    = 'CVV inválido';
    if (card.holder.trim().length < 3)               e.holder = 'Nombre muy corto';
    return e;
  },
};
