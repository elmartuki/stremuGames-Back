import { usuarioModel } from "../models/usuariosModel.js";
import { juegosModel } from "../models/juegosModel.js";
import { carritoModel } from "../models/carritoModel.js";
import admin from "../config/FireBase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

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

    if (!usuario || !usuario.activo) {
      return {
        statusCode: 401,
        json: { message: "Credenciales inválidas o cuenta inactiva" },
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

export const recuperarContraseniaService = async (email) => {
  try {
    const usuario = await usuarioModel.findOne({ email });
    if (!usuario) {
      return {
        statusCode: 404,
        json: {
          message: "No existe ninguna cuenta registrada con este correo.",
        },
      };
    }
    const codigoDeRecuperacion = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    usuario.codigoRecuperacion = codigoDeRecuperacion;
    usuario.expiracionCodigo = new Date(Date.now() + 15 * 60 * 1000);
    await usuario.save();
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "stremusoporte@gmail.com",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `Soporte StremuGames <stremusoporte@gmail.com>`,
      to: email,
      subject: `🔒 Código de Recuperación - StremuGames`,
      html: `
        <div style="background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 20px; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid #27272a; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid #27272a;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">CÓDIGO DE RECUPERACIÓN</h2>
              <p style="margin: 5px 0 0 0; color: #84cc16; font-size: 14px; font-weight: 600; letter-spacing: 1px;">STREMU GAMES</p>
            </div>

            <div style="padding: 30px; text-align: center;">
              <p style="color: #e4e4e7; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Hola <strong>${usuario.nombreUsuario}</strong>,<br><br>
                Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar con el proceso:
              </p>

              <div style="display: inline-block; background-color: #18181b; border: 2px dashed #84cc16; padding: 15px 30px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 36px; color: #84cc16; letter-spacing: 5px;">${codigoDeRecuperacion}</h1>
              </div>

              <p style="color: #71717a; font-size: 13px; margin-top: 15px;">
                Este código expirará en 15 minutos por motivos de seguridad.<br>
                Si no fuiste tú quien solicitó este cambio, ignora este correo.
              </p>
            </div>

            <div style="background-color: #0c0c0c; padding: 15px; text-align: center; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px;">StremuGames &copy; ${new Date().getFullYear()} - Sistema de Soporte</p>
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      json: { message: "Te hemos enviado un código de 6 dígitos a tu correo." },
    };
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error);
    return {
      statusCode: 500,
      json: {
        message: "Error interno del servidor al intentar enviar el correo.",
      },
    };
  }
};

export const cambiarContraseniaService = async (email, codigo, nuevaPassword) => {
  try {
    const usuario = await usuarioModel.findOne({ email });

    if (!usuario) {
      return {
        statusCode: 404,
        json: { message: "Usuario no encontrado." },
      };
    }

    if (!usuario.codigoRecuperacion || usuario.codigoRecuperacion !== codigo) {
      return {
        statusCode: 400,
        json: { message: "El código ingresado es incorrecto." },
      };
    }

    if (new Date() > usuario.expiracionCodigo) {
      return {
        statusCode: 400,
        json: { message: "El código ha expirado. Por favor, vuelve al paso anterior y solicita uno nuevo." },
      };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(nuevaPassword, salt);

    usuario.password = passwordHasheada;
    usuario.codigoRecuperacion = null;
    usuario.expiracionCodigo = null;

    await usuario.save();

    return {
      statusCode: 200,
      json: { message: "Contraseña actualizada con éxito." },
    };
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return {
      statusCode: 500,
      json: { message: "Error interno del servidor al actualizar la contraseña." },
    };
  }
};

export const verificarCodigoService = async (email, codigo) => {
  try {
    const usuario = await usuarioModel.findOne({ email });

    if (!usuario) {
      return {
        statusCode: 404,
        json: { message: "Usuario no encontrado." },
      };
    }

    if (!usuario.codigoRecuperacion || usuario.codigoRecuperacion !== codigo) {
      return {
        statusCode: 400,
        json: { message: "El código ingresado es incorrecto." },
      };
    }

    if (new Date() > usuario.expiracionCodigo) {
      return {
        statusCode: 400,
        json: { message: "El código ha expirado. Por favor, solicita uno nuevo." },
      };
    }

    return {
      statusCode: 200,
      json: { message: "Código verificado correctamente." },
    };
  } catch (error) {
    console.error("Error al verificar código:", error);
    return {
      statusCode: 500,
      json: { message: "Error interno del servidor al verificar el código." },
    };
  }
};