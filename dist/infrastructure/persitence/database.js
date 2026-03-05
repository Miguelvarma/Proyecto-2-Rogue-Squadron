"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.getConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const index_1 = require("../../config/index,");
const logger_1 = require("../logging/logger");
let pool = null;
const getConnection = () => {
    if (!pool) {
        pool = promise_1.default.createPool({
            host: index_1.config.DB_HOST,
            port: index_1.config.DB_PORT,
            user: index_1.config.DB_USER,
            password: index_1.config.DB_PASSWORD,
            database: index_1.config.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        logger_1.logger.info('database.pool.created', {
            host: index_1.config.DB_HOST,
            database: index_1.config.DB_NAME,
        });
    }
    return pool;
};
exports.getConnection = getConnection;
const closeConnection = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        logger_1.logger.info('database.pool.closed');
    }
};
exports.closeConnection = closeConnection;
