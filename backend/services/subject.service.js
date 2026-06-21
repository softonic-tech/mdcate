import Subject from "../models/subject.model.js";
import ApiError from "../utils/ApiError.js";

export const createSubjectService = async (data) => {
  const exists = await Subject.findOne({ name: data.name, board: data.board });
  if (exists) throw ApiError.conflict("Subject with this board already exists");
  return Subject.create(data);
};

export const updateSubjectService = async (id, data) => {
  const subject = await Subject.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!subject) throw ApiError.notFound("Subject not found");
  return subject;
};

export const getSubjectsService = async (filters = {}) => {
  const query = {};
  if (filters.board) query.board = filters.board;
  return Subject.find(query).sort({ name: 1 });
};

export const getSubjectByIdService = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) throw ApiError.notFound("Subject not found");
  return subject;
};

export const deleteSubjectService = async (id) => {
  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) throw ApiError.notFound("Subject not found");
};
