import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
      required: true,
      trim: true,
    },
    back: {
      type: String,
      required: true,
      trim: true,
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nextReview: {
      type: Date,
      default: Date.now,
    },
    interval: {
      type: Number,
      default: 1,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ["manual", "video", "ai"],
      default: "manual",
    },
  },
  { timestamps: true }
);

flashcardSchema.index({ userId: 1, nextReview: 1 });
flashcardSchema.index({ front: 1, subjectId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Flashcard", flashcardSchema);
