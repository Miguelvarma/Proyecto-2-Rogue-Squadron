import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().transform(Number),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  
  JWT_SECRET: z.string().min(64, 'JWT_SECRET mínimo 64 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(64),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  HMAC_SECRET: z.string().min(32),
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(12)),
  
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
});

const parseConfig = () => {
  try {
    return ConfigSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Error de configuración:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseConfig();
export type Config = z.infer<typeof ConfigSchema>;