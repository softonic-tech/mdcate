import mongoose from "mongoose";

const counselingSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sessionLink: { type: String, required: true },
    expertName: { type: String, required: true, trim: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    maxParticipants: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

counselingSessionSchema.index({ scheduledAt: 1, isActive: 1 });

export default mongoose.model("CounselingSession", counselingSessionSchema);
