import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import env from "../config/env.config.js";
import { assertValidSession } from "../services/session.service.js";

export const protect = async (req, _res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(ApiError.unauthorized("Not authorized, no token provided"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    assertValidSession(decoded, user);

    req.user = user;
    next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Optional auth - attaches user if token present, continues otherwise
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      assertValidSession(decoded, user);
      req.user = user;
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};
