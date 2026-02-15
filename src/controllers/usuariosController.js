import { connectDB } from "../config/configDB.js";
import {
  borrarUsuarioServices,
  editarUsuarioServices,
  gestionarSeguidoresServices,
  guardarFavoritosServices,
  verificarFavoritoService,
  loginServices,
  obtenerJuegosCompradosServices,
  obtenerUnUsuarioServices,
  obtenerUsuariosServices,
  registerServices,
  sistemaDeBaneoServices,
  verificarSeguimientoService,
  obtenerJuegosFavoritosServices,
  recuperarContraseniaService,
  cambiarContraseniaService,
  verificarCodigoService,
} from "../services/usuariosServices.js";

export const obtenerUsuariosController = async (req, res) => {
  await connectDB();

  const { json, statusCode } = await obtenerUsuariosServices();
  res.status(statusCode).json(json);
};

export const obtenerUnUsuarioController = async (req, res) => {
  await connectDB();
  const { nombreUsuario } = req.params;
  const { json, statusCode } = await obtenerUnUsuarioServices(nombreUsuario);
  res.status(statusCode).json(json);
};

export const obtenerJuegosFavoritosController = async (req, res) => {
  await connectDB();
  const { id } = req.params;
  const { json, statusCode } = await obtenerJuegosFavoritosServices(id);
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

export const verificarCodigoController = async (req, res) => {
  await connectDB();
  const { email, codigo } = req.body;

  const { json, statusCode } = await verificarCodigoService(email, codigo);

  res.status(statusCode).json(json);
};

export const recuperarContraseniaController = async (req, res) => {
  await connectDB();
  const { email } = req.body;
  const { json, statusCode } = await recuperarContraseniaService(email);
  res.status(statusCode).json(json);
};

export const cambiarContraseniaController = async (req, res) => {
  await connectDB();
  const { email, codigo, nuevaPassword } = req.body;

  const { json, statusCode } = await cambiarContraseniaService(
    email,
    codigo,
    nuevaPassword,
  );

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

export const sistemaDeBaneoController = async (req, res) => {
  await connectDB();

  const { id } = req.params;
  const { json, statusCode } = await sistemaDeBaneoServices(id);

  res.status(statusCode).json(json);
};

export const gestionarSeguidoresController = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.idUsuario;

  const { json, statusCode } = await gestionarSeguidoresServices(id, idUsuario);

  res.status(statusCode).json(json);
};

export const verificarSeguimientoController = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.idUsuario;

  const { json, statusCode } = await verificarSeguimientoService(id, idUsuario);

  res.status(statusCode).json(json);
};

export const guardarFavoritosController = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.idUsuario;

  const { json, statusCode } = await guardarFavoritosServices(id, idUsuario);

  res.status(statusCode).json(json);
};

export const verificarFavoritoController = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.idUsuario;

  const { json, statusCode } = await verificarFavoritoService(id, idUsuario);

  res.status(statusCode).json(json);
};
