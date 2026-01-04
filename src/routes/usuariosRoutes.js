import { Router } from "express";
import { register, login } from "../controllers/usuariosController.js";
import { validarToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
