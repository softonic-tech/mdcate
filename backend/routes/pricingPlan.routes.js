import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getPublicPlans,
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/pricingPlan.controller.js";

const router = Router();

router.get("/plans", getPublicPlans);
router.get("/", protect, isAdmin, getAllPlans);
router.get("/:id", protect, isAdmin, getPlanById);
router.post("/", protect, isAdmin, createPlan);
router.put("/:id", protect, isAdmin, updatePlan);
router.delete("/:id", protect, isAdmin, deletePlan);

export default router;
