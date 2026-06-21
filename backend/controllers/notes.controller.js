import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/notes.service.js";
import { persistNoteFiles } from "../utils/persistNoteFiles.js";

// ================= CREATE NOTE =================
export const createNote = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    subjectId,
    chapterId,
    type,
    isPublic,
  } = req.body;

  if (!subjectId) {
    return res.status(400).json({
      success: false,
      message: "Please select a subject",
    });
  }

  const noteData = {
    title,
    content,
    subjectId,
    chapterId,
    type,
    isPublic,
    userId: req.user._id,
  };

  const persisted = await persistNoteFiles(req.files);
  if (persisted.image) noteData.image = persisted.image;
  if (persisted.pdf) noteData.pdf = persisted.pdf;

  const note = await service.createNoteService(
    noteData
  );

  res.status(201).json({
    success: true,
    data: note,
  });
});

// ================= MY NOTES =================
export const getMyNotes = asyncHandler(async (req, res) => {
  const notes = await service.getMyNotesService(
    req.user._id
  );

  res.json({
    success: true,
    count: notes.length,
    data: notes,
  });
});

// ================= GET NOTES =================
export const getNotes = asyncHandler(async (req, res) => {
  const result =
    await service.getNotesService({
      ...req.query,
      userId: req.user?._id,
    });
  console.log("NOTES RESULT:", result);  
  res.json({
    success: true,
    ...result,
  });
});

// ================= GET SINGLE NOTE =================
export const getNote = asyncHandler(async (req, res) => {
  const note =
    await service.getNoteByIdService(
      req.params.id,
      req.user?._id
    );

  res.json({
    success: true,
    data: note,
  });
});

// ================= UPDATE NOTE =================
export const updateNote = asyncHandler(async (req, res) => {
  const persisted = await persistNoteFiles(req.files);
  const filesForService =
    Object.keys(persisted).length > 0
      ? {
          ...(persisted.image && {
            image: [{ location: persisted.image.url, path: persisted.image.url }],
          }),
          ...(persisted.pdf && {
            pdf: [{ location: persisted.pdf.url, path: persisted.pdf.url }],
          }),
        }
      : req.files;

  const note =
    await service.updateNoteService(
      req.params.id,
      req.body,
      filesForService,
      req.user._id
    );

  res.json({
    success: true,
    data: note,
  });
});

// ================= DELETE NOTE =================
export const deleteNote = asyncHandler(async (req, res) => {
  await service.deleteNoteService(
    req.params.id,
    req.user._id
  );

  res.json({
    success: true,
    message: "Note deleted",
  });
});