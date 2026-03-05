import { Request, Response, NextFunction } from 'express';
import { HmacValidator } from '../../security/HmacValidator';
import { logSecurityEvent } from '../../logging/logger';

const hmacValidator = new HmacValidator();

export const validateHmac = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const signature = req.headers['x-hmac-signature'] as string;
  const timestamp = parseInt(req.headers['x-timestamp'] as string, 10);

  if (!signature || !timestamp) {
    logSecurityEvent('hmacFail', {
      ip: req.ip || '',
      payload: 'missing-headers',
    });

    res.status(401).json({ error: 'Firma HMAC requerida' });
    return;
  }

  const isValid = hmacValidator.validateWithTimestamp(
    req.body,
    signature,
    timestamp,
    300
  );

  if (!isValid) {
    logSecurityEvent('hmacFail', {
      ip: req.ip || '',
      payload: req.body,
    });

    res.status(401).json({ error: 'Firma HMAC inválida' });
    return;
  }

  next();
};