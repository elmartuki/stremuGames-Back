import { usuarioModel } from "../models/usuariosModel.js";
import { juegosModel } from "../models/juegosModel.js";
import { carritoModel } from "../models/carritoModel.js";
import admin from "../config/FireBase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const guardarFavoritosServices = async (idJuego, idUsuario) => {
  try {
    const juego = await juegosModel.findById(idJuego);
    const usuario = await usuarioModel.findById(idUsuario);

    if (!juego || !usuario) {
      return {
        json: { message: "Juego o usuario no encontrado" },
        statusCode: 404,
      };
    }

    const esFavorito = usuario.juegosDeseados.includes(idJuego);

    if (esFavorito) {
      usuario.juegosDeseados.pull(idJuego);
      juego.usuarios_likes.pull(idUsuario);
      await Promise.all([usuario.save(), juego.save()]);

      return {
        json: {
          message: "Eliminado de favoritos",
          esFavorito: false,
          cantidadFavoritos: juego.usuarios_likes.length,
        },
        statusCode: 200,
      };
    } else {
      usuario.juegosDeseados.push(idJuego);
      juego.usuarios_likes.push(idUsuario);
      await Promise.all([usuario.save(), juego.save()]);

      return {
        json: {
          message: "Agregado a favoritos",
          esFavorito: true,
          cantidadFavoritos: juego.usuarios_likes.length,
        },
        statusCode: 200,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      json: { message: "Error en el servidor" },
      statusCode: 500,
    };
  }
};

export const verificarFavoritoService = async (idJuego, idUsuario) => {
  try {
    const usuario = await usuarioModel.findById(idUsuario);
    if (!usuario) {
      return {
        json: { message: "Usuario no encontrado" },
        statusCode: 404,
      };
    }

    const esFavorito = usuario.juegosDeseados.includes(idJuego);
    return {
      json: { esFavorito },
      statusCode: 200,
    };
  } catch (error) {
    return {
      json: { message: "Error al verificar" },
      statusCode: 500,
    };
  }
};

