import { carritoModel } from "../models/carritoModel.js";
import { juegosModel } from "../models/juegosModel.js";
import { usuarioModel } from "../models/usuariosModel.js";

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
