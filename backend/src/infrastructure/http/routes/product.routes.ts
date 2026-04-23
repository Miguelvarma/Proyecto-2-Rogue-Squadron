// backend/src/infrastructure/http/routes/product.routes.ts
import { Router } from "express";
import { ProductsController } from "../controllers/ProductsController";

const productsController = new ProductsController();

export function createProductRoutes(): Router {
  const router = Router();

  router.get('/products', (req, res) => productsController.listar(req, res));
  router.post('/products', (req, res) => productsController.crear(req, res));
  router.put('/products/:id', (req, res) => productsController.actualizar(req, res)); // ✅ AGREGAR
  router.delete('/products/:id', (req, res) => productsController.eliminar(req, res));

  return router;
}