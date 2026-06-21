import mongoose from "mongoose";

const notesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    content: { type: String, default: "" },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },

    type: {
      type: String,
      enum: ["shortcut", "formula", "summary", "general"],
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    image: {
      url: String,
      publicId: String,
    },

    pdf: {
      url: String,
      key: String,
    },

    sourceType: {
      type: String,
      enum: ["text", "image", "pdf"],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Note", notesSchema);