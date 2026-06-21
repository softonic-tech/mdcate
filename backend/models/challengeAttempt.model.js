import mongoose from "mongoose";

const challengeAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    score: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

challengeAttemptSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export default mongoose.model("ChallengeAttempt", challengeAttemptSchema);
