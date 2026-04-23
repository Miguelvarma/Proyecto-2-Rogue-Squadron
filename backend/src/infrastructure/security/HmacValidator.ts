/**
 * HmacValidator.ts — Infrastructure / Security
 * FIX: import de config corregido. Coma extra en ruta '../../config/index,' eliminada.
 *      Reemplazado por import directo de env.
 */

import crypto from 'crypto';
import { env } from '../../config/env';

export class HmacValidator {
  private readonly secret: string;

  constructor() {
    this.secret = env.HMAC_SECRET;
  }

  sign(payload: string | object): string {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', this.secret).update(data).digest('hex');
  }

  validate(payload: string | object, signature: string): boolean {
    const expectedSignature = this.sign(payload);
    const expectedBuffer    = Buffer.from(expectedSignature);
    const signatureBuffer   = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) return false;

    try {
      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch {
      return false;
    }
  }

  validateWithTimestamp(
    payload: string | object,
    signature: string,
    timestamp: number,
    maxAgeSeconds = 300
  ): boolean {
    const now = Math.floor(Date.now() / 1000);
    const age = now - timestamp;
    if (age > maxAgeSeconds || age < 0) return false;
    return this.validate(payload, signature);
  }
}
