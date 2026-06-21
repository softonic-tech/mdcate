import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../utils/ApiError.js";

const useMemoryUpload =
  process.env.NOTES_USE_MEMORY_UPLOAD === "true" ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.VERCEL);

function createStorage() {
  if (useMemoryUpload) {
    return multer.memoryStorage();
  }

  const uploadPath =
    process.env.NOTES_UPLOAD_DIR ||
    path.join(process.cwd(), "uploads", "notes");

  try {
    fs.mkdirSync(uploadPath, { recursive: true });
  } catch (err) {
    console.warn(
      "uploadNotes: could not create disk upload dir, using memory:",
      err.message
    );
    return multer.memoryStorage();
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
}

const storage = createStorage();

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest("Only images and PDF files are allowed"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export const uploadNotesFiles = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);
