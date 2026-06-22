import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

const fileFilter = (_req, file, cb) => {
  const name = file.originalname?.toLowerCase() || "";
  const allowedByName = name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".doc");

  if (ALLOWED_TYPES.has(file.mimetype) || allowedByName) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest("Only .docx and .pdf files are allowed"), false);
  }
};

export const uploadMcqFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
}).single("file");
