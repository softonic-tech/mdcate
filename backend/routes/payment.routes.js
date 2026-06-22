import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getMySubscription,
  initiateCheckout,
  completeMockPayment,
  jazzCashCallback,
  easypaisaCallback,
  getPaymentStatus,
  getMyPayments,
  getAllPayments,
  manualApprovePayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.get("/subscription/me", protect, getMySubscription);
router.get("/payments/me", protect, getMyPayments);
router.get("/payments/status/:txnRef", protect, getPaymentStatus);
router.post("/payments/checkout", protect, initiateCheckout);
router.post("/payments/mock-complete", protect, completeMockPayment);

router.post("/payments/jazzcash/callback", jazzCashCallback);
router.get("/payments/easypaisa/callback", easypaisaCallback);

router.get("/payments", protect, isAdmin, getAllPayments);
router.post("/payments/:id/approve", protect, isAdmin, manualApprovePayment);

export default router;
