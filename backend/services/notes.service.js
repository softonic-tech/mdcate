import Note from "../models/notes.model.js";
import ApiError from "../utils/ApiError.js";

// ================= CREATE NOTE =================
export const createNoteService = async (data) => {
  const hasContent = !!data.content?.trim();
  const hasImage = !!data.image?.url;
  const hasPdf = !!data.pdf?.url;

  const count = [hasContent, hasImage, hasPdf].filter(Boolean).length;

  if (count === 0) {
    throw ApiError.badRequest(
      "Note must contain text OR image OR pdf"
    );
  }

  if (count > 1) {
    throw ApiError.badRequest(
      "Only ONE type allowed: text OR image OR pdf"
    );
  }

  // ================= SOURCE TYPE =================
  if (hasContent) {
    data.sourceType = "text";
  } else if (hasImage) {
    data.sourceType = "image";
  } else {
    data.sourceType = "pdf";
  }

  return await Note.create(data);
};

// ================= MY NOTES =================
export const getMyNotesService = async (userId) => {
  return await Note.find({ userId })
    .populate("subjectId", "name")
    .populate("chapterId", "name")
    .sort({ createdAt: -1 });
};

// ================= GET ALL NOTES =================
export const getNotesService = async ({
  search,
  subjectId,
  type,
  page = 1,
  limit = 12,
  userId,
}) => {
  const query = {
  $or: [
    { isPublic: true },
  ],
};

if (userId) {
  query.$or.push({ userId });
}

  // SEARCH
  if (search?.trim()) {
    query.title = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  // FILTERS
  if (subjectId) {
    query.subjectId = subjectId;
  }

  if (type) {
    query.type = type;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const notes = await Note.find(query)
    .populate("subjectId", "name")
    .populate("chapterId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Note.countDocuments(query);

  return {
    data: notes,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  };
};

// ================= GET SINGLE NOTE =================
export const getNoteByIdService = async (id, userId) => {
  const note = await Note.findOne({
    _id: id,
    $or: [
      { userId },
      { isPublic: true },
    ],
  })
    .populate("subjectId", "name")
    .populate("chapterId", "name");

  if (!note) {
    throw ApiError.notFound("Note not found");
  }

  return note;
};

// ================= UPDATE NOTE =================
export const updateNoteService = async (
  id,
  data,
  files,
  userId
) => {
  const note = await Note.findOne({
    _id: id,
    userId,
  });

  if (!note) {
    throw ApiError.notFound(
      "Note not found or unauthorized"
    );
  }

  // ================= DETECT TYPES =================
  const hasContent = !!data.content?.trim();
  const hasImage = !!files?.image;
  const hasPdf = !!files?.pdf;

  const count = [hasContent, hasImage, hasPdf].filter(Boolean).length;

  if (count > 1) {
    throw ApiError.badRequest(
      "Only ONE type allowed"
    );
  }

  if (count === 0) {
    throw ApiError.badRequest(
      "Please provide text OR image OR pdf"
    );
  }

  // ================= RESET OLD =================
  note.content = "";
  note.image = undefined;
  note.pdf = undefined;

  // ================= APPLY NEW =================
  if (hasContent) {
    note.content = data.content;
    note.sourceType = "text";
  }

  if (hasImage) {
    note.image = {
      url:
        files.image[0].location ||
        files.image[0].path,
    };

    note.sourceType = "image";
  }

  if (hasPdf) {
    note.pdf = {
      url:
        files.pdf[0].location ||
        files.pdf[0].path,
    };

    note.sourceType = "pdf";
  }

  // ================= OTHER FIELDS =================
  if (data.title) {
    note.title = data.title;
  }

  if (data.type) {
    note.type = data.type;
  }

  if (data.subjectId) {
    note.subjectId = data.subjectId;
  }

  if (data.chapterId) {
    note.chapterId = data.chapterId;
  }

  if (data.isPublic !== undefined) {
    note.isPublic = data.isPublic;
  }

  await note.save();

  return note;
};

// ================= DELETE NOTE =================
export const deleteNoteService = async (
  id,
  userId
) => {
  const note = await Note.findOneAndDelete({
    _id: id,
    userId,
  });

  if (!note) {
    throw ApiError.notFound(
      "Note not found or unauthorized"
    );
  }

  return true;
};