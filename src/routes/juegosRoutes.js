import { Router } from "express";
import { validarToken } from "../middlewares/auth.middlewares.js";
import {
  agregarJuegoController,
  editarUnJuegoController,
  eliminarUnJuegoController,
  obtenerJuegosController,
  obtenerJuegosPorStudioController,
  obtenerUnJuegoPorStudioController,
} from "../controllers/juegosController.js";

const router = Router();

router.get("/", obtenerJuegosController);

router.get("/juegos-subidos", validarToken, obtenerJuegosPorStudioController);

router.get("/:id", validarToken, obtenerUnJuegoPorStudioController);

router.put("/:id", editarUnJuegoController);

router.post("/crear", validarToken, agregarJuegoController);

router.delete("/:id", eliminarUnJuegoController);

export default router;
