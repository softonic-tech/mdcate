import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/device.controller.js";

const router = express.Router();
router.use(protect);
router.post("/register", ctrl.registerDevice);
router.get("/", ctrl.getUserDevices);
router.delete("/:id", ctrl.removeDevice);

export default router;
