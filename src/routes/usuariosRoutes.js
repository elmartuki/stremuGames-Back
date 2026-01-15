import { Router } from "express";
import {
  borrarUsuarioController,
  editarUsuarioController,
  loginController,
  obtenerJuegosCompradosController,
  obtenerUnUsuarioController,
  obtenerUsuariosController,
  registrarUsuarioController,
} from "../controllers/usuariosController.js";
import { validarToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", registrarUsuarioController);

router.get("/biblioteca", validarToken, obtenerJuegosCompradosController);

router.post("/login", loginController);

router.get("/", obtenerUsuariosController);

router.get("/:id", obtenerUnUsuarioController);

router.put("/:id", editarUsuarioController);

router.delete("/:id", borrarUsuarioController);

export default router;
