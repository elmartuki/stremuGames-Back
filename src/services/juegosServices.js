import mongoose from "mongoose";
import { juegosModel } from "../models/juegosModel.js";
import { usuarioModel } from "../models/usuariosModel.js";

export const agregarJuegoServices = async (idUsuario, nuevoJuego) => {
  try {
    const studio = await usuarioModel
      .findById(idUsuario)
      .select("nombreUsuario");

    if (!studio) {
      return {
        json: { message: "No se encontró el estudio" },
        statusCode: 404,
      };
    }

    const juegoDB = await juegosModel.create({
      ...nuevoJuego,
      studioId: idUsuario,
      desarrolladora: studio.nombreUsuario,
    });

    await usuarioModel.updateOne(
      { _id: idUsuario },
      { $push: { juegosSubidos: juegoDB._id } },
    );

    return {
      json: {
        message: "Juego creado y vinculado correctamente",
        datos: juegoDB,
      },
      statusCode: 201,
    };
  } catch (error) {
    return { json: { message: "Error interno del servidor" }, statusCode: 500 };
  }
};

export const obtenerJuegosServices = async () => {
  try {
    const juegos = await juegosModel.find({ mostrar: true }).lean();

    return {
      json: { message: "Juegos obtenidos correctamente", datos: juegos },
      statusCode: 200,
    };
  } catch (error) {
    return { json: { message: "Error interno del servidor" }, statusCode: 500 };
  }
};

export const obtenerUnJuegoPorStudioServices = async (id) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };
    const juego = await juegosModel.findOne(query).lean();

    if (!juego) {
      return { json: { message: "No se encontró el juego" }, statusCode: 404 };
    }

    return {
      json: { message: "Juego obtenido con éxito", datos: juego },
      statusCode: 200,
    };
  } catch (error) {
    return { json: { message: "Error interno del servidor" }, statusCode: 500 };
  }
};

export const obtenerJuegosPorStudioServices = async (idUsuario) => {
  try {
    const juegos = await juegosModel.find({ studioId: idUsuario }).lean();

    if (!juegos.length) {
      return {
        json: { message: "Este estudio no tiene juegos" },
        statusCode: 404,
      };
    }

    return {
      json: { message: "Juegos obtenidos con éxito", datos: juegos },
      statusCode: 200,
    };
  } catch (error) {
    return { json: { message: "Error interno del servidor" }, statusCode: 500 };
  }
};

export const editarUnJuegoServices = async (id, datos) => {
  try {
    const juegoActualizado = await juegosModel.findByIdAndUpdate(id, datos, {
      new: true,
      lean: true,
    });

    if (!juegoActualizado) {
      return { json: { message: "El juego no existe" }, statusCode: 404 };
    }

    return {
      json: {
        message: "Juego actualizado correctamente",
        datos: juegoActualizado,
      },
      statusCode: 200,
    };
  } catch (error) {
    return { json: { message: "Error al editar el juego" }, statusCode: 500 };
  }
};

export const eliminarUnJuegoServices = async (id) => {
  try {
    const juegoEliminado = await juegosModel.findByIdAndDelete(id);

    if (!juegoEliminado) {
      return { json: { message: "El juego no existe" }, statusCode: 404 };
    }

    if (juegoEliminado.studioId) {
      await usuarioModel.updateOne(
        { _id: juegoEliminado.studioId },
        { $pull: { juegosSubidos: id } },
      );
    }

    return {
      json: { message: "Juego eliminado correctamente", datos: juegoEliminado },
      statusCode: 200,
    };
  } catch (error) {
    return { json: { message: "Error al eliminar el juego" }, statusCode: 500 };
  }
};

export const gestionarVisualizacionServices = async (id) => {
  try {
    const juego = await juegosModel.findByIdAndUpdate(
      id,
      [{ $set: { mostrar: { $not: "$mostrar" } } }],
      { new: true, lean: true },
    );

    if (!juego) {
      return { json: { message: "Juego no encontrado" }, statusCode: 404 };
    }

    return {
      json: { message: "Estado de visualización actualizado", datos: juego },
      statusCode: 200,
    };
  } catch (error) {
    return { json: { message: "Error en el servidor" }, statusCode: 500 };
  }
};

export const gestionarFavoritosServices = async (idJuego, idUsuario) => {
  try {
    const juego = await juegosModel.findById(idJuego).select("usuarios_likes");

    if (!juego) {
      return { json: { message: "Juego no encontrado" }, statusCode: 404 };
    }

    const yaTieneLike = juego.usuarios_likes.includes(idUsuario);
    const operador = yaTieneLike ? "$pull" : "$addToSet";

    const [juegoActualizado] = await Promise.all([
      juegosModel.findByIdAndUpdate(
        idJuego,
        { [operador]: { usuarios_likes: idUsuario } },
        { new: true, lean: true },
      ),
      usuarioModel.updateOne(
        { _id: idUsuario },
        { [operador]: { favoritos: idJuego } },
      ),
    ]);

    return {
      json: {
        message: yaTieneLike
          ? "Eliminado de favoritos"
          : "Agregado a favoritos",
        esFavorito: !yaTieneLike,
        cantidadFavoritos: juegoActualizado.usuarios_likes.length,
      },
      statusCode: 200,
    };
  } catch (error) {
    return { json: { message: "Error interno del servidor" }, statusCode: 500 };
  }
};

export const verificarEstadoFavoritoService = async (idJuego, idUsuario) => {
  try {
    const juego = await juegosModel.exists({
      _id: idJuego,
      usuarios_likes: idUsuario,
    });

    return {
      json: { esFavorito: !!juego },
      statusCode: 200,
    };
  } catch (error) {
    return { json: { esFavorito: false }, statusCode: 500 };
  }
};
