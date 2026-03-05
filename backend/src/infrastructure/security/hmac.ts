import crypto from 'crypto';
import { env } from '../../config/env';

/**
 * Genera una firma HMAC-SHA256 para un payload.
 */
export function generateHMAC(payload: string): string {
  return crypto.createHmac('sha256', env.HMAC_SECRET).update(payload).digest('hex');
}

/**
 * Valida una firma HMAC usando comparacion de tiempo constante
 * para prevenir timing attacks.
 */
export function validateHMAC(payload: string, receivedSignature: string): boolean {
  const expected = generateHMAC(payload);
  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(receivedSignature.replace('sha256=', ''), 'hex');

  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
