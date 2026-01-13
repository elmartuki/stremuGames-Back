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
export const registrarUsuarioController = async (req, res) => {
  await connectDB();
  const datos = req.body;
  const { json, statusCode } = await registerServices(datos);
  res.status(statusCode).json(json);
};

export const loginController = async (req, res) => {
  try {
    const resultado = await loginServices(req.body);

    return res.status(resultado.statusCode).json(resultado.json);
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
