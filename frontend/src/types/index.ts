// ══════════════════════════════════════════════════════
// TIPOS COMPARTIDOS — Espejo de las entidades del backend
// El front NUNCA calcula lógica de negocio con estos tipos,
// solo los usa para tipar las respuestas de la API.
// ══════════════════════════════════════════════════════

export type PlayerRole = 'PLAYER' | 'ADMIN' | 'MODERATOR';
export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type ItemType = 'WEAPON' | 'ARMOR' | 'SPELL' | 'POTION' | 'ARTIFACT';
export type MissionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';
export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
export type AuctionStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export interface PublicPlayer {
  id: string;
  username: string;
  role: PlayerRole;
  rank: number;
  gold: number;
  xp: number;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  placedAt: string;
}

export interface Auction {
  id: string;
  itemId: string;
  itemName: string;
  rarity: ItemRarity;
  startingPrice: number;
  currentPrice: number;
  currentWinnerId: string | null;
  status: AuctionStatus;
  endsAt: string;
  createdAt: string;
  bids: Bid[];
}

export interface MissionObjective {
  description: string;
  target: number;
  current: number;
  completed: boolean;
}

export interface Mission {
  id: string;
  playerId: string;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  objectives: MissionObjective[];
  reward: { gold: number; xp: number };
  status: MissionStatus;
  aiNarrative: string;
  expiresAt: string;
  createdAt: string;
  completedAt: string | null;
}

export interface InventoryItem {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  stats: {
    attack?: number;
    defense?: number;
    magic?: number;
    agility?: number;
    critChance?: number;
  };
  isEquipped: boolean;
  acquiredAt: string;
}

// ── API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string[]>;
}

// ── Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  player: {
    id: string;
    email: string;
    apodo: string;
    rol: 'PLAYER' | 'ADMIN' | 'MODERATOR';
  };
}
