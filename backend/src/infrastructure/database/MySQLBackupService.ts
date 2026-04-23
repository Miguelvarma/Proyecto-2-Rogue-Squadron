/**
 * MySQLBackupService — Servicio de Backup Automático
 * 
 * Ejecuta mysqldump antes de operaciones de escritura en el panel admin.
 * Guarda archivos .sql con timestamp para recuperación ante fallos.
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { logger } from '../logging/logger';

export interface BackupResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  timestamp: string;
  size?: number;
  error?: string;
}

export class MySQLBackupService {
  private readonly backupDir: string;
  private readonly maxBackups: number = 10; // Mantener últimos 10 backups
  private readonly logger = logger;

  constructor(backupDir?: string) {
    this.backupDir = backupDir || path.join(process.cwd(), 'backups');
  }

  /**
   * Crea un backup completo de la base de datos antes de operación crítica
   * Usa mysqldump para generar un archivo SQL
   * 
   * @param action - Acción que dispara el backup (crear, editar, eliminar)
   * @returns BackupResult con ruta y estado del backup
   */
  async createBackup(action: string = 'manual'): Promise<BackupResult> {
    const timestamp = this.getTimestamp();
    const fileName = `backup_${timestamp}_${action}.sql`;
    const filePath = path.join(this.backupDir, fileName);

    try {
      // Crear directorio de backups si no existe
      await this.ensureBackupDir();

      // Construir comando mysqldump
      const command = this.buildMysqldumpCommand(filePath);

      this.logger.info(`[BACKUP] Iniciando backup de BD: ${fileName}`);

      // Ejecutar mysqldump (síncrono para garantizar finalización)
      execSync(command, { encoding: 'utf-8', stdio: 'pipe' });

      // Obtener tamaño del archivo
      const stats = await fs.stat(filePath);
      const sizeKb = (stats.size / 1024).toFixed(2);

      this.logger.info(
        `[BACKUP] ✅ Backup completado exitosamente | ` +
        `Archivo: ${fileName} | Tamaño: ${sizeKb} KB`
      );

      // Limpiar backups antiguos (mantener solo los últimos N)
      await this.cleanOldBackups();

      return {
        success: true,
        filePath,
        fileName,
        timestamp,
        size: stats.size,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[BACKUP] ❌ Error en backup de BD | ` +
        `Acción: ${action} | Error: ${errorMsg}`
      );

      return {
        success: false,
        error: errorMsg,
        timestamp,
      };
    }
  }

  /**
   * Lista los últimos backups disponibles
   * Útil para permitir restauración manual
   * 
   * @param limit - Número máximo de backups a retornar
   * @returns Array de nombres de archivos de backup
   */
  async listBackups(limit: number = 5): Promise<string[]> {
    try {
      await this.ensureBackupDir();
      const files = await fs.readdir(this.backupDir);
      
      // Filtrar solo archivos .sql y ordenar por fecha (más recientes primero)
      const backups = files
        .filter(f => f.endsWith('.sql'))
        .sort()
        .reverse()
        .slice(0, limit);

      return backups;
    } catch (error) {
      this.logger.warn(`[BACKUP] No se pudo listar backups: ${error}`);
      return [];
    }
  }

  /**
   * Obtiene información detallada de un backup
   * 
   * @param fileName - Nombre del archivo de backup
   * @returns Información del archivo (tamaño, fecha creación, etc)
   */
  async getBackupInfo(fileName: string): Promise<{ size: number; createdAt: Date } | null> {
    try {
      const filePath = path.join(this.backupDir, fileName);
      
      // Validar que el archivo esté dentro del directorio de backups (seguridad)
      if (!filePath.startsWith(this.backupDir)) {
        throw new Error('Acceso denegado a archivo fuera del directorio de backups');
      }

      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
      };
    } catch (error) {
      this.logger.warn(`[BACKUP] Error al obtener info de backup ${fileName}: ${error}`);
      return null;
    }
  }

  /**
   * Constructor del comando mysqldump con parámetros seguros
   * 
   * @param outputFile - Ruta donde guardar el backup
   * @returns Comando mysqldump completo
   */
  private buildMysqldumpCommand(outputFile: string): string {
    const host = env.DB_HOST || 'localhost';
    const port = env.DB_PORT || 3306;
    const user = env.DB_USER;
    const password = env.DB_PASSWORD;
    const database = env.DB_NAME;

    // Escapar espacios en la ruta del archivo
    const escapedOutputFile = outputFile.replace(/"/g, '\\"');

    // mysqldump con opciones de seguridad y consistencia
    return [
      'mysqldump',
      `--host=${host}`,
      `--port=${port}`,
      `--user=${user}`,
      password ? `--password=${password}` : '',
      '--quick',         // Usa SELECT * INTO OUTFILE para tablas grandes
      '--lock-tables',   // Lock tablas para consistencia
      '--single-transaction', // Para InnoDB
      '--routines',      // Incluir funciones y procedimientos
      '--triggers',      // Incluir triggers
      '--events',        // Incluir eventos
      '--comments',      // Incluir comentarios
      '--create-options', // Incluir opciones de creación
      database,
      `> "${escapedOutputFile}"`
    ]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Asegura que el directorio de backups existe
   */
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      this.logger.error(`[BACKUP] Error creando directorio de backups: ${error}`);
      throw error;
    }
  }

  /**
   * Limpia backups antiguos manteniendo solo los últimos N
   * Previene llenar el disco
   */
  private async cleanOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
        .sort()
        .reverse();

      // Si hay más de maxBackups, eliminar los más antiguos
      if (backupFiles.length > this.maxBackups) {
        const toDelete = backupFiles.slice(this.maxBackups);
        
        for (const file of toDelete) {
          try {
            await fs.unlink(path.join(this.backupDir, file));
            this.logger.debug(`[BACKUP] Backup antiguo eliminado: ${file}`);
          } catch (error) {
            this.logger.warn(`[BACKUP] Error eliminando backup antiguo ${file}: ${error}`);
          }
        }
      }
    } catch (error) {
      this.logger.warn(`[BACKUP] Error limpiando backups antiguos: ${error}`);
      // No lanzar error, solo loguear
    }
  }

  /**
   * Genera timestamp formato: YYYY-MM-DD_HH-MM-SS
   */
  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }
}

// Singleton instance
export const backupService = new MySQLBackupService();
