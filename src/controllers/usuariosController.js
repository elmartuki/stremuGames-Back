import * as usuariosService from "../services/usuariosServices.js";

export const register = async (req, res) => {
  try {
    const user = await usuariosService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const token = await usuariosService.login(req.body);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};


