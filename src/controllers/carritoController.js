import { connectDB } from "../config/configDB.js";
import { agregarJuegoService } from "../services/carritoServices.js";

export const agregarJuegoCarrito = async (req, res) => {
  await connectDB();

  const { id } = req.params;
  const idUsuario = req.idUsuario;

  const { json, statusCode } = await agregarJuegoService(id, idUsuario);

  res.status(statusCode).json(json);
};
