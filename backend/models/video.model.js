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