export const obtenerJuegosFavoritosServices = async (idUsuario) => {
  try {
    const usuario = await usuarioModel
      .findById(idUsuario)
      .populate("juegosDeseados");

    if (!usuario) {
      return {
        json: { message: "Usuario no encontrado" },
        statusCode: 404,
      };
    }

    return {
      json: {
        message: "Juegos favoritos obtenidos correctamente",
        datos: usuario.juegosDeseados,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al obtener los juegos favoritos", error);
    return {
      json: { message: "Error interno del servidor" },
      statusCode: 500,
    };
  }
};

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

    if (existe)
      return {
        json: {
          message:
            "El nombre de usuario o el correo electrónico ya están registrados",
        },
        statusCode: 400,
      };

    let passwordHasheada = "";

    if (datos.password) {
      const salt = await bcrypt.genSalt(10);
      passwordHasheada = await bcrypt.hash(datos.password, salt);
    } else {
      const passwordAleatoria =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      passwordHasheada = await bcrypt.hash(passwordAleatoria, salt);
    }

    const usuarioDB = new usuarioModel({
      nombreUsuario: datos.nombreUsuario,
      email: datos.email,
      password: passwordHasheada,
      foto_de_perfil: datos.foto_de_perfil || "",
      rol: datos.rol,
    });

    await usuarioDB.save();

    const nuevoCarrito = new carritoModel({
      idUsuario: usuarioDB._id,
      juegos: [],
      total: 0,
    });

    await nuevoCarrito.save();

    const token = jwt.sign(
      {
        id: usuarioDB._id,
        rol: usuarioDB.rol,
        nombreUsuario: usuarioDB.nombreUsuario,
        email: usuarioDB.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return {
      json: {
        message: "Registrado con éxito",
        token,
        usuario: {
          id: usuarioDB._id,
          nombreUsuario: usuarioDB.nombreUsuario,
          email: usuarioDB.email,
          rol: usuarioDB.rol,
          foto_de_perfil: usuarioDB.foto_de_perfil,
        },
      },
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
    let usuario;

    if (datos.token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(datos.token);
        const { email } = decodedToken;

        usuario = await usuarioModel.findOne({ email });

        if (!usuario) {
          return {
            statusCode: 404,
            json: {
              message: "Usuario no registrado. Por favor regístrate primero.",
            },
          };
        }
      } catch (error) {
        return {
          statusCode: 401,
          json: { message: "Token de Google inválido o expirado" },
        };
      }
    } else {
      const { usuario_email, password } = datos;

      if (!usuario_email || !password) {
        return {
          statusCode: 400,
          json: { message: "Todos los campos son obligatorios" },
        };
      }

      usuario = await usuarioModel
        .findOne({
          $or: [{ email: usuario_email }, { nombreUsuario: usuario_email }],
        })
        .select("+password");

      if (usuario) {
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
          return {
            statusCode: 401,
            json: { message: "Credenciales inválidas" },
          };
        }
      }
    }

    if (!usuario) {
      return {
        statusCode: 401,
        json: { message: "Credenciales inválidas" },
      };
    }

    if (usuario.activo === false) {
      return {
        statusCode: 403,
        json: {
          message:
            "Tu cuenta fue baneada. Contacta al soporte para más información.",
        },
      };
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        rol: usuario.rol,
        nombreUsuario: usuario.nombreUsuario,
        email: usuario.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return {
      statusCode: 200,
      json: {
        message: "Login exitoso",
        token,
        usuario: {
          id: usuario._id,
          nombreUsuario: usuario.nombreUsuario,
          email: usuario.email,
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

export const obtenerJuegosCompradosServices = async (idUsuario) => {
  const usuario = await usuarioModel
    .findById(idUsuario)
    .populate("juegosComprados");

  if (!usuario) {
    return {
      statusCode: 404,
      json: { message: "Usuario no encontrado" },
    };
  }

  return {
    statusCode: 200,
    json: {
      juegos: usuario.juegosComprados,
    },
  };
};

export const sistemaDeBaneoServices = async (id) => {
  try {
    const usuario = await usuarioModel.findById(id);

    if (!usuario) {
      return {
        json: { message: "Usuario no encontrado" },
        statusCode: 404,
      };
    }

    if (usuario.rol === "admin") {
      return {
        json: { message: "No puedes banear a un administrador" },
        statusCode: 403,
      };
    }

    usuario.activo = !usuario.activo;

    const usuarioActualizado = await usuario.save();

    const accion = usuarioActualizado.activo ? "desbaneado" : "baneado";

    return {
      json: {
        message: `Usuario ${accion} exitosamente`,
        datos: usuarioActualizado,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error en sistemaDeBaneo:", error);
    return {
      json: { message: "Error interno del servidor: " + error.message },
      statusCode: 500,
    };
  }
};

export const gestionarSeguidoresServices = async (idDestino, idActor) => {
  try {
    if (String(idDestino) === String(idActor)) {
      return {
        json: { message: "No puedes seguirte a ti mismo" },
        statusCode: 400,
      };
    }

    const usuarioDestino = await usuarioModel.findById(idDestino);
    if (!usuarioDestino) {
      return { json: { message: "Usuario no encontrado" }, statusCode: 404 };
    }

    const yaLoSigue = usuarioDestino.seguidores.some(
      (id) => String(id) === String(idActor),
    );

    const accion = yaLoSigue ? "$pull" : "$addToSet";

    const usuarioActualizado = await usuarioModel.findByIdAndUpdate(
      idDestino,
      { [accion]: { seguidores: idActor } },
      { new: true },
    );

    await usuarioModel.findByIdAndUpdate(idActor, {
      [accion]: { siguiendo: idDestino },
    });

    return {
      json: {
        message: yaLoSigue
          ? "Dejaste de seguir al usuario"
          : "Ahora sigues a este usuario",
        esSeguidor: !yaLoSigue,
        cantidadSeguidores: usuarioActualizado.seguidores.length,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error en gestionarSeguidoresServices:", error);
    return { json: { message: "Error interno" }, statusCode: 500 };
  }
};

export const verificarSeguimientoService = async (idDestino, idActor) => {
  try {
    const usuarioDestino = await usuarioModel.findById(idDestino);

    if (!usuarioDestino) {
      return { json: { esSeguidor: false }, statusCode: 404 };
    }

    const esSeguidor = usuarioDestino.seguidores.some(
      (id) => String(id) === String(idActor),
    );

    return {
      json: { esSeguidor },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error verificando seguimiento:", error);
    return { json: { esSeguidor: false }, statusCode: 500 };
  }
};
