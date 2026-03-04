import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../src/config/index,';
import { logger } from './infrastructure/logging/logger';
import { errorHandler } from './infrastructure/http/middlewares/errorHandler.middleware';
import { generalLimiter } from './infrastructure/http/middlewares/rateLimiter.middleware';

// Adaptadores
import { UserRepositoryMySQL } from './infrastructure/persitence/repositories/UserRepositoryMysql';
import { ItemRepositoryMySQL } from './infrastructure/persitence/repositories/ItemRepositoryMySQL';
import { BcryptHasher } from './infrastructure/security/BcrypHasher';
import { JwtTokenService } from './infrastructure/security/JwtTokenServices';
import { EmailService } from './infrastructure/gateways/EmailService';

// Use Cases
import { RegisterUser } from './application/usecases/auth/RegisterUser';
import { SearchItems } from './application/usecases/inventory/SearchItem';
import { GetItems } from './application/usecases/inventory/GetItem';
import { GetItemById } from './application/usecases/inventory/GetItemById';
import { DeleteItem } from './application/usecases/inventory/DeleteItem';

// Controllers
import { AuthController } from './infrastructure/http/controllers/AuthController';
import { InventoryController } from './infrastructure/http/controllers/InventoryController';

// Routes
import { createAuthRoutes } from './infrastructure/http/routes/auth.routes';
import { createInventoryRoutes } from './infrastructure/http/routes/inventory.routes';

// ============================================
// DEPENDENCY INJECTION
// ============================================

// Repositories
const userRepository = new UserRepositoryMySQL();
const itemRepository = new ItemRepositoryMySQL();

// Services
const passwordHasher = new BcryptHasher();
const tokenService = new JwtTokenService();
const emailService = new EmailService();

// Use Cases - Auth
const registerUser = new RegisterUser(
  userRepository,
  passwordHasher,
  tokenService,
  emailService
);

// Use Cases - Inventory
const searchItems = new SearchItems(itemRepository);
const getItems = new GetItems(itemRepository);
const getItemById = new GetItemById(itemRepository);
const deleteItem = new DeleteItem(itemRepository);

// Controllers
const authController = new AuthController(registerUser);
const inventoryController = new InventoryController(
  searchItems,
  getItems,
  getItemById,
  deleteItem
);

// ============================================
// EXPRESS APP
// ============================================

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(generalLimiter);

// Request ID middleware
app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    module: 'Inventario de Jugador',
    architecture: 'Hexagonal (Ports & Adapters)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (versioned)
app.use('/api/v1/auth', createAuthRoutes(authController));
app.use('/api/v1/inventory', createInventoryRoutes(inventoryController));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = config.PORT;

if (config.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info('server.started', {
      port: PORT,
      environment: config.NODE_ENV,
    });

    console.log('\n  THE NEXUS BATTLES V - Inventario de Jugador');
    console.log('═'.repeat(70));
    console.log(` Servidor: http://localhost:${PORT}`);
    console.log(` Health: GET http://localhost:${PORT}/health`);
    console.log('\n ENDPOINTS DISPONIBLES:');
    console.log('  ┌─ Autenticación');
    console.log('  │  └─ POST /api/v1/auth/register           (SCRUM-42)');
    console.log('  │');
    console.log('  └─ Inventario');
    console.log('     ├─ GET  /api/v1/inventory/search?q=     (SCRUM-31)');
    console.log('     ├─ GET  /api/v1/inventory?tipo=&rareza= (Listar con filtros)');
    console.log('     ├─ GET  /api/v1/inventory/:id           (Detalle)');
    console.log('     └─ DELETE /api/v1/inventory/:id         (SCRUM-37)');
    console.log('═'.repeat(70));
    console.log('Cumplimiento: Módulo 6.1 - Inventario de Jugador');
    console.log('Arquitectura según documento oficial v2.0\n');
  });
}

export default app;