import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number).default('3306'),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_POOL_LIMIT: z.string().transform(Number).default('10'),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET debe tener al menos 64 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(64),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  HMAC_SECRET: z.string().min(32),
  AI_API_KEY: z.string(),
  AI_API_URL: z.string().url(),
  PAYMENT_API_KEY: z.string(),
  PAYMENT_WEBHOOK_SECRET: z.string(),
  DEFAULT_PAYMENT_GATEWAY: z.enum(['mercadopago', 'stripe', 'mock']).default('mock'),
  APP_BASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().optional(),
  CORS_ORIGIN: z.string(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Variables de entorno invalidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
