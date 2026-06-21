import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    deviceType: {
      type: String,
      required: true,
      enum: ["mobile", "tablet", "desktop"],
    },
    pushToken: {
      type: String,
      default: null,
    },
    lastSyncAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

deviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export default mongoose.model("Device", deviceSchema);
