import ContactMessage from "../models/contactMessage.model.js";
import ApiError from "../utils/ApiError.js";

export const createMessage = async (data) => {
  return ContactMessage.create(data);
};

export const getMessages = async (userId, isAdmin = false) => {
  if (isAdmin) return ContactMessage.find().sort({ createdAt: -1 });
  return ContactMessage.find({ userId }).sort({ createdAt: -1 });
};

export const updateMessageStatus = async (id, status, response = null) => {
  const validStatus = ["pending", "resolved"];
  if (!validStatus.includes(status)) {
    throw ApiError.badRequest("Invalid status value");
  }

  const msg = await ContactMessage.findByIdAndUpdate(
    id,
    { status, response },
    { new: true, runValidators: true }
  );
  if (!msg) throw ApiError.notFound("Message not found");
  return msg;
};

export const deleteMessage = async (id) => {
  const msg = await ContactMessage.findByIdAndDelete(id);
  if (!msg) throw ApiError.notFound("Message not found");
};
