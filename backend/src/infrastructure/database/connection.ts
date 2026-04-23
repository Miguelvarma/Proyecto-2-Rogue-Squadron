import mysql from 'mysql2/promise';
import { env } from '../../config/env';

/**
 * Configuración del Pool de Conexiones para MySQL / TiDB Cloud
 */
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  timezone: 'Z'
});

/**
 * Función para validar la salud de la conexión al arrancar el servidor
 */
export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
}