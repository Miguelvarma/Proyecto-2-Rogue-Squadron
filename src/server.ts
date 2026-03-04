import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './infrastructure/logging/logger';
import { errorHandler } from './infrastructure/http/middlewares/errorHandler';
import { testConnection } from './infrastructure/database/connection';
import authRoutes from './infrastructure/http/routes/authRoutes';
import auctionRoutes from './infrastructure/http/routes/auctionRoutes';
import missionRoutes from './infrastructure/http/routes/missionRoutes';
import paymentRoutes from './infrastructure/http/routes/paymentRoutes';
import playerRoutes from './infrastructure/http/routes/playerRoutes';

const app = express();

// ============ SEGURIDAD PERIMETRAL ============
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Capturar raw body para validacion HMAC en webhooks
app.use((req, _res, next) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => { (req as any).rawBody = data; next(); });
});

app.use(express.json());

// Rate limiting global
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true });
const sensitiveLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true });

app.use('/api', globalLimiter);
app.use('/api/v1/auth', sensitiveLimiter);
app.use('/api/v1/payments', sensitiveLimiter);

// ============ RUTAS ============
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/players', playerRoutes);
app.use('/api/v1/auctions', auctionRoutes);
app.use('/api/v1/missions', missionRoutes);
app.use('/api/v1/payments', paymentRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

// ============ ERROR HANDLER GLOBAL ============
app.use(errorHandler);

// ============ ARRANQUE ============
async function bootstrap() {
  await testConnection();
  logger.info('Conexion a MySQL establecida');
  app.listen(env.PORT, () => {
    logger.info(`Servidor corriendo en puerto ${env.PORT} [${env.NODE_ENV}]`);
  });
}

bootstrap().catch(err => {
  logger.error('Error al iniciar el servidor', { error: err });
  process.exit(1);
});
