import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One user can have many plans — non-unique index for listing by user
studyPlanSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("StudyPlan", studyPlanSchema);