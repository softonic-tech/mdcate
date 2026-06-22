import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { uploadToS3, deleteS3ObjectByUrl } from "../utils/s3Upload.js";

const safeUnlink = async (filePath) => {
  if (!filePath || typeof filePath !== "string") return;
  try {
    const fs = await import("fs/promises");
    await fs.unlink(filePath);
  } catch {
    /* ignore cleanup errors */
  }
};

const deleteStoredAvatar = async (user) => {
  if (!user?.profilePicture) return;
  if (user.avatarSource === "s3" || user.avatarSource === "cloudinary") {
    await deleteS3ObjectByUrl(user.profilePicture);
  }
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -refreshToken -resetPasswordToken -resetPasswordExpire")
    .populate("badges", "name description imageUrl");

  if (!user) return null;
  return user;
};

export const saveProfilePicture = async (userId, filePathOrBuffer, mimetype) => {
  const user = await User.findById(userId);
  if (!user) {
    await safeUnlink(typeof filePathOrBuffer === "string" ? filePathOrBuffer : null);
    throw ApiError.notFound("User not found");
  }

  await deleteStoredAvatar(user);

  const url = await uploadToS3({
    buffer: Buffer.isBuffer(filePathOrBuffer) ? filePathOrBuffer : undefined,
    filePath: typeof filePathOrBuffer === "string" ? filePathOrBuffer : undefined,
    mimetype,
    keyPrefix: "profile_pics",
    filename: "avatar",
  });

  user.profilePicture = url;
  user.avatarSource = "s3";
  await user.save();

  return url;
};

export const updateProfilePictureService = async (userId, filePathOrBuffer, mimetype) => {
  return saveProfilePicture(userId, filePathOrBuffer, mimetype);
};

export const deleteProfilePictureService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  await deleteStoredAvatar(user);

  user.profilePicture = null;
  user.avatarSource = null;
  await user.save();
};
