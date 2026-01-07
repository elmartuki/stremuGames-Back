import { connectDB } from "../config/configDB.js";
import {
  borrarUsuarioServices,
  editarUsuarioServices,
  loginServices,
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
export const registrarController = async (req, res) => {
  await connectDB();
  const form = req.body;
  const { json, statusCode } = await registerServices(form);
  res.status(statusCode).json(json);
};

export const loginController = async (req, res) => {
  await connectDB();
  const usuarioFinal = req.body;
  const { json, statusCode } = await loginServices(usuarioFinal);
  res.status(statusCode).json(json);
};
