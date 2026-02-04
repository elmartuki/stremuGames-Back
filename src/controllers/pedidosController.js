import { connectDB } from "../config/configDB.js";
import { encontrarComprasServices } from "../services/pedidosServices.js";

export const encontrarComprasController = async (req, res) => {
  await connectDB();
  const id = req.idUsuario;
  const { json, statusCode } = await encontrarComprasServices(id);
  res.status(statusCode).json(json);
};
