import mongoose from "mongoose";

const offlineContentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["test", "note", "flashcard", "book"],
      trim: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

offlineContentSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });

export default mongoose.model("OfflineContent", offlineContentSchema);
