import mongoose from "mongoose";

const discussionThreadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

discussionThreadSchema.index({ title: 1, createdBy: 1 }, { unique: true });
discussionThreadSchema.index({ subjectId: 1, lastMessageAt: -1 });

export default mongoose.model("DiscussionThread", discussionThreadSchema);
