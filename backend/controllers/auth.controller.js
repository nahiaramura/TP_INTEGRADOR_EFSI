import { createUser, findUserByCredentials } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  if (!first_name || first_name.length < 3 ||
      !last_name || last_name.length < 3 ||
      !username || !username.includes("@") ||
      !password || password.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Datos inválidos"
    });
  }

  try {
    const user = await createUser(first_name, last_name, username, password);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !username.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "El email es invalido.",
      token: ""
    });
  }

  try {
    const user = await findUserByCredentials(username, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario o clave inválida.",
        token: ""
      });
    }

    const token = jwt.sign({
      id: user.id,
      first_name: user.first_name,
      username: user.username
    }, process.env.JWT_SECRET, { expiresIn: "2h" });

    return res.status(200).json({
      success: true,
      message: "",
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
