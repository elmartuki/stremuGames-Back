import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { PedidoModel } from "../models/pedidoModel.js";
import { carritoModel } from "../models/carritoModel.js";
import { juegosModel } from "../models/juegosModel.js";
import { usuarioModel } from "../models/usuariosModel.js";
import dotenv from "dotenv";

dotenv.config();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export const createPreferenceServicio = async (idUsuario, body) => {
  try {
    const { items } = body;

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        json: { error: "El carrito está vacío" },
      };
    }

    const itemsValidos = items.filter(
      (item) =>
        item.title &&
        Number(item.unit_price) > 0 &&
        !isNaN(Number(item.unit_price)),
    );

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: itemsValidos.map((item) => ({
          title: String(item.title),
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.unit_price),
          currency_id: "ARS",
        })),
        back_urls: {
          success: `${process.env.URL_FRONTEND}/pago/exitoso/`,
          failure: `${process.env.URL_FRONTEND}/pago/fallido/`,
          pending: `${process.env.URL_FRONTEND}/pago/pendiente`,
        },
        auto_return: "approved",

        external_reference: String(idUsuario),

        notification_url: `${process.env.URL_FRONTEND}/api/payment/webhook`,
      },
    });

    return {
      statusCode: 200,
      json: { init_point: result.init_point },
    };
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    return {
      statusCode: 500,
      json: { error: "Error al generar el pago" },
    };
  }
};

export const webhookServicio = async (body) => {
  try {
    const type = body.type || body.topic;
    if (type !== "payment") return { statusCode: 200 };

    const paymentId = body.data?.id || body.id;
    if (!paymentId) return { statusCode: 200 };

    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });

    if (result.status !== "approved") {
      console.log(`⚠️ Pago ${paymentId} no aprobado: ${result.status}`);
      return { statusCode: 200 };
    }

    const userId = result.external_reference;
    if (!userId) {
      console.error("❌ No se encontró userId en external_reference");
      return { statusCode: 200 };
    }

    const existe = await PedidoModel.findOne({
      paymentId: paymentId.toString(),
    });
    if (existe) return { statusCode: 200 };

    const carrito = await carritoModel
      .findOne({ idUsuario: userId })
      .populate("juegos.juegoId");

    if (!carrito || carrito.juegos.length === 0) {
      console.log("⚠️ Carrito vacío al procesar el pago");
      return { statusCode: 200 };
    }

    for (const item of carrito.juegos) {
      if (item.juegoId) {
        await juegosModel.findByIdAndUpdate(item.juegoId._id, {
          $inc: {
            ventasTotales: 1,
            ingresosGenerados: Number(item.precio),
          },
        });
      }
    }

    const idsJuegosComprados = carrito.juegos
      .filter((item) => item.juegoId)
      .map((item) => item.juegoId._id);

    await usuarioModel.findByIdAndUpdate(userId, {
      $addToSet: { juegosComprados: { $each: idsJuegosComprados } },
    });

    const nuevoPedido = new PedidoModel({
      idUsuario: userId,
      paymentId: paymentId.toString(),
      total: Number(result.transaction_amount),
      juegos: carrito.juegos.map((j) => ({
        idJuego: j.juegoId?._id,
        titulo: j.juegoId?.titulo || "Juego",
        imagenPortada: j.juegoId?.imagenPortada || "",
        precio: j.precio,
      })),
      estado: "approved",
    });

    await nuevoPedido.save();

    carrito.juegos = [];
    carrito.total = 0;
    await carrito.save();

    console.log(
      `✅ Pago ${paymentId} procesado con éxito para usuario ${userId}`,
    );
    return { statusCode: 200 };
  } catch (error) {
    console.error("❌ Error en webhook:", error);

    return { statusCode: 500 };
  }
};
