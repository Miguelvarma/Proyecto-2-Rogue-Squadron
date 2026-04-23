/**
 * autoBackupMiddleware — Middleware de Backup Automático
 * 
 * Intercepta operaciones POST/PUT/DELETE en rutas admin y ejecuta backup
 * antes de permitir la operación. Si el backup falla, rechaza la operación.
 */

import { NextFunction, Request, Response } from 'express';
import { backupService, BackupResult } from '../../database/MySQLBackupService';
import { logger } from '../../logging/logger';

export interface AdminChatbotRequest extends Request {
  admin?: { username: string; sessionId?: string };
}

/**
 * Middleware que ejecuta backup automático antes de operaciones críticas
 * 
 * Previene eliminaciones accidentales permitiendo recuperación rápida.
 * Se ejecuta para: POST (crear), PUT (actualizar), DELETE (eliminar)
 */
export const autoBackupMiddleware = async (
  req: AdminChatbotRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Solo aplicar a operaciones de escritura
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  try {
    // Obtener acción desde la ruta
    const action = determineAction(req.method, req.path);

    // Log de inicio de backup
    logger.info(
      `[AUTO-BACKUP] Iniciando backup preventivo | ` +
      `Admin: ${req.body?.username ?? 'unknown'} | ` +
      `Ruta: ${req.path} | Acción: ${action}`
    );

    // Ejecutar backup
    const backupResult = await backupService.createBackup(action);

    // Si el backup falló, RECHAZAR la operación
    if (!backupResult.success) {
      logger.error(
        `[AUTO-BACKUP] ❌ Backup falló - operación RECHAZADA | ` +
        `Error: ${backupResult.error}`
      );

      res.status(500).json({
        success: false,
        error: 'BACKUP_FAILED',
        message:
          'No se pudo crear backup preventivo. ' +
          'Por seguridad, la operación ha sido rechazada. ' +
          'Intenta de nuevo en unos momentos.',
      });
      return;
    }

    // Backup exitoso - Agregar info al request para logging posterior
    (req as any).backupFile = backupResult.fileName;
    (req as any).backupSize = backupResult.size;

    logger.info(
      `[AUTO-BACKUP] ✅ Backup completado exitosamente | ` +
      `Archivo: ${backupResult.fileName} | Tamaño: ${backupResult.size} bytes | ` +
      `Procediendo con operación...`
    );

    // Continuar con la operación
    next();
  } catch (error) {
    logger.error(`[AUTO-BACKUP] Error inesperado en backup: ${error}`);

    // En caso de error inesperado, también rechazar por seguridad
    res.status(500).json({
      success: false,
      error: 'BACKUP_ERROR',
      message: 'Error interno en sistema de backup. Operación rechazada.',
    });
  }
};

/**
 * Determina la acción a partir del método HTTP y ruta
 * Usado para nombrar el archivo de backup
 */
function determineAction(method: string, path: string): string {
  if (method === 'POST') return 'crear';
  if (method === 'PUT') return 'actualizar';
  if (method === 'DELETE') return 'eliminar';

  // Extraer categoría de la ruta si es posible
  const categoryMatch = path.match(/knowledge-base\/([a-z_]+)/i);
  const category = categoryMatch?.[1] || 'recurso';

  return `${method.toLowerCase()}_${category}`;
}

export default autoBackupMiddleware;
