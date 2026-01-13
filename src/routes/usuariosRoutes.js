import { Router } from "express";
import {
  borrarUsuarioController,
  editarUsuarioController,
  loginController,
  obtenerUnUsuarioController,
  obtenerUsuariosController,
  registrarUsuarioController,
} from "../controllers/usuariosController.js";
import { validarToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", registrarUsuarioController);

router.get("/", obtenerUsuariosController);

router.get("/:id", obtenerUnUsuarioController);

router.put("/:id", editarUsuarioController);

router.delete("/:id", borrarUsuarioController);

router.post("/login", loginController);

export default router;
