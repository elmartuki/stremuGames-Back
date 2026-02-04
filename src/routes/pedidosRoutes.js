import { Router } from "express";
import { validarToken } from "../middlewares/auth.middlewares.js";
import { encontrarComprasController } from "../controllers/pedidosController.js";

const router = Router();

router.get("/compras/", validarToken, encontrarComprasController);

export default router;
