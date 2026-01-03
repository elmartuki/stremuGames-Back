import { Router } from "express";
import { validarToken } from "../middlewares/auth.middlewares.js";
import {
  agregarJuegoController,
  editarUnJuegoController,
  eliminarUnJuegoController,
  obtenerJuegosController,
  obtenerUnJuegoController,
} from "../controllers/juegosController.js";

const router = Router();

router.get("/", obtenerJuegosController);

router.get("/:id", obtenerUnJuegoController);

router.put("/:id", editarUnJuegoController);

router.post("/crear", agregarJuegoController);

router.delete("/:id", eliminarUnJuegoController);

export default router;
