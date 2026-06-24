import jwt from "jsonwebtoken";
import env from "../config/env.config.js";

export const generateToken = (userId, sessionVersion = 0) => {
  return jwt.sign({ id: userId, sv: sessionVersion }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE || "7d",
  });
};

export const generateRefreshToken = (userId, sessionVersion = 0) => {
  return jwt.sign({ id: userId, sv: sessionVersion }, env.JWT_REFRESH_SECRET || env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE || "30d",
  });
};
