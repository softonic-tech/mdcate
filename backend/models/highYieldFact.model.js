import mongoose from "mongoose";

const highYieldFactSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    content: {
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

    category: {
      type: String,
      enum: ["general", "important", "exam", "formula"],
      default: "general",
    },

    priority: {
      type: Number,
      default: 1, // 1–5
    },

    sourceType: {
      type: String,
      enum: ["manual", "flashcard", "question", "pastpaper", "auto"],
      default: "manual",
    },

    examFrequency: {
      type: Number,
      default: 0,
    },

    tags: [String],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

highYieldFactSchema.index({ subjectId: 1, priority: -1 });

export default mongoose.model("HighYieldFact", highYieldFactSchema);