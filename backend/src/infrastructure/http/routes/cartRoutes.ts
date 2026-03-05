import { Router } from "express";
import { CartController } from "../../controllers/CartController";

const router = Router();

router.post("/add", CartController.add);

export default router;