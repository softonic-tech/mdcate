import mongoose from "mongoose";

const counselingParticipantSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounselingSession",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

counselingParticipantSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

export default mongoose.model("CounselingParticipant", counselingParticipantSchema);
