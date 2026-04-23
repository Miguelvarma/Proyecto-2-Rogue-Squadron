import { Router } from 'express';
import { AdminChatbotController } from '../controllers/AdminChatbotController';
import { adminChatbotAuthMiddleware } from '../middlewares/adminChatbotAuth.middleware';
import autoBackupMiddleware from '../middlewares/autoBackupMiddleware';

export const createAdminChatbotRoutes = (controller: AdminChatbotController): Router => {
  const router = Router();

  router.post('/login', controller.login);

  router.use(adminChatbotAuthMiddleware);

  router.post('/logout', controller.logout);
  router.get('/knowledge-base', controller.listKnowledgeBase);
  router.get('/knowledge-base/:category', controller.getKnowledgeBaseByCategory);
  
  // ── Operaciones con backup automático preventivo ────────────────────────────
  // Antes de crear, editar o eliminar, se ejecuta un backup completo de BD
  router.post('/knowledge-base/:category', autoBackupMiddleware, controller.createKnowledgeBaseEntry);
  router.put('/knowledge-base/:category/:id', autoBackupMiddleware, controller.updateKnowledgeBaseEntry);
  router.delete('/knowledge-base/:category/:id', autoBackupMiddleware, controller.deleteKnowledgeBaseEntry);
  
  // ── Monitoreo de backups y auditoría ────────────────────────────────────────
  router.get('/logs', controller.getLogs);
  router.get('/backups', controller.getBackups);

  return router;
};