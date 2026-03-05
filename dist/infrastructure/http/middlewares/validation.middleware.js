"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    error: 'Datos de entrada inválidos',
                    details: error.issues.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }
            res.status(500).json({ error: 'Error de validación' });
        }
    };
};
exports.validateRequest = validateRequest;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    error: 'Parámetros de consulta inválidos',
                    details: error.issues.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }
            res.status(500).json({ error: 'Error de validación' });
        }
    };
};
exports.validateQuery = validateQuery;
