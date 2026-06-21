import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    highYieldPoints: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

chapterSchema.index({ name: 1, subjectId: 1 }, { unique: true });

export default mongoose.model("Chapter", chapterSchema);
