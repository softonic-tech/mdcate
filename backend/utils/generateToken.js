import jwt from "jsonwebtoken";
import env from "../config/env.config.js";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE || "7d",
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET || env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE || "30d",
  });
};
