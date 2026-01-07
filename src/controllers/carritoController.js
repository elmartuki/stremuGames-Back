import { connectDB } from "../config/configDB.js";
import {
  agregarJuegoService,
  eliminarJuegoCarritoServicios,
  obtenerDatosCarritoServices,
} from "../services/carritoServices.js";

export const agregarJuegoCarrito = async (req, res) => {
  await connectDB();

  const { id } = req.params;
  const idUsuario = req.idUsuario;

  const { json, statusCode } = await agregarJuegoService(id, idUsuario);

  res.status(statusCode).json(json);
};

export const obtenerDatosCarritoController = async (req, res) => {
  await connectDB();

  const idUsuario = req.idUsuario;

  const { json, statusCode } = await obtenerDatosCarritoServices(idUsuario);
  res.status(statusCode).json(json);
};

export const eliminarJuegoCarritoController = async (req, res) => {
  await connectDB();

  const idUsuario = req.idUsuario;
  const { id } = req.params;
  const { json, statusCode } = await eliminarJuegoCarritoServicios(
    idUsuario,
    id
  );
  res.status(statusCode).json(json);
};
