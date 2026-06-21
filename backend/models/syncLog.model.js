import mongoose from "mongoose";

const syncLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: { type: String, required: true },
    dataType: { type: String, required: true },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

syncLogSchema.index({ userId: 1, dataType: 1 });

export default mongoose.model("SyncLog", syncLogSchema);
