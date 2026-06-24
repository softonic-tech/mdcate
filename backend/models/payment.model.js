import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PricingPlan",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "PKR",
    },
    provider: {
      type: String,
      enum: ["jazzcash", "easypaisa", "manual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "awaiting_review", "completed", "failed", "cancelled", "rejected"],
      default: "pending",
      index: true,
    },
    txnRef: {
      type: String,
      required: true,
      unique: true,
    },
    gatewayTxnId: {
      type: String,
      default: null,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    mobileNumber: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    manualChannel: {
      type: String,
      enum: ["jazzcash", "easypaisa", "bank"],
      default: null,
    },
    studentTxnReference: {
      type: String,
      default: null,
    },
    proofScreenshotUrl: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
