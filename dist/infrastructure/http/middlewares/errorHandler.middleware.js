"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AuthorizationError = exports.AuthenticationError = exports.NotFoundError = exports.ValidationError = exports.DomainError = void 0;
const logger_1 = require("../../logging/logger");
const index_1 = require("../../../config/index,");
class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DomainError';
    }
}
exports.DomainError = DomainError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('error.handler', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });
    if (error.name === 'ValidationError' || error.message.includes('inválid')) {
        res.status(400).json({
            error: 'Datos de entrada inválidos',
            message: error.message,
        });
        return;
    }
    if (error.name === 'AuthenticationError') {
        res.status(401).json({ error: error.message });
        return;
    }
    if (error.name === 'AuthorizationError') {
        res.status(403).json({ error: error.message });
        return;
    }
    if (error.name === 'NotFoundError' || error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
        return;
    }
    if (error.message.includes('ya está registrado') ||
        error.message.includes('ya está en uso') ||
        error.message.includes('subasta') ||
        error.message.includes('mazo')) {
        res.status(409).json({ error: error.message });
        return;
    }
    res.status(500).json({
        error: 'Error interno del servidor',
        message: index_1.config.NODE_ENV === 'development' ? error.message : undefined,
    });
};
exports.errorHandler = errorHandler;
