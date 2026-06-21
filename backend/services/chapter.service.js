import Chapter from "../models/chapter.model.js";
import ApiError from "../utils/ApiError.js";

export const createChapterService = async (data) => {
  const exists = await Chapter.findOne({
    name: data.name,
    subjectId: data.subjectId,
  });
  if (exists) throw ApiError.conflict("Chapter already exists in this subject");
  return Chapter.create(data);
};

export const getChaptersBySubjectService = async (subjectId) => {
  return Chapter.find({ subjectId }).populate("subjectId", "name board");
};

export const getChapterByIdService = async (id) => {
  const chapter = await Chapter.findById(id).populate("subjectId", "name board");
  if (!chapter) throw ApiError.notFound("Chapter not found");
  return chapter;
};

export const updateChapterService = async (id, data) => {
  const chapter = await Chapter.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!chapter) throw ApiError.notFound("Chapter not found");
  return chapter;
};

export const deleteChapterService = async (id) => {
  const chapter = await Chapter.findByIdAndDelete(id);
  if (!chapter) throw ApiError.notFound("Chapter not found");
};
