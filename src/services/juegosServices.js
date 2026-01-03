import { juegosModel } from "../models/juegosModel.js";

export const agregarJuegoServices = async (nuevoJuego) => {
  try {
    const juegoDB = await new juegosModel(nuevoJuego);
    await juegoDB.save();

    if (!nuevoJuego)
      return {
        json: {
          message: "No se guardo",
          datos: juegoDB,
        },
        statusCode: 200,
      };

    return {
      json: {
        message: "Texto ejemplo",
        datos: nuevoJuego,
      },
      statusCode: 200,
    };
  } catch (error) {
    return {
      json: { message: "Texto ejemplo" },
      statusCode: 500,
    };
  }
};

export const obtenerJuegosServices = async () => {
  try {
    const juegos = await juegosModel.find();

    return {
      json: {
        message: "Juegos obtenidos correctamente",
        datos: juegos,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al obtener juegos:", error);
    return {
      json: { message: "Error interno del servidor" },
      statusCode: 500,
    };
  }
};

export const obtenerUnJuegoServices = async (id) => {
  try {
    const juego = await juegosModel.findById(id);

    return {
      json: {
        message: "Juego obtenido correctamente",
        datos: juego,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al obtener juegos:", error);
    return {
      json: { message: "Error interno del servidor" },
      statusCode: 500,
    };
  }
};

export const editarUnJuegoServices = async (id, datos) => {
  try {
    const juegoActualizado = await juegosModel.findByIdAndUpdate(id, datos, {
      new: true,
    });

    if (!juegoActualizado) {
      return {
        json: { message: "El juego no existe" },
        statusCode: 404,
      };
    }

    return {
      json: {
        message: "Juego actualizado correctamente",
        datos: juegoActualizado,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al editar juego:", error);
    return {
      json: { message: "Error interno del servidor: " + error.message },
      statusCode: 500,
    };
  }
};

export const eliminarUnJuegoServices = async (id) => {
  try {
    const juegoEliminado = await juegosModel.findByIdAndDelete(id);

    if (!juegoEliminado) {
      return {
        json: { message: "El juego no existe" },
        statusCode: 404,
      };
    }

    return {
      json: {
        message: "Juego eliminado correctamente",
        datos: juegoEliminado,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al editar juego:", error);
    return {
      json: { message: "Error interno del servidor: " + error.message },
      statusCode: 500,
    };
  }
};
