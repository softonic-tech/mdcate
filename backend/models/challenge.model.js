import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["quiz", "miniTest"],
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
    points: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

challengeSchema.index({ type: 1, isActive: 1, endDate: 1 });

export default mongoose.model("Challenge", challengeSchema);
