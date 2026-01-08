import { Router } from "express";
import { validarToken } from "../middlewares/auth.middlewares.js";
import {
  createPreferenceController,
  webhookController,
} from "../controllers/paymentController.js";

const router = Router();

router.post("/create_preference", validarToken, createPreferenceController);
router.post("/webhook", webhookController);

export default router;
