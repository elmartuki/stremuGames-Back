import { carritoModel } from "../models/carritoModel.js";
import { juegosModel } from "../models/juegosModel.js";

export const obtenerDatosCarritoServices = async (idUsuario) => {
  const carrito = await carritoModel
    .findOne({ usuarioId: idUsuario })
    .populate("juegos.juegoId");

  if (!carrito || carrito.juegos.length === 0) {
    return {
      json: { message: "El carrito está vacío", carrito: [] },
      statusCode: 200,
    };
  }

  return {
    json: {
      message: "Carrito obtenido correctamente",
      carrito,
    },
    statusCode: 200,
  };
};

export const agregarJuegoService = async (idJuego, idUsuario) => {
  if (!idUsuario) {
    return {
      json: { message: "Usuario no autenticado" },
      statusCode: 401,
    };
  }

  const juego = await juegosModel.findById(idJuego);

  if (!juego) {
    return {
      json: { message: "Juego no encontrado" },
      statusCode: 404,
    };
  }

  let carrito = await carritoModel.findOne({ usuarioId: idUsuario });

  if (!carrito) {
    carrito = new carritoModel({
      usuarioId: idUsuario,
      juegos: [],
    });
  }

  const yaExiste = carrito.juegos.some((j) => j.juegoId.toString() === idJuego);

  if (yaExiste) {
    return {
      json: { message: "El juego ya está en el carrito" },
      statusCode: 200,
    };
  }

  const precioFinal =
    juego.precioDescuento && juego.precioDescuento < juego.precioBase
      ? juego.precioDescuento
      : juego.precioBase;

  carrito.juegos.push({
    juegoId: juego._id,
    titulo: juego.titulo,
    precio: precioFinal,
    imagenPortada: juego.imagenPortada,
  });

  await carrito.save();

  return {
    json: { message: "Juego agregado al carrito", carrito },
    statusCode: 200,
  };
};

export const eliminarJuegoCarritoServicios = async (idUsuario, idJuego) => {
  try {
    let carrito = await carritoModel.findOne({ usuarioId: idUsuario });

    if (!carrito) {
      return {
        json: {
          message: "El carrito no existe",
        },
        statusCode: 404,
      };
    }

    carrito.juegos = carrito.juegos.filter((item) => {
      return item.juegoId.toString() !== idJuego;
    });

    await carrito.save();

    return {
      json: {
        message: "Se elimino el usuario exitosamente!!",
        datos: carrito.juegos,
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
