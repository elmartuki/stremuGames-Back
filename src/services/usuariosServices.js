import { usuarioModel } from "../models/usuariosModel.js";
import { carritoModel } from "../models/carritoModel.js";
import jwt from "jsonwebtoken";

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

export const loginServices = async (usuarioFinal) => {
  try {
    const { usuario_email, contraseña } = usuarioFinal;

    if (!usuario_email || !contraseña) {
      return {
        json: { message: "Todos los campos son obligatorios" },
        statusCode: 400,
      };
    }

    const existeUsuario = await usuarioModel.findOne({
      $or: [
        { email: usuario_email },
        { nombreUsuario: usuario_email },
      ],
    });

    if (!existeUsuario) {
      return {
        json: { message: "Usuario no encontrado" },
        statusCode: 404,
      };
    }

    if (existeUsuario.contraseña !== contraseña) {
      return {
        json: { message: "Contraseña incorrecta" },
        statusCode: 401,
      };
    }

    const token = jwt.sign(
      {
        id: existeUsuario._id,
        rol: existeUsuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return {
      json: {
        message: "Ingresaste correctamente",
        token,
        usuario: {
          id: existeUsuario._id,
          nombreUsuario: existeUsuario.nombreUsuario,
          email: existeUsuario.email,
          rol: existeUsuario.rol,
          foto_de_perfil: existeUsuario.foto_de_perfil,
        },
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al ingresar:", error);
    return {
      json: { message: "Error interno del servidor" },
      statusCode: 500,
    };
  }
};


export const registerServices = async (nuevoUsuario) => {
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

    const carrito = new carritoModel({
      usuarioId: usuarioDB._id,
      juegos: [],
      total: 0,
    });
    await carrito.save();

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

export const editarUsuarioServices = async (id, datos) => {
  try {
    const usuario = await usuarioModel.findByIdAndUpdate(id, datos, {
      new: true,
    });

    if (!usuario) {
      return {
        json: { message: "El usuario no existe" },
        statusCode: 404,
      };
    }

    return {
      json: {
        message: "Usuario actualizado exitosamente",
        datos: usuario,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al editar usuario:", error);
    return {
      json: { message: "Error interno del servidor: " + error.message },
      statusCode: 500,
    };
  }
};

export const borrarUsuarioServices = async (id) => {
  try {
    const usuarioEliminado = await usuarioModel.findByIdAndDelete(id);

    if (!usuarioEliminado) {
      return {
        json: {
          message: "El usuario no existe",
        },
        statusCode: 404,
      };
    }

    return {
      json: {
        message: "Se elimino el usuario exitosamente!!",
        datos: usuarioEliminado,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al eliminar usuario", error);
    return {
      json: { message: "Error interno del servidor: " + error.message },
      statusCode: 500,
    };
  }
};
