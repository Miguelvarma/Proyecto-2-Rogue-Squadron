"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const index_1 = require("../src/config/index,");
const logger_1 = require("./infrastructure/logging/logger");
const errorHandler_middleware_1 = require("./infrastructure/http/middlewares/errorHandler.middleware");
const rateLimiter_middleware_1 = require("./infrastructure/http/middlewares/rateLimiter.middleware");
// Adaptadores
const UserRepositoryMysql_1 = require("./infrastructure/persitence/repositories/UserRepositoryMysql");
const ItemRepositoryMySQL_1 = require("./infrastructure/persitence/repositories/ItemRepositoryMySQL");
const BcrypHasher_1 = require("./infrastructure/security/BcrypHasher");
const JwtTokenServices_1 = require("./infrastructure/security/JwtTokenServices");
const EmailService_1 = require("./infrastructure/gateways/EmailService");
// Use Cases
const RegisterUser_1 = require("./application/usecases/auth/RegisterUser");
const LoginUser_1 = require("./application/usecases/auth/LoginUser");
const SearchItem_1 = require("./application/usecases/inventory/SearchItem");
const GetItem_1 = require("./application/usecases/inventory/GetItem");
const GetItemById_1 = require("./application/usecases/inventory/GetItemById");
const DeleteItem_1 = require("./application/usecases/inventory/DeleteItem");
// Controllers
const AuthController_1 = require("./infrastructure/http/controllers/AuthController");
const InventoryController_1 = require("./infrastructure/http/controllers/InventoryController");
// Routes
const auth_routes_1 = require("./infrastructure/http/routes/auth.routes");
const inventory_routes_1 = require("./infrastructure/http/routes/inventory.routes");
// ============================================
// DEPENDENCY INJECTION
// ============================================
// Repositories
const userRepository = new UserRepositoryMysql_1.UserRepositoryMySQL();
const itemRepository = new ItemRepositoryMySQL_1.ItemRepositoryMySQL();
// Services
const passwordHasher = new BcrypHasher_1.BcryptHasher();
const tokenService = new JwtTokenServices_1.JwtTokenService();
const emailService = new EmailService_1.EmailService();
// Use Cases - Auth
const registerUser = new RegisterUser_1.RegisterUser(userRepository, passwordHasher, tokenService, emailService);
const loginUser = new LoginUser_1.LoginUser(userRepository, passwordHasher, tokenService);
// Use Cases - Inventory
const searchItems = new SearchItem_1.SearchItems(itemRepository);
const getItems = new GetItem_1.GetItems(itemRepository);
const getItemById = new GetItemById_1.GetItemById(itemRepository);
const deleteItem = new DeleteItem_1.DeleteItem(itemRepository);
// Controllers
const authController = new AuthController_1.AuthController(registerUser, loginUser);
const inventoryController = new InventoryController_1.InventoryController(searchItems, getItems, getItemById, deleteItem);
// ============================================
// EXPRESS APP
// ============================================
const app = (0, express_1.default)();
// Security middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: index_1.config.CORS_ORIGIN,
    credentials: true,
}));
// Body parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
app.use(rateLimiter_middleware_1.generalLimiter);
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
app.use('/api/v1/auth', (0, auth_routes_1.createAuthRoutes)(authController));
app.use('/api/v1/inventory', (0, inventory_routes_1.createInventoryRoutes)(inventoryController));
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
// Error handler
app.use(errorHandler_middleware_1.errorHandler);
// ============================================
// START SERVER
// ============================================
const PORT = index_1.config.PORT;
if (index_1.config.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger_1.logger.info('server.started', {
            port: PORT,
            environment: index_1.config.NODE_ENV,
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
exports.default = app;
