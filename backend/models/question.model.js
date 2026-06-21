import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length >= 2, "At least 2 options required"],
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: {
      type: String,
      default: "",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    tags: [String],
    isPastPaper: {
      type: Boolean,
      default: false,
    },
    paperYear: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

questionSchema.index({ text: 1, subjectId: 1, chapterId: 1 }, { unique: true });
questionSchema.index({ subjectId: 1, difficulty: 1 });
questionSchema.index({ isPastPaper: 1, paperYear: 1 });

questionSchema.pre("save", function () {
  if (this.correctAnswer >= this.options.length) {
    return next(new Error("Correct answer index out of range"));
  }
});

export default mongoose.model("Question", questionSchema);
