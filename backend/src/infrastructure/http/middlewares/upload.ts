// src/infrastructure/http/routes/hero.routes.ts
import { Router } from "express";
import { HeroController } from "../controllers/HeroController";
import { upload } from "../../middlewares/upload"; // ✅ Importar upload

export function createHeroRoutes(heroController: HeroController): Router {
  const router = Router();

  // Rutas sin imagen
  router.get('/heroes', (req, res) => heroController.listar(req, res));
  router.get('/heroes/:id', (req, res) => heroController.obtenerPorId(req, res));
  router.delete('/heroes/:id', (req, res) => heroController.eliminar(req, res));
  
  // ✅ Rutas CON imagen (usando multer)
  router.post('/heroes', upload.single('image'), (req, res) => heroController.crear(req, res));
  router.put('/heroes/:id', upload.single('image'), (req, res) => heroController.actualizar(req, res));

  return router;
}