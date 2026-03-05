import mysql from 'mysql2/promise';
import { config } from '../../config/index,';
import { logger } from '../logging/logger';

let pool: mysql.Pool | null = null;

export const getConnection = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    logger.info('database.pool.created', {
      host: config.DB_HOST,
      database: config.DB_NAME,
    });
  }

  return pool;
};

export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('database.pool.closed');
  }
};