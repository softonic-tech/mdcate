import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { uploadBookFiles } from "../middlewares/uploadBook.js";
import * as ctrl from "../controllers/book.controller.js";

const router = express.Router();

function bookMultipartMaybe(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (ct.startsWith("multipart/form-data")) {
    return uploadBookFiles(req, res, next);
  }
  next();
}

router.get("/", ctrl.getBooks);
router.get("/download/:id", ctrl.downloadBook);
router.get("/view/:id", ctrl.viewBook);
router.get("/:id", ctrl.getBook);
router.post("/", protect, isAdmin, bookMultipartMaybe, ctrl.createBook);
router.put("/:id", protect, isAdmin, bookMultipartMaybe, ctrl.updateBook);
router.delete("/:id", protect, isAdmin, ctrl.deleteBook);

export default router;
