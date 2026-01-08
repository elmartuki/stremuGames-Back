import mongoose from "mongoose";

const PedidoSchema = new mongoose.Schema(
  {
    idUsuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usuarios",
      required: true,
    },
    paymentId: { type: String, required: true, unique: true },
    total: { type: Number, required: true },
    juegos: [
      {
        idJuego: { type: mongoose.Schema.Types.ObjectId, ref: "juegos" },
        titulo: String,
        precio: Number,
      },
    ],
    estado: { type: String, default: "approved" },
  },
  { timestamps: true }
);

export const PedidoModel = mongoose.model("pedidos", PedidoSchema);
