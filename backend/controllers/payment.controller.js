import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/payment.service.js";
import env from "../config/env.config.js";

export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await service.getMySubscriptionService(req.user);
  res.json({ success: true, data: subscription });
});

export const initiateCheckout = asyncHandler(async (req, res) => {
  const result = await service.initiateCheckoutService({
    user: req.user,
    planId: req.body.planId,
    provider: req.body.provider,
    mobileNumber: req.body.mobileNumber,
  });
  res.json({ success: true, data: result });
});

export const completeMockPayment = asyncHandler(async (req, res) => {
  const payment = await service.completeMockPaymentService(req.user, req.body.paymentId);
  res.json({ success: true, data: payment });
});

export const jazzCashCallback = asyncHandler(async (req, res) => {
  const result = await service.handleJazzCashCallbackService(req.body);
  const redirectUrl = `${env.FRONTEND_URL}/dashboard/billing/callback?provider=jazzcash&txnRef=${result.txnRef}&success=${result.success ? "1" : "0"}`;
  res.redirect(redirectUrl);
});

export const easypaisaCallback = asyncHandler(async (req, res) => {
  const result = await service.handleEasypaisaCallbackService(req.query);
  const redirectUrl = `${env.FRONTEND_URL}/dashboard/billing/callback?provider=easypaisa&txnRef=${result.txnRef}&success=${result.success ? "1" : "0"}`;
  res.redirect(redirectUrl);
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await service.getPaymentStatusService(req.user, req.params.txnRef);
  res.json({ success: true, data: payment });
});

export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await service.getMyPaymentsService(req.user);
  res.json({ success: true, data: payments });
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await service.getAllPaymentsService();
  res.json({ success: true, data: payments });
});

export const manualApprovePayment = asyncHandler(async (req, res) => {
  const payment = await service.manualApprovePaymentService(req.params.id);
  res.json({ success: true, data: payment });
});
