import mongoose from "mongoose";

const sectionProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    sectionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    totalQuestions: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    scorePercent: { type: Number, default: 0, min: 0, max: 100 },
    timeSpent: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sectionProgressSchema.index(
  { userId: 1, chapterId: 1, sectionIndex: 1 },
  { unique: true }
);
sectionProgressSchema.index({ userId: 1, chapterId: 1 });

export default mongoose.model("SectionProgress", sectionProgressSchema);
