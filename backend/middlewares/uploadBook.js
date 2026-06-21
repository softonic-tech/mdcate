import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const uploadBookFiles = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);
