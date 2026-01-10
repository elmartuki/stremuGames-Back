import { usuarioModel } from "../models/usuariosModel.js";
import { carritoModel } from "../models/carritoModel.js";
import bcrypt from "bcryptjs";
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

export const registerServices = async (datos) => {
  try {
    const existe = await usuarioModel.findOne({
      $or: [{ email: datos.email }, { nombreUsuario: datos.nombreUsuario }],
    });

    if (existe) {
      return {
        json: { message: "El usuario ya existe" },
        statusCode: 400,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(datos.password, salt);

    const usuarioDB = new usuarioModel({
      nombreUsuario: datos.nombreUsuario,
      email: datos.email,
      password: passwordHasheada,
    });

    await usuarioDB.save();

    const nuevoCarrito = new carritoModel({
      idUsuario: usuarioDB._id,
      juegos: [],
      total: 0,
    });

    await nuevoCarrito.save();

    return {
      json: { message: "Registrado con éxito" },
      statusCode: 201,
    };
  } catch (error) {
    console.error("Error en registerServices:", error);
    return {
      json: { message: "Error interno del servidor" },
      statusCode: 500,
    };
  }
};

export const loginServices = async (datos) => {
  try {
    const { usuario_email, password } = datos;

    if (!usuario_email || !password) {
      return {
        statusCode: 400,
        json: { message: "Todos los campos son obligatorios" },
      };
    }

    const usuario = await usuarioModel
      .findOne({
        $or: [{ email: usuario_email }, { nombreUsuario: usuario_email }],
      })
      .select("+password");

    if (!usuario || !usuario.activo) {
      return {
        statusCode: 401,
        json: { message: "Credenciales inválidas" },
      };
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return {
        statusCode: 401,
        json: { message: "Credenciales inválidas" },
      };
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      statusCode: 200,
      json: {
        message: "Login exitoso",
        token,
        usuario: {
          id: usuario._id,
          nombreUsuario: usuario.nombreUsuario,
          rol: usuario.rol,
          foto_de_perfil: usuario.foto_de_perfil,
        },
      },
    };
  } catch (error) {
    console.error("Error en loginServices:", error);
    return {
      statusCode: 500,
      json: { message: "Error interno del servidor" },
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
