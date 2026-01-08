import { connectDB } from "../config/configDB.js";
import {
  createPreferenceServicio,
  webhookServicio,
} from "../services/paymentServices.js";

export const createPreferenceController = async (req, res) => {
  await connectDB();

  const { statusCode, json } = await createPreferenceServicio(
    req.idUsuario,
    req.body
  );

  res.status(statusCode).json(json);
};

export const webhookController = async (req, res) => {
  await connectDB();
  const { statusCode } = await webhookServicio(req.body);
  res.sendStatus(statusCode);
};
