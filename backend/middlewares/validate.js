import ApiError from "../utils/ApiError.js";

export const validate = (fields) => (req, _res, next) => {
  const missing = fields.filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ""
  );

  if (missing.length > 0) {
    return next(
      ApiError.badRequest(`Missing required fields: ${missing.join(", ")}`)
    );
  }
  next();
};
