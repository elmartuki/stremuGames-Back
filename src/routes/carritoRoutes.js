import { Router } from "express";
import { validarToken } from "../middlewares/auth.middlewares.js";
import { agregarJuegoCarrito, eliminarJuegoCarritoController, obtenerDatosCarritoController } from "../controllers/carritoController.js";

const router = Router();

router.post("/:id", validarToken, agregarJuegoCarrito);
 router.delete("/:id", validarToken, eliminarJuegoCarritoController);
router.get("/", validarToken, obtenerDatosCarritoController);
export default router;
