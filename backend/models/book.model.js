import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    board: {
      type: String,
      enum: ["KPK", "Punjab", "Federal"],
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookSchema.index({ title: 1, subjectId: 1, board: 1 }, { unique: true });

export default mongoose.model("Book", bookSchema);
