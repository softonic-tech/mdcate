import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import env from "../config/env.config.js";
import { getPlanByIdService } from "./pricingPlan.service.js";
import {
  activatePaidPlan,
  buildSubscriptionSummary,
  expireUserSubscription,
} from "./subscription.service.js";
import { buildJazzCashCheckout, verifyJazzCashCallback } from "./jazzcash.service.js";
import { buildEasypaisaCheckout, verifyEasypaisaCallback } from "./easypaisa.service.js";

const generateTxnRef = () => `MP${Date.now()}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

export const getMySubscriptionService = async (user) => {
  await syncSubscriptionStatus(user);
  const refreshed = await User.findById(user._id).populate("subscription.planId");
  return buildSubscriptionSummary(refreshed);
};

export const syncSubscriptionStatus = async (user) => {
  if (user.role === "admin") return user;

  const sub = user.subscription || {};
  const now = new Date();
  let changed = false;

  if (sub.status === "trialing" && sub.trialEndsAt && new Date(sub.trialEndsAt) <= now) {
    expireUserSubscription(user);
    changed = true;
  }

  if (
    sub.status === "active" &&
    sub.currentPeriodEndsAt &&
    new Date(sub.currentPeriodEndsAt) <= now
  ) {
    expireUserSubscription(user);
    changed = true;
  }

  if (changed) {
    await user.save({ validateBeforeSave: false });
  }

  return user;
};

export const initiateCheckoutService = async ({
  user,
  planId,
  provider,
  mobileNumber,
}) => {
  if (!["jazzcash", "easypaisa"].includes(provider)) {
    throw ApiError.badRequest("Invalid payment provider");
  }

  const plan = await getPlanByIdService(planId);
  if (!plan.isActive) throw ApiError.badRequest("This plan is not available");
  if (plan.price <= 0) throw ApiError.badRequest("This plan does not require payment");

  const txnRef = generateTxnRef();
  const payment = await Payment.create({
    userId: user._id,
    planId: plan._id,
    amount: plan.price,
    currency: plan.currency,
    provider,
    status: "pending",
    txnRef,
    mobileNumber: mobileNumber || null,
  });

  const checkoutPayload = {
    txnRef,
    amountPkr: plan.price,
    description: `medprep.study — ${plan.name}`,
    email: user.email,
    mobileNumber,
  };

  let checkout;
  if (provider === "jazzcash") {
    checkout = buildJazzCashCheckout(checkoutPayload);
  } else {
    checkout = buildEasypaisaCheckout(checkoutPayload);
  }

  if (checkout.mock) {
    if (env.NODE_ENV === "production") {
      throw ApiError.internal(
        `${provider === "jazzcash" ? "JazzCash" : "Easypaisa"} is not configured. Contact support.`
      );
    }

    return {
      paymentId: payment._id,
      txnRef,
      mock: true,
      message: "Sandbox mode — payment gateway credentials not configured",
    };
  }

  return {
    paymentId: payment._id,
    txnRef,
    mock: false,
    provider,
    checkout,
  };
};

export const completeMockPaymentService = async (user, paymentId) => {
  if (env.NODE_ENV === "production") {
    throw ApiError.forbidden("Mock payments are disabled in production");
  }

  const payment = await Payment.findOne({ _id: paymentId, userId: user._id });
  if (!payment) throw ApiError.notFound("Payment not found");
  if (payment.status === "completed") {
    return { alreadyCompleted: true, payment };
  }

  return finalizeSuccessfulPayment(payment, "MOCK-TXN");
};

const finalizeSuccessfulPayment = async (payment, gatewayTxnId) => {
  if (payment.status === "completed") return payment;

  const plan = await getPlanByIdService(payment.planId);
  const user = await User.findById(payment.userId);
  if (!user) throw ApiError.notFound("User not found");

  payment.status = "completed";
  payment.gatewayTxnId = gatewayTxnId;
  payment.completedAt = new Date();
  await payment.save();

  activatePaidPlan(user, plan, payment.completedAt);
  await user.save({ validateBeforeSave: false });

  return payment;
};

export const handleJazzCashCallbackService = async (body) => {
  const verification = verifyJazzCashCallback(body);
  if (!verification.valid) {
    throw ApiError.badRequest("Invalid JazzCash callback");
  }

  const payment = await Payment.findOne({ txnRef: verification.txnRef });
  if (!payment) throw ApiError.notFound("Payment not found");

  payment.gatewayResponse = body;

  if (!verification.success) {
    payment.status = "failed";
    payment.failureReason = verification.failureReason;
    await payment.save();
    return { success: false, txnRef: payment.txnRef };
  }

  await finalizeSuccessfulPayment(payment, verification.gatewayTxnId);
  return { success: true, txnRef: payment.txnRef };
};

export const handleEasypaisaCallbackService = async (query) => {
  const verification = verifyEasypaisaCallback(query);
  const payment = await Payment.findOne({
    txnRef: verification.txnRef || query.orderRefNum,
  });
  if (!payment) throw ApiError.notFound("Payment not found");

  payment.gatewayResponse = query;

  if (!verification.success) {
    payment.status = "failed";
    payment.failureReason = verification.failureReason;
    await payment.save();
    return { success: false, txnRef: payment.txnRef };
  }

  await finalizeSuccessfulPayment(payment, verification.gatewayTxnId);
  return { success: true, txnRef: payment.txnRef };
};

export const getPaymentStatusService = async (user, txnRef) => {
  const payment = await Payment.findOne({ txnRef, userId: user._id }).populate("planId");
  if (!payment) throw ApiError.notFound("Payment not found");
  return payment;
};

export const getMyPaymentsService = async (user) =>
  Payment.find({ userId: user._id })
    .populate("planId", "name slug price")
    .sort({ createdAt: -1 });

export const getAllPaymentsService = async () =>
  Payment.find()
    .populate("userId", "username email")
    .populate("planId", "name slug price")
    .sort({ createdAt: -1 });

export const manualApprovePaymentService = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound("Payment not found");
  if (payment.status === "completed") return payment;

  payment.provider = "manual";
  await finalizeSuccessfulPayment(payment, `MANUAL-${Date.now()}`);
  return payment;
};
