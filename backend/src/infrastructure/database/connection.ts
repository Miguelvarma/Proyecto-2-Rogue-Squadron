import mysql from 'mysql2/promise';
import { env } from '../../config/env';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  connectionLimit: env.DB_POOL_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  timezone: 'Z',
});

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}
