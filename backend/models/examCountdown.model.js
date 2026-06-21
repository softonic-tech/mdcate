// ===============================
// models/examCountdown.model.js
// ===============================
import mongoose from "mongoose";

const examCountdownSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("ExamCountdown", examCountdownSchema);