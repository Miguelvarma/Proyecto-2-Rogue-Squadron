/**
 * server.ts — Entry point — THE NEXUS BATTLES V
 */

import express   from 'express';
import helmet    from 'helmet';
import cors      from 'cors';
import rateLimit from 'express-rate-limit';
import { env }   from './config/env';
import { logger } from './infrastructure/logging/logger';
import { errorHandler }   from './infrastructure/http/middlewares/errorHandler';
// Importamos ÚNICAMENTE la función de prueba, el pool se queda en su archivo
import { testConnection } from './infrastructure/database/connection';

// ── Rutas v1 ────────────────────────────────────────────────
import authRoutes    from './infrastructure/http/routes/authRoutes';

// ── Rutas con factory (Inventario) ─────────────────────────
import { createInventoryRoutes } from './infrastructure/http/routes/inventory.routes';

// ── Rutas con factory (Rating) ───────────────────────────────
import { createRatingRoutes } from './infrastructure/http/routes/rating.routes';

// ── Repositorios ──────────────────────────────────────────────────────────────
import { MySQLItemRepository }    from './infrastructure/repositories/MySQLItemRepository';
import { MySQLRatingRepository }  from './infrastructure/repositories/MySQLRatingRepository';
import { MySQLProductRepository } from './infrastructure/repositories/MySQLProductRepository';

// ── Use Cases (Inventario) ─────────────────────────────────────────────────────
import { SearchItems }       from './application/usecases/inventory/SearchItem';
import { GetItems }          from './application/usecases/inventory/GetItem';
import { GetItemById }       from './application/usecases/inventory/GetItemById';
import { DeleteItem }        from './application/usecases/inventory/DeleteItem';
import { CreateItem }        from './application/usecases/inventory/CreateItem';
import { UpdateItem }        from './application/usecases/inventory/UpdateItem';
import { SoftDeleteItem }    from './application/usecases/inventory/SoftDeleteItem';
import { ReactivateItem }    from './application/usecases/inventory/ReactivateItem';
import { GetUserInventory }  from './application/usecases/inventory/GetUserInventory';
//creamos el producti(son las aemas, raro,mitico...ect)
import { createProductRoutes } from './infrastructure/http/routes/product.routes';

// ── Controladores con DI (Inventario) ──────────────────────────────────────────
import { InventoryController } from './infrastructure/http/controllers/InventoryController';
import { RatingController } from './infrastructure/http/controllers/RatingController';

// ── Servicios ──────────────────────────────────────────────────────────────────
import { RatingService } from './domain/services/RatingService';

// ═══════════════════════════════════════════════════════════════════════════════
// TUS HÉROES - AGREGADO
// ═══════════════════════════════════════════════════════════════════════════════
import { MySQLHeroRepository } from './infrastructure/repositories/MySQLHeroRepository';
import { HeroController } from './infrastructure/http/controllers/HeroController';
import { CrearHeroe } from './application/usecases/Heroes/CrearHeroe';
import { ObtenerHeroes } from './application/usecases/Heroes/ObtenerHeroes';
import { ObtenerHeroePorId } from './application/usecases/Heroes/ObtenerHeroePorId';
import { ActualizarHeroe } from './application/usecases/Heroes/ActualizarHeroe';
import { EliminarHeroe } from './application/usecases/Heroes/EliminarHeroe';
import { createHeroRoutes } from './infrastructure/http/routes/hero.routes';

// ============================================================
// INYECCIÓN DE DEPENDENCIAS
// ============================================================

// ── Inventario ──────────────────────────────────────────────
const itemRepository      = new MySQLItemRepository();
const inventoryController = new InventoryController(
  new SearchItems(itemRepository),
  new GetItems(itemRepository),
  new GetItemById(itemRepository),
  new DeleteItem(itemRepository),
  new CreateItem(itemRepository),
  new UpdateItem(itemRepository),
  new SoftDeleteItem(itemRepository),
  new ReactivateItem(itemRepository),
  new GetUserInventory(itemRepository),
);

// Rating
const ratingRepository   = new MySQLRatingRepository();
const productRepository  = new MySQLProductRepository();
const ratingService      = new RatingService(ratingRepository, productRepository);
const ratingController   = new RatingController(ratingService);

// Heroes
const heroRepository = new MySQLHeroRepository();
const heroController = new HeroController(
  new CrearHeroe(heroRepository),
  new ObtenerHeroes(heroRepository),
  new ObtenerHeroePorId(heroRepository),
  new ActualizarHeroe(heroRepository),
  new EliminarHeroe(heroRepository)
);

// Auth helpers
// ============================================================
// EXPRESS APP
// ============================================================
const app = express();

// ✅ PRIMERO: Middlewares de seguridad y CORS
app.use(helmet());
app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ SEGUNDO: Middlewares de parsing (con límite para imágenes)
app.use(express.json({
  limit: '50mb',
  verify: (req: any, _res, buf) => { req.rawBody = buf.toString(); },
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Rate limiting ──────────────────────────────────────────────────────────────
const isDev = env.NODE_ENV === 'development';

const noOpMiddleware = (req: any, res: any, next: any) => next();

const globalLimiter    = isDev ? noOpMiddleware : rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true });
const sensitiveLimiter = isDev ? noOpMiddleware : rateLimit({ windowMs: 15 * 60 * 1000, max: 20,  standardHeaders: true });
const inventoryLimiter = isDev ? noOpMiddleware : rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false, skipFailedRequests: true });

app.use('/api',             globalLimiter);
app.use('/api/v1/auth',     sensitiveLimiter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status: 'ok', env: env.NODE_ENV, version: '5.0.0',
  timestamp: new Date().toISOString(),
}));

// ============================================================
// RUTAS (TERCERO)
// ============================================================
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/inventory', inventoryLimiter, createInventoryRoutes(inventoryController));
app.use('/api/v1/products', createRatingRoutes(ratingController));

// ═══════════════════════════════════════════════════════════════════════════════
// ── TUS RUTAS ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
app.use('/api/v1', createHeroRoutes(heroController));
app.use('/api/v1', createProductRoutes());  // ✅ AHORA SÍ, después del CORS

app.use(errorHandler);

// ============================================================
// ARRANQUE
// ============================================================
async function bootstrap() {
  try {
    // Esta función se importa de ./infrastructure/database/connection
    await testConnection();
    logger.info('Conexión a MySQL/TiDB establecida');
    
    app.listen(env.PORT, () => {
      logger.info(`Servidor corriendo en puerto ${env.PORT} [${env.NODE_ENV}]`);
      console.log('\n  THE NEXUS BATTLES V — API Unificada');
      console.log('═'.repeat(70));
      console.log(` Servidor: http://localhost:${env.PORT}`);
      console.log(` Health:   GET http://localhost:${env.PORT}/health`);
      console.log(` Heroes:   GET http://localhost:${env.PORT}/api/v1/heroes`);
      console.log(` Products: GET http://localhost:${env.PORT}/api/v1/products`);
      console.log('═'.repeat(70));
    });
  } catch (err: any) {
    console.error('\n ERROR CRÍTICO AL CONECTAR A LA BASE DE DATOS:');
    console.error(`Mensaje: ${err.message}`);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('\nERROR CRÍTICO AL INICIAR EL SERVIDOR:');
  console.error(err);
  process.exit(1);
});

export default app;