import { Router } from "express";
import {
  borrarUsuarioController,
  editarUsuarioController,
  gestionarSeguidoresController,
  guardarFavoritosController,
  verificarFavoritoController,
  loginController,
  obtenerJuegosCompradosController,
  obtenerUnUsuarioController,
  obtenerUsuariosController,
  registrarUsuarioController,
  sistemaDeBaneoController,
  verificarSeguimientoController,
  obtenerJuegosFavoritosController,
  recuperarContraseniaController,
  cambiarContraseniaController,
  verificarCodigoController,
} from "../controllers/usuariosController.js";
import { validarToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", registrarUsuarioController);

router.get("/biblioteca", validarToken, obtenerJuegosCompradosController);

router.post("/login", loginController);

router.post("/verificarCodigo", verificarCodigoController);

router.post("/recuperarContrasenia", recuperarContraseniaController);

router.post("/cambiarContrasenia", cambiarContraseniaController);

router.put("/favoritos/:id", validarToken, guardarFavoritosController);

router.get(
  "/favoritos/verificar/:id",
  validarToken,
  verificarFavoritoController,
);

router.get("/", obtenerUsuariosController);

router.get("/:id", obtenerUnUsuarioController);

router.get(
  "/obtener-favoritos/:id",
  validarToken,
  obtenerJuegosFavoritosController,
);

router.put("/seguir/:id", validarToken, gestionarSeguidoresController);

router.get(
  "/seguir/verificar/:id",
  validarToken,
  verificarSeguimientoController,
);

router.put("/:id", editarUsuarioController);

router.delete("/:id", borrarUsuarioController);

router.put("/banear/:id", sistemaDeBaneoController);

export default router;
