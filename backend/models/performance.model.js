import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

performanceSchema.index({ userId: 1, subjectId: 1 });
performanceSchema.index({ userId: 1, date: -1 });

export default mongoose.model("Performance", performanceSchema);
