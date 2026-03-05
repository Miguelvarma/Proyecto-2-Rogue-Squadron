"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHmac = void 0;
const HmacValidator_1 = require("../../security/HmacValidator");
const logger_1 = require("../../logging/logger");
const hmacValidator = new HmacValidator_1.HmacValidator();
const validateHmac = (req, res, next) => {
    const signature = req.headers['x-hmac-signature'];
    const timestamp = parseInt(req.headers['x-timestamp'], 10);
    if (!signature || !timestamp) {
        (0, logger_1.logSecurityEvent)('hmacFail', {
            ip: req.ip || '',
            payload: 'missing-headers',
        });
        res.status(401).json({ error: 'Firma HMAC requerida' });
        return;
    }
    const isValid = hmacValidator.validateWithTimestamp(req.body, signature, timestamp, 300);
    if (!isValid) {
        (0, logger_1.logSecurityEvent)('hmacFail', {
            ip: req.ip || '',
            payload: req.body,
        });
        res.status(401).json({ error: 'Firma HMAC inválida' });
        return;
    }
    next();
};
exports.validateHmac = validateHmac;
