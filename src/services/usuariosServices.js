import { usuarioModel } from "../models/usuariosModel.js";

export const obtenerUsuariosServices = async () => {
  try {

    const usuarios = await usuarioModel.find();

    return {
      json: {
        message: "Usuarios obtenidos correctamente",
        datos: usuarios,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return {
      json: { message: "Error interno del servidor" },
      statusCode: 500,
    };
  }
};

export const register = async (nuevoUsuario) => {
  try {
    const existeUsuario = await usuarioModel.findOne({
      $or: [
        { email: nuevoUsuario.email },
        { nombreUsuario: nuevoUsuario.nombreUsuario },
      ],
    });

    if (existeUsuario) {
      return {
        json: { message: "El usuario o email ya existe" },
        statusCode: 400,
      };
    }

    const usuarioDB = new usuarioModel(nuevoUsuario);
    await usuarioDB.save();

    return {
      json: {
        message: "Usuario registrado correctamente",
        datos: usuarioDB,
      },
      statusCode: 201,
    };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return {
      json: { message: "Error interno del servidor" },
      statusCode: 500,
    };
  }
};

export const obtenerUnUsuarioServices = async (id) => {
  try {
    const usuario = await usuarioModel.findById(id);

    if (!usuario) {
      return {
        json: { message: "Usuario no encontrado" },
        statusCode: 404,
      };
    }

    return {
      json: {
        message: "Usuario encontrado",
        datos: usuario,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.log("Error al encontrar el usuario", error);
    return {
      json: { message: "ID inválido o error interno" },
      statusCode: 500,
    };
  }
};

