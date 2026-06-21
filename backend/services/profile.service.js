import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import ApiError from "../utils/ApiError.js";

const safeUnlink = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch { /* ignore cleanup errors */ }
};

const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const publicId = imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`profile_pics/${publicId}`);
  } catch (err) {
    console.warn("Cloudinary delete failed:", err.message);
  }
};

const uploadToCloudinary = async (filePathOrBuffer, mimetype) => {
  try {
    if (Buffer.isBuffer(filePathOrBuffer)) {
      const dataUri = `data:${mimetype};base64,${filePathOrBuffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "profile_pics",
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      });
      return result.secure_url;
    }
    const result = await cloudinary.uploader.upload(filePathOrBuffer, {
      folder: "profile_pics",
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
    });
    return result.secure_url;
  } catch (err) {
    throw ApiError.internal(`Cloudinary upload failed: ${err.message}`);
  } finally {
    if (typeof filePathOrBuffer === "string") safeUnlink(filePathOrBuffer);
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
    if (typeof filePathOrBuffer === "string") safeUnlink(filePathOrBuffer);
    throw ApiError.notFound("User not found");
  }

  if (user.avatarSource === "cloudinary") {
    await deleteCloudinaryImage(user.profilePicture);
  }

  const url = await uploadToCloudinary(filePathOrBuffer, mimetype);

  user.profilePicture = url;
  user.avatarSource = "cloudinary";
  await user.save();

  return url;
};

export const updateProfilePictureService = async (userId, filePathOrBuffer, mimetype) => {
  return saveProfilePicture(userId, filePathOrBuffer, mimetype);
};

export const deleteProfilePictureService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  if (user.avatarSource === "cloudinary") {
    await deleteCloudinaryImage(user.profilePicture);
  }

  user.profilePicture = null;
  user.avatarSource = null;
  await user.save();
};
