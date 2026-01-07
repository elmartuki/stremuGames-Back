import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombreUsuario: { type: String, required: true, trim: true, unique: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: { type: String, required: true },
    foto_de_perfil: { type: String, default: "" },
    biografia: { type: String, default: "" },
    rol: {
      type: String,
      enum: ["user", "admin", "empresa"],
      default: "user",
    },

    juegosSubidos: [{ type: mongoose.Schema.Types.ObjectId, ref: "juegos" }],
    juegosDeseados: [{ type: mongoose.Schema.Types.ObjectId, ref: "juegos" }],
    juegosComprados: [{ type: mongoose.Schema.Types.ObjectId, ref: "juegos" }],
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const usuarioModel = mongoose.model("usuarios", usuarioSchema);
