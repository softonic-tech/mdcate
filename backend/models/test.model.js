import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Test title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["mock", "quiz", "adaptive", "pastPaper"],
      required: [true, "Test type is required"],
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
    duration: {
      type: Number,
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    questionCount: {
      type: Number,
      enum: [1,5 ,10, 30, 50, 100],
      default: 30,
    },
    paperYear: {
      type: Number,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

testSchema.index({ type: 1 });

export default mongoose.model("Test", testSchema);
