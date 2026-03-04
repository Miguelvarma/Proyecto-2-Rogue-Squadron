import winston from 'winston';
import { env } from '../../config/env';

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'nexus-battles-v' },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'development'
        ? winston.format.combine(winston.format.colorize(), winston.format.simple())
        : winston.format.json(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/audit.log', level: 'info' }),
  ],
});

// Helpers de auditoria
export const audit = {
  login: (userId: string, ip: string, success: boolean) =>
    logger.info('auth.login', { userId, ip, success }),
  auctionBid: (auctionId: string, bidderId: string, amount: number) =>
    logger.info('auction.bid', { auctionId, bidderId, amount }),
  paymentProcessed: (transactionId: string, playerId: string, amount: number) =>
    logger.info('payment.processed', { transactionId, playerId, amount }),
  missionCompleted: (missionId: string, playerId: string, reward: number) =>
    logger.info('mission.completed', { missionId, playerId, reward }),
  rankChange: (playerId: string, oldRank: number, newRank: number) =>
    logger.info('player.rankChange', { playerId, oldRank, newRank }),
  securityHmacFail: (ip: string, route: string) =>
    logger.warn('security.hmacFail', { ip, route, severity: 'HIGH' }),
  rateLimitHit: (ip: string, route: string) =>
    logger.warn('security.rateLimitHit', { ip, route }),
};
