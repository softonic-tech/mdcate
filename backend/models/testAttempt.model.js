import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOption: {
      type: Number,
      required: true,
      min: 0,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentile: { type: Number, default: 0, min: 0, max: 100 },
    timeSpent: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

testAttemptSchema.index({ userId: 1, testId: 1 }, { unique: true });
testAttemptSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.model("TestAttempt", testAttemptSchema);
