import { Router } from "express";
import { validarToken } from "../middlewares/auth.middlewares.js";
import {
  agregarJuegoController,
  editarUnJuegoController,
  eliminarUnJuegoController,
  gestionarFavoritosController,
  gestionarVisualizacionController,
  obtenerJuegosController,
  obtenerJuegosPorStudioController,
  obtenerUnJuegoPorStudioController,
  verificarEstadoFavoritoController,
} from "../controllers/juegosController.js";

const router = Router();

router.get("/", obtenerJuegosController);
router.get("/juegos-subidos", validarToken, obtenerJuegosPorStudioController);
router.post("/crear", validarToken, agregarJuegoController);

router.put("/favoritos/:id", validarToken, gestionarFavoritosController);

router.get(
  "/favoritos/verificar/:id",
  validarToken,
  verificarEstadoFavoritoController,
);

router.put("/estado/:id", gestionarVisualizacionController);

router.get("/:id", validarToken, obtenerUnJuegoPorStudioController);
router.put("/:id", editarUnJuegoController);
router.delete("/:id", eliminarUnJuegoController);

export default router;
