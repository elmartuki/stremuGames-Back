import jwt from "jsonwebtoken";

export const validarToken = (req, res, next) => {
  const tokenCompleto = req.headers.authorization;

  const token = tokenCompleto.split(" ")[1];

  try {
    const usuarioInfo = jwt.verify(token, process.env.SECRET_KEY);

    req.idUsuario = usuarioInfo.id || usuarioInfo._id;
    req.idCarrito = usuarioInfo.idCarrito;

    req.rol = usuarioInfo.rol;

    if (!req.idUsuario) {
      throw new Error("ID de usuario faltante en el token JWT.");
    }

    next();
  } catch (error) {
    console.error("Error de verificación del token:", error.message);
    return res.status(401).json({ message: "Token inválido o expirado." });
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
