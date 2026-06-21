import ApiError from "../utils/ApiError.js";

export const isAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(ApiError.forbidden("Admin access only"));
  }
  next();
};
