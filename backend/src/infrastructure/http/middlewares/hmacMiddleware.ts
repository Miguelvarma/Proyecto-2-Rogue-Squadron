import { Request, Response, NextFunction } from 'express';
import { validateHMAC } from '../../security/hmac';

const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

export function hmacMiddleware(req: Request, res: Response, next: NextFunction): void {
  const signature = req.headers['x-signature'] as string;
  const timestamp = req.headers['x-timestamp'] as string;

  if (!signature || !timestamp) {
    res.status(401).json({ error: 'Firma y timestamp requeridos' });
    return;
  }

  // Proteccion contra replay attacks
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Date.now() - ts > REPLAY_WINDOW_MS) {
    res.status(401).json({ error: 'Timestamp fuera de ventana permitida' });
    return;
  }

  const rawBody = (req as any).rawBody?.toString() ?? JSON.stringify(req.body);
  const payload = `${timestamp}.${rawBody}`;

  if (!validateHMAC(payload, signature)) {
    res.status(401).json({ error: 'Firma HMAC invalida' });
    return;
  }

  next();
}
