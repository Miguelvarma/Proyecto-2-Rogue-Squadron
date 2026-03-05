"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ConfigSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']),
    PORT: zod_1.z.string().transform(Number),
    DB_HOST: zod_1.z.string().min(1),
    DB_PORT: zod_1.z.string().transform(Number),
    DB_NAME: zod_1.z.string().min(1),
    DB_USER: zod_1.z.string().min(1),
    DB_PASSWORD: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(64, 'JWT_SECRET mínimo 64 caracteres'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(64),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    HMAC_SECRET: zod_1.z.string().min(32),
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(12)),
    REDIS_URL: zod_1.z.string().url(),
    CORS_ORIGIN: zod_1.z.string().url(),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default(900000),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default(100),
});
const parseConfig = () => {
    try {
        return ConfigSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('❌ Error de configuración:');
            error.issues.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
};
exports.config = parseConfig();
