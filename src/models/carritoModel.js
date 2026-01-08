import mongoose from "mongoose";

const { Schema } = mongoose;

const carritoSchema = new Schema(
  {
    idUsuario: {
      type: Schema.Types.ObjectId,
      ref: "usuarios",
      required: true,
      unique: true,
    },

    juegos: [
      {
        juegoId: {
          type: Schema.Types.ObjectId,
          ref: "juegos",
          required: true,
        },

        titulo: {
          type: String,
          required: true,
        },

        precio: {
          type: Number,
          required: true,
          min: 0,
        },

        imagenPortada: {
          type: String,
          required: true,
        },
      },
    ],

    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

carritoSchema.pre("save", function () {
  this.total = this.juegos.reduce((acc, juego) => acc + juego.precio, 0);
});

export const carritoModel = mongoose.model("carritos", carritoSchema);
