import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import env from "../config/env.config.js";
import {
  signupService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  googleAuthService,
  getFacebookAccessToken,
  getFacebookProfile,
  findOrCreateFacebookUser,
  safeUserData,
} from "../services/auth.service.js";

export const signup = asyncHandler(async (req, res) => {
  const user = await signupService(req.body);
  res.status(201).json({ success: true, message: "Signup successful", data: safeUserData(user) });
});

export const login = asyncHandler(async (req, res) => {
  console.log("here");
  const user = await loginService(req.body);
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    refreshToken,
    data: safeUserData(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await forgotPasswordService(req.body.email);
  res.status(200).json({ success: true, message: "Password reset link sent to your email" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await resetPasswordService(token, password);
  res.status(200).json({ success: true, message: "Password has been reset successfully" });
});

export const redirectToGoogle = asyncHandler(async (_req, res) => {
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${env.OAUTH_REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=openid email profile` +
    `&access_type=offline`;
  res.redirect(url);
});

export const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) throw ApiError.badRequest("Authorization code missing");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.OAUTH_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  }).then((r) => r.json());

  if (!tokenRes.id_token) throw ApiError.unauthorized("Google authentication failed");

  const { user, token } = await googleAuthService(tokenRes.id_token);
  const dashboardPath = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
  res.redirect(`${env.FRONTEND_URL}${dashboardPath}?token=${token}`);
});

export const redirectToFacebook = (_req, res) => {
  const url =
    `https://www.facebook.com/v23.0/dialog/oauth` +
    `?client_id=${env.FACEBOOK_APP_ID}` +
    `&redirect_uri=${env.FACEBOOK_REDIRECT_URI}` +
    `&scope=email,public_profile`;
  res.redirect(url);
};

export const facebookCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) throw ApiError.badRequest("Facebook authorization code missing");

  const accessToken = await getFacebookAccessToken(code);
  const profile = await getFacebookProfile(accessToken);
  if (!profile.email) throw ApiError.badRequest("Facebook email permission is required");

  const user = await findOrCreateFacebookUser(profile);
  const token = generateToken(user._id);
  const dashboardPath = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
  res.redirect(`${env.FRONTEND_URL}${dashboardPath}?token=${token}`);
});

export const logout = asyncHandler(async (_req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
