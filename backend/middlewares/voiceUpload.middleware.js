import multer from "multer";

// Use memoryStorage for serverless (Vercel) - no filesystem access
const storage = multer.memoryStorage();

export const uploadVoice = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  },
});
