import { Router } from "express";
import usuariosRoutes from "./usuariosRoutes.js";
import juegosRoutes from "./juegosRoutes.js";
import carritoRoutes from "./carritoRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import pedidosRoutes from "./pedidosRoutes.js";
import listadaDeDeseadosRoutes from "./listadaDeDeseadosRoutes.js";
import cuponesRoutes from "./cuponesRoutes.js";
import ticketRoutes from "./ticketRoutes.js";

const router = Router();

router.use("/usuarios", usuariosRoutes);
router.use("/juegos", juegosRoutes);
router.use("/carrito", carritoRoutes);
router.use("/payment", paymentRoutes);
router.use("/pedidos", pedidosRoutes);
router.use("/listadedeseados", listadaDeDeseadosRoutes);
router.use("/cupones", cuponesRoutes);
router.use("/ticket", ticketRoutes);

export default router;
