import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    criteria: {
      type: {
        type: String,
        enum: ["login_streak", "quiz_completion", "high_score", "points_threshold", "custom"],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Badge", badgeSchema);
