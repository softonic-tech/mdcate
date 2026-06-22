import mongoose from "mongoose";
import env from "./env.config.js";
import { fixStudyPlanIndexes } from "../utils/fixStudyPlanIndexes.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    try {
      await fixStudyPlanIndexes();
    } catch (indexErr) {
      console.warn(`StudyPlan index migration: ${indexErr.message}`);
    }
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};
