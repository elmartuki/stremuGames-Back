import { connectDB } from "../config/configDB.js";
import {
  agregarJuegoServices,
  editarUnJuegoServices,
  eliminarUnJuegoServices,
  obtenerJuegosServices,
  obtenerUnJuegoServices,
} from "../services/juegosServices.js";

export const agregarJuegoController = async (req, res) => {
  await connectDB();
  const nuevoJuego = req.body;
  const { json, statusCode } = await agregarJuegoServices(nuevoJuego);
  res.status(statusCode).json(json);
};

export const obtenerJuegosController = async (req, res) => {
  await connectDB();
  const { json, statusCode } = await obtenerJuegosServices();
  res.status(statusCode).json(json);
};

export const obtenerUnJuegoController = async (req, res) => {
  await connectDB();
  const { id } = req.params;
  const { json, statusCode } = await obtenerUnJuegoServices(id);
  res.status(statusCode).json(json);
};

export const editarUnJuegoController = async (req, res) => {
  await connectDB();
  const { id } = req.params;
  const datos = req.body;
  const { json, statusCode } = await editarUnJuegoServices(id, datos);
  res.status(statusCode).json(json);
};

export const eliminarUnJuegoController = async (req, res) => {
  await connectDB();
  const { id } = req.params;
  const { json, statusCode } = await eliminarUnJuegoServices(id);
  res.status(statusCode).json(json);
};
