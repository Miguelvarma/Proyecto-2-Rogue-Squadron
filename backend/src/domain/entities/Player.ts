export type PlayerRole = 'PLAYER' | 'MODERATOR' | 'ADMIN';

export interface Player {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: PlayerRole;
  rank: number;
  coins: number;
  createdAt: Date;
  updatedAt: Date;
}
