"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInventoryEvent = exports.logSecurityEvent = exports.logAuthEvent = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const index_1 = require("../../config/index,");
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
exports.logger = winston_1.default.createLogger({
    level: index_1.config.LOG_LEVEL,
    format: logFormat,
    defaultMeta: { service: 'nexus-battles-inventory' },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
if (index_1.config.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
// ✅ ACTUALIZAR: Agregar email como opcional
const logAuthEvent = (event, data) => {
    exports.logger.info(`auth.${event}`, {
        ...data,
        timestamp: new Date().toISOString(),
    });
};
exports.logAuthEvent = logAuthEvent;
const logSecurityEvent = (event, data) => {
    exports.logger.warn(`security.${event}`, {
        ...data,
        timestamp: new Date().toISOString(),
        alert: 'CRITICAL',
    });
};
exports.logSecurityEvent = logSecurityEvent;
const logInventoryEvent = (event, data) => {
    exports.logger.info(`inventory.${event}`, {
        ...data,
        timestamp: new Date().toISOString(),
    });
};
exports.logInventoryEvent = logInventoryEvent;
