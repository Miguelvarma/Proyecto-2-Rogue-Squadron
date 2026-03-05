"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = void 0;
const express_1 = require("express");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_schemas_1 = require("../schemas/auth.schemas");
const rateLimiter_middleware_1 = require("../middlewares/rateLimiter.middleware");
const createAuthRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.post('/register', rateLimiter_middleware_1.authLimiter, (0, validation_middleware_1.validateRequest)(auth_schemas_1.RegisterSchema), controller.register);
    // NUEVO: Ruta de login
    router.post('/login', rateLimiter_middleware_1.authLimiter, (0, validation_middleware_1.validateRequest)(auth_schemas_1.LoginSchema), controller.login);
    return router;
};
exports.createAuthRoutes = createAuthRoutes;
