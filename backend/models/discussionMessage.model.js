import mongoose from "mongoose";

const discussionMessageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionThread",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "voice"],
      default: "text",
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    audioUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

discussionMessageSchema.pre("save", function (next) {
  if (this.type === "text" && !this.content) {
    return next(new Error("Text content is required for text messages"));
  }
  if (this.type === "voice" && !this.audioUrl) {
    return next(new Error("Audio URL is required for voice messages"));
  }
  next();
});

discussionMessageSchema.index({ threadId: 1, createdAt: 1 });

export default mongoose.model("DiscussionMessage", discussionMessageSchema);
