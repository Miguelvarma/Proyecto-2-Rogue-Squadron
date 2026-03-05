"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateJWT = void 0;
const JwtTokenServices_1 = require("../../security/JwtTokenServices");
const logger_1 = require("../../logging/logger");
const tokenService = new JwtTokenServices_1.JwtTokenService();
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token no proporcionado' });
        return;
    }
    const token = authHeader.substring(7);
    const decoded = tokenService.verify(token);
    if (!decoded) {
        (0, logger_1.logSecurityEvent)('jwt.invalid', {
            ip: req.ip || '',
            route: req.path,
        });
        res.status(401).json({ error: 'Token inválido o expirado' });
        return;
    }
    req.user = {
        userId: decoded.userId,
        email: decoded.email,
        apodo: decoded.apodo,
        rol: decoded.rol,
    };
    next();
};
exports.authenticateJWT = authenticateJWT;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        if (!roles.includes(req.user.rol)) {
            res.status(403).json({ error: 'No autorizado para esta acción' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
