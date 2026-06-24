import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";

export const SESSION_SUPERSEDED_MESSAGE =
  "You were signed out because this account was used on another device.";

export const startNewSession = async (user) => {
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save({ validateBeforeSave: false });
  return user.sessionVersion;
};

export const issueAuthTokens = async (user) => {
  const sessionVersion = await startNewSession(user);
  return {
    token: generateToken(user._id, sessionVersion),
    refreshToken: generateRefreshToken(user._id, sessionVersion),
  };
};

export const invalidateUserSession = async (user) => {
  if (!user) return;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save({ validateBeforeSave: false });
};

export const assertValidSession = (decoded, user) => {
  if (!user) {
    throw ApiError.unauthorized("User belonging to this token no longer exists");
  }
  const tokenVersion = decoded?.sv;
  const currentVersion = user.sessionVersion ?? 0;
  if (tokenVersion === undefined || tokenVersion !== currentVersion) {
    throw ApiError.unauthorized(SESSION_SUPERSEDED_MESSAGE);
  }
};
