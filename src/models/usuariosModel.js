import mongoose from "mongoose";

const { Schema } = mongoose;

const usuarioSchema = new Schema(
  {
    nombreUsuario: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    contraseña: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    rol: {
      type: String,
      enum: ["user", "admin", "empresa"],
      default: "user",
    },

    juegosDeseados: [
      {
        type: Schema.Types.ObjectId,
        ref: "juegos",
      },
    ],

    juegosComprados: [
      {
        type: Schema.Types.ObjectId,
        ref: "juegos",
      },
    ],

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const usuarioModel = mongoose.model("usuarios", usuarioSchema);
