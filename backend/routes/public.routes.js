import { Router } from "express";
import { getLandingStats } from "../controllers/publicLanding.controller.js";

const router = Router();

router.get("/landing", getLandingStats);

export default router;
