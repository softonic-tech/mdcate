import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

const findUserOrFail = async (userId, select = "") => {
  const user = await User.findById(userId).select(select);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

export const getBioService = async (userId) => {
  const user = await findUserOrFail(userId, "bio");
  return user.bio || "";
};

export const updateBioService = async (userId, bio) => {
  if (bio === undefined || bio === null) {
    throw ApiError.badRequest("Bio content is required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { bio },
    { new: true, runValidators: true }
  ).select("bio");

  if (!user) throw ApiError.notFound("User not found");
  return user.bio;
};

export const deleteBioService = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { bio: "" },
    { new: true }
  ).select("bio");

  if (!user) throw ApiError.notFound("User not found");
};

export const getAcademicService = async (userId) => {
  const user = await findUserOrFail(userId, "academic");
  return user.academic || null;
};

export const updateAcademicService = async (userId, data) => {
  const user = await findUserOrFail(userId);
  user.academic = { ...(user.academic?.toObject?.() || {}), ...data };
  await user.save();
  return user.academic;
};

export const deleteAcademicService = async (userId) => {
  const user = await findUserOrFail(userId);
  user.academic = undefined;
  await user.save();
};

export const getAllUsersService = async (filters = {}) => {
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.search) {
    query.$or = [
      { username: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  return User.find(query)
    .select("-password -refreshToken -resetPasswordToken -resetPasswordExpire")
    .sort({ createdAt: -1 });
};

export const updateUserRoleService = async (userId, role) => {
  const validRoles = ["user", "admin"];
  if (!validRoles.includes(role)) throw ApiError.badRequest("Invalid role");

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password");

  if (!user) throw ApiError.notFound("User not found");
  return user;
};
