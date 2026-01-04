import { Router } from "express";
import {
  obtenerUnUsuarioController,
  obtenerUsuariosController,
  registrarController,
} from "../controllers/usuariosController.js";
import { validarToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/", obtenerUsuariosController);

router.post("/register", registrarController);

router.get("/:id", obtenerUnUsuarioController);

export default router;
