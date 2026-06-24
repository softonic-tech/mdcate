import axios from "axios";
import crypto from "crypto";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { verifyGoogleToken } from "../utils/googleVerify.js";
import { sendResetPasswordEmail } from "./email.service.js";
import { publishToQueue, QUEUES } from "../config/rabbitmq.config.js";
import env from "../config/env.config.js";
import { initializeUnpaidSubscription, buildSubscriptionSummary } from "./subscription.service.js";

const isAdminEmail = (email) => env.ADMIN_EMAIL && email === env.ADMIN_EMAIL;

export const safeUserData = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  profilePicture: user.profilePicture,
  provider: user.provider,
  role: user.role,
  points: user.points,
  streak: user.streak,
  subscription: buildSubscriptionSummary(user),
});

export const signupService = async ({ username, email, password }) => {
  if (!email) throw ApiError.badRequest("Email is required");
  if (!password) throw ApiError.badRequest("Password is required");
  if (!username) throw ApiError.badRequest("Username is required");

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("User already exists with this email");

  const user = await User.create({
    username,
    email,
    password,
    provider: "local",
    role: isAdminEmail(email) ? "admin" : "user",
  });

  initializeUnpaidSubscription(user);
  await user.save({ validateBeforeSave: false });

  return user;
};

export const loginService = async ({ email, password }) => {
  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  if (user.googleId || user.facebookId) {
    throw ApiError.badRequest(
      `Please log in using ${user.provider === "google" ? "Google" : "Facebook"}`
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  await updateLoginStreak(user);

  return user;
};

const updateLoginStreak = async (user) => {
  const now = new Date();
  const lastLogin = user.lastLoginDate;

  if (lastLogin) {
    const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.streak += 1;
    } else if (diffDays > 1) {
      user.streak = 1;
    }
  } else {
    user.streak = 1;
  }

  user.lastLoginDate = now;
  user.points += 5;
  await user.save({ validateBeforeSave: false });

  publishToQueue(QUEUES.BADGE_CHECK, {
    userId: user._id.toString(),
    event: "daily_login",
    streak: user.streak,
  });
};

export const forgotPasswordService = async (email) => {
  if (!email) throw ApiError.badRequest("Email is required");

  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound("No account found with this email");

  if (user.googleId || user.facebookId) {
    throw ApiError.badRequest("Password reset is not available for social login accounts");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendResetPasswordEmail(user.email, resetToken, user.username);
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal("Failed to send reset email. Please try again.");
  }
};

export const resetPasswordService = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw ApiError.badRequest("Token and new password are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw ApiError.badRequest("Reset token is invalid or has expired");

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

export const googleAuthService = async (googleIdToken) => {
  let payload;
  try {
    payload = await verifyGoogleToken(googleIdToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired Google token");
  }

  const { sub, email, picture } = payload;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      username: email.split("@")[0],
      email,
      googleId: sub,
      provider: "google",
      isVerified: true,
      profilePicture: picture,
      avatarSource: "google",
      role: isAdminEmail(email) ? "admin" : "user",
    });
    initializeUnpaidSubscription(user);
    await user.save({ validateBeforeSave: false });
  } else if (!user.googleId) {
    user.googleId = sub;
    user.isVerified = true;
    if (isAdminEmail(email)) user.role = "admin";
    await user.save({ validateBeforeSave: false });
  }

  await updateLoginStreak(user);

  return user;
};

export const getFacebookAccessToken = async (code) => {
  const { data } = await axios.get(
    "https://graph.facebook.com/v23.0/oauth/access_token",
    {
      params: {
        client_id: env.FACEBOOK_APP_ID,
        client_secret: env.FACEBOOK_APP_SECRET,
        redirect_uri: env.FACEBOOK_REDIRECT_URI,
        code,
      },
    }
  );
  return data.access_token;
};

export const getFacebookProfile = async (accessToken) => {
  const { data } = await axios.get("https://graph.facebook.com/me", {
    params: {
      access_token: accessToken,
      fields: "id,name,email,picture",
    },
  });
  return data;
};

export const findOrCreateFacebookUser = async (profile) => {
  let user = await User.findOne({ email: profile.email });

  if (!user) {
    user = await User.create({
      username: profile.name,
      email: profile.email,
      facebookId: profile.id,
      provider: "facebook",
      isVerified: true,
      profilePicture: profile.picture?.data?.url || null,
      avatarSource: "facebook",
      role: isAdminEmail(profile.email) ? "admin" : "user",
    });
    initializeUnpaidSubscription(user);
    await user.save({ validateBeforeSave: false });
  } else {
    if (!user.facebookId) user.facebookId = profile.id;
    if (isAdminEmail(profile.email)) user.role = "admin";
    await user.save({ validateBeforeSave: false });
  }

  await updateLoginStreak(user);

  return user;
};
