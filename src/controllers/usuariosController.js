import { connectDB } from "../config/configDB.js";
import {
  obtenerUnUsuarioServices,
  obtenerUsuariosServices,
  register,
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
  const { json, statusCode } = await editarUsuarioServices(id);
  res.status(statuscode).json(json);
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
  const { json, statusCode } = await register(form);
  res.status(statusCode).json(json);
};

export const loginController = async (req, res) => {
  res.status(501).json({ message: "Login no implementado aún" });
};
