import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: function () {
        return !this.googleId && !this.facebookId;
      },
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      required: function () {
        return !this.googleId && !this.facebookId;
      },
      select: false,
    },

    googleId: { type: String, default: null },
    facebookId: { type: String, default: null },

    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    profilePicture: { type: String, default: null },

    avatarSource: {
      type: String,
      enum: ["google", "facebook", "cloudinary", null],
      default: null,
    },

    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    academic: {
      studentName: { type: String, trim: true, default: "" },
      studentId: { type: String, default: "" },
      batch: { type: String, default: "" },
      college: { type: String, default: "" },
      institution: { type: String, default: "" },
      board: { type: String, default: "" },
      year: { type: String, default: "" },
      targetExam: { type: String, default: "" },
      targetScore: { type: Number, default: null },
    },

    isVerified: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null },

    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.index({ points: -1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

export default mongoose.model("User", userSchema);
