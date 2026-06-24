import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import upload from "../middlewares/upload.js";
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
  submitManualPayment,
  rejectManualPayment,
} from "../controllers/payment.controller.js";
import {
  getPublicPaymentSettings,
  updatePaymentSettings,
} from "../controllers/paymentSettings.controller.js";

const router = Router();

router.get("/payment-settings", getPublicPaymentSettings);
router.put("/payment-settings", protect, isAdmin, updatePaymentSettings);

router.get("/subscription/me", protect, getMySubscription);
router.get("/payments/me", protect, getMyPayments);
router.get("/payments/status/:txnRef", protect, getPaymentStatus);
router.post("/payments/checkout", protect, initiateCheckout);
router.post("/payments/mock-complete", protect, completeMockPayment);
router.post(
  "/payments/manual",
  protect,
  upload.single("screenshot"),
  submitManualPayment
);

router.post("/payments/jazzcash/callback", jazzCashCallback);
router.get("/payments/easypaisa/callback", easypaisaCallback);

router.get("/payments", protect, isAdmin, getAllPayments);
router.post("/payments/:id/approve", protect, isAdmin, manualApprovePayment);
router.post("/payments/:id/reject", protect, isAdmin, rejectManualPayment);

export default router;
