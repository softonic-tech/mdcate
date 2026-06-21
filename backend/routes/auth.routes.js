import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import * as ctrl from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", authLimiter, validate(["email", "password", "username"]), ctrl.signup);
router.post("/login", authLimiter, validate(["email", "password"]), ctrl.login);
router.get("/me", protect, ctrl.getMe);
router.post("/logout", protect, ctrl.logout);
router.post("/forgot-password", authLimiter, validate(["email"]), ctrl.forgotPassword);
router.post("/reset-password", validate(["token", "password"]), ctrl.resetPassword);
router.get("/google", ctrl.redirectToGoogle);
router.get("/google/callback", ctrl.googleCallback);
router.get("/facebook", ctrl.redirectToFacebook);
router.get("/facebook/callback", ctrl.facebookCallback);

export default router;
