import { connectDB } from "../config/configDB.js";
import {
  borrarUsuarioServices,
  editarUsuarioServices,
  loginServices,
  obtenerJuegosCompradosServices,
  obtenerUnUsuarioServices,
  obtenerUsuariosServices,
  registerServices,
} from "../services/usuariosServices.js";

export const obtenerUsuariosController = async (req, res) => {
  await connectDB();

  const { json, statusCode } = await obtenerUsuariosServices();
  res.status(statusCode).json(json);
};

export const obtenerUnUsuarioController = async (req, res) => {
  await connectDB();
  const { id } = req.params;
  const { json, statusCode } = await obtenerUnUsuarioServices(id);
  res.status(statusCode).json(json);
};

export const editarUsuarioController = async (req, res) => {
  await connectDB();
  const { id } = req.params;
  const data = req.body;
  const { json, statusCode } = await editarUsuarioServices(id, data);
  res.status(statusCode).json(json);
};
export const borrarUsuarioController = async (req, res) => {
  await connectDB();
  const { id } = req.params;
  const { json, statusCode } = await borrarUsuarioServices(id);
  res.status(statusCode).json(json);
};
export const registrarUsuarioController = async (req, res) => {
  await connectDB();
  const datos = req.body;
  const { json, statusCode } = await registerServices(datos);
  res.status(statusCode).json(json);
};

export const loginController = async (req, res) => {
  await connectDB();

  const { json, statusCode } = await loginServices(req.body);
  res.status(statusCode).json(json);
};

export const obtenerJuegosCompradosController = async (req, res) => {
  await connectDB();

  const idUsuario = req.idUsuario;
  const { json, statusCode } = await obtenerJuegosCompradosServices(idUsuario);

  res.status(statusCode).json(json);
};
