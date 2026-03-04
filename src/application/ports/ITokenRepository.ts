// Puerto para blacklist de tokens revocados (implementado en Redis o DB)
export interface ITokenRepository {
  blacklist(jti: string, expiresAt: Date): Promise<void>;
  isBlacklisted(jti: string): Promise<boolean>;
  storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  revokeRefreshToken(token: string): Promise<void>;
  isRefreshTokenValid(token: string): Promise<boolean>;
}
