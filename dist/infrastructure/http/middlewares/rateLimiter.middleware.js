"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensitiveOperationsLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_1 = require("../../../config/index,");
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: index_1.config.RATE_LIMIT_WINDOW_MS,
    max: index_1.config.RATE_LIMIT_MAX_REQUESTS,
    message: 'Demasiadas peticiones, intenta de nuevo más tarde',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de login, intenta de nuevo más tarde',
    skipSuccessfulRequests: true,
});
exports.sensitiveOperationsLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Límite de operaciones sensibles alcanzado',
});
