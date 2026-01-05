import { Router } from "express";
import { validarToken } from "../middlewares/auth.middlewares.js";
import { agregarJuegoCarrito } from "../controllers/carritoController.js";

const router = Router();

router.post("/:id", validarToken, agregarJuegoCarrito);
// router.delete("/:id", validarToken, eliminarProductoCarrito);
// router.get("/", validarToken, obtenerDatosCarrito);
export default router;
