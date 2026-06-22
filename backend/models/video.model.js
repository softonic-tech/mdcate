import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Video URL required"],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    keyPoints: [{ type: String, trim: true }],
    aiFlashcards: [
      {
        front: { type: String, trim: true },
        back: { type: String, trim: true },
      },
    ],
    aiQuestions: [
      {
        text: { type: String, trim: true },
        options: [{ type: String, trim: true }],
        correctAnswer: { type: Number, min: 0 },
        explanation: { type: String, default: "" },
      },
    ],
    errorMessage: {
      type: String,
      default: "",
    },
    processingStage: {
      type: String,
      enum: ["queued", "fetching_content", "transcribing", "summarizing", "done"],
      default: "queued",
    },
    sourcePlatform: {
      type: String,
      default: "",
    },
    contentMethod: {
      type: String,
      enum: ["", "captions", "whisper"],
      default: "",
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    flashcards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flashcard",
      },
    ],
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);
