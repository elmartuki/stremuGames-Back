import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombreUsuario: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Email inválido"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    foto_de_perfil: {
      type: String,
      default: "",
    },

    biografia: {
      type: String,
      maxlength: 160,
      default: "",
    },

    rol: {
      type: String,
      enum: ["user", "admin", "empresa"],
      default: "user",
    },

    juegosSubidos: [{ type: mongoose.Schema.Types.ObjectId, ref: "juegos" }],

    juegosDeseados: [{ type: mongoose.Schema.Types.ObjectId, ref: "juegos" }],

    juegosComprados: [{ type: mongoose.Schema.Types.ObjectId, ref: "juegos" }],

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const usuarioModel = mongoose.model("usuarios", usuarioSchema);
