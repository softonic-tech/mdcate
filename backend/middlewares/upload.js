import multer from "multer";
import ApiError from "../utils/ApiError.js";

// Use memoryStorage for serverless (Vercel) - no filesystem access
const storage = multer.memoryStorage();

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (_req, file, cb) => {
  if (IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest("Only JPEG, PNG, and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
