// src/infrastructure/routes/heroRoutes.ts
import { Router } from "express";
import { HeroController } from "../controllers/HeroController";

export function createHeroRoutes(heroController: HeroController): Router {
  const router = Router();

  // ✅ Rutas SIN multer - solo JSON
  router.get('/heroes', (req, res) => heroController.listar(req, res));
  router.get('/heroes/:id', (req, res) => heroController.obtenerPorId(req, res));
  router.post('/heroes', (req, res) => heroController.crear(req, res));
  router.put('/heroes/:id', (req, res) => heroController.actualizar(req, res));
  router.delete('/heroes/:id', (req, res) => heroController.eliminar(req, res));

  return router;
}