import jwt from "jsonwebtoken";
import { juegosModel } from "../models/juegosModel.js";

export const validarToken = (req, res, next) => {
  try {
    const tokenCompleto = req.headers.authorization;

    if (!tokenCompleto || !tokenCompleto.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Acceso denegado. Debes iniciar sesión." });
    }

    const token = tokenCompleto.split(" ")[1];
    const usuarioInfo = jwt.verify(token, process.env.JWT_SECRET);

    req.idUsuario = usuarioInfo.id || usuarioInfo._id;
    req.rol = usuarioInfo.rol;

    if (!req.idUsuario) {
      return res
        .status(403)
        .json({ message: "Token válido pero sin ID de usuario." });
    }

    next();
  } catch (error) {
    console.error("Error en validación de token:", error.message);
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};

export const validarPropietarioJuego = async (req, res, next) => {
  try {
    const { id } = req.params;
    const juego = await juegosModel.findById(id);

    if (!juego) {
      return res.status(404).json({ message: "Juego no encontrado." });
    }

    // Usamos studioId que es como figura en tu modelo
    const esPropietario = String(juego.studioId) === String(req.idUsuario);
    const esAdmin = req.rol === "admin";

    if (esPropietario || esAdmin) {
      next();
    } else {
      return res.status(403).json({
        message: "Acceso denegado. No tienes permiso sobre este juego.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al validar propiedad del juego." });
  }
};

export const validarPropietarioOAdmin = (req, res, next) => {
  if (!req.idUsuario) {
    return res.status(401).json({ message: "No autenticado." });
  }

  if (String(req.idUsuario) === String(req.params.id) || req.rol === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Acceso denegado. No tienes permiso sobre esta cuenta.",
    });
  }
};

export const validarAdmin = (req, res, next) => {
  if (req.rol === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Acceso denegado. Se requiere rol de Administrador.",
    });
  }
};

export const validarEmpresa = (req, res, next) => {
  if (req.rol === "empresa") {
    next();
  } else {
    return res.status(403).json({
      message: "Acceso denegado. Se requiere rol de Empresa.",
    });
  }
};

export const validarAdminOEmpresa = (req, res, next) => {
  if (req.rol === "admin" || req.rol === "empresa") {
    next();
  } else {
    return res.status(403).json({
      message: "Acceso denegado. Se requiere rol de Administrador o Empresa.",
    });
  }
};
