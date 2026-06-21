import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // null = global notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // main category
    type: {
      type: String,
      enum: [
        "system",
        "achievement",
        "challenge",
        "exam",
        "reminder",
        "study",
      ],
      required: true,
    },

    // manual by admin OR auto by system
    mode: {
      type: String,
      enum: ["manual", "auto"],
      default: "manual",
    },

    // source module
    sourceType: {
      type: String,
      enum: ["manual", "exam", "studyPlan"],
      default: "manual",
    },

    // linked document id
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // read tracking
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // schedule time
    scheduledFor: {
      type: Date,
      default: null,
    },

    // sent status
    isSent: {
      type: Boolean,
      default: true,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },

    // prevent duplicate cron reminders
    reminderKey: {
      type: String,
      default: null,
    },

    // extra flexible data
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ sourceType: 1, sourceId: 1 });
notificationSchema.index({ reminderKey: 1 });

export default mongoose.model("Notification", notificationSchema);