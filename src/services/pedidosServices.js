import { PedidoModel } from "../models/pedidoModel.js";

export const encontrarComprasServices = async (idUsuario) => {
  try {
    const obtenerPedidos = await PedidoModel.find({ idUsuario: idUsuario });

    return {
      json: {
        message: "Lista de compras encontrada",
        datos: obtenerPedidos,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error en encontrarComprasServices:", error);
    return {
      json: { message: "Error al obtener las compras" },
      statusCode: 500,
    };
  }
};
