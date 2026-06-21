import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import s3 from "../config/awsS3.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import * as service from "../services/book.service.js";
import ApiError from "../utils/ApiError.js";
import env from "../config/env.config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { parseS3VirtualHostUrl } from "../utils/s3FileUrl.js";
import { sanitizeFileKeySegment } from "../utils/sanitizeFileKey.js";

function resolveS3GetParams(fileUrl) {
  const parsed = parseS3VirtualHostUrl(fileUrl);
  const bucket = env.AWS_BUCKET || parsed?.bucket;
  let key = parsed?.key;
  if (!key && fileUrl?.includes(".amazonaws.com/")) {
    try {
      const u = new URL(fileUrl);
      key = decodeURIComponent(u.pathname.replace(/^\//, "").split("?")[0]);
    } catch {
      key = fileUrl.split(".amazonaws.com/")[1]?.split("?")[0];
    }
  }
  return { bucket, key, parsed };
}

export const createBook = asyncHandler(async (req, res) => {
  let coverImage = "";
  let fileUrl = "";

  const hasMultipart =
    !!(req.files?.file?.[0] || req.files?.coverImage?.[0]);

  if (hasMultipart) {
    if (req.files?.coverImage) {
      const file = req.files.coverImage[0];
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "books/covers" }
      );
      coverImage = result.secure_url;
    }

    if (req.files?.file) {
      const file = req.files.file[0];
      if (file.mimetype !== "application/pdf") {
        throw ApiError.badRequest("Only PDF files are allowed");
      }
      if (!env.AWS_BUCKET) {
        throw ApiError.badRequest("S3 is not configured");
      }
      const key = `books/${Date.now()}-${sanitizeFileKeySegment(file.originalname)}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: env.AWS_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: "application/pdf",
          ContentDisposition: `inline; filename="${file.originalname}"`,
        })
      );

      fileUrl = `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    }
  } else {
    fileUrl = (req.body.fileUrl || "").trim();
    coverImage = (req.body.coverImage || "").trim();
    if (!fileUrl) {
      throw ApiError.badRequest(
        "fileUrl is required (upload the PDF from the admin app — direct to S3 — first)"
      );
    }
  }

  const { title, subjectId, board } = req.body;
  const book = await service.createBookService({
    title,
    subjectId,
    board,
    coverImage,
    fileUrl,
  });
  res.status(201).json({ success: true, data: book });
});

export const getBooks = asyncHandler(async (req, res) => {
  const result = await service.getBooksService(req.query);
  res.json({ success: true, ...result });
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await service.getBookByIdService(req.params.id);
  res.json({ success: true, data: book });
});

export const updateBook = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (typeof data.fileUrl === "string") data.fileUrl = data.fileUrl.trim();
  if (typeof data.coverImage === "string") data.coverImage = data.coverImage.trim();

  const hasMultipart =
    !!(req.files?.file?.[0] || req.files?.coverImage?.[0]);

  if (hasMultipart) {
    if (req.files?.coverImage) {
      const file = req.files.coverImage[0];
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "books/covers" }
      );
      data.coverImage = result.secure_url;
    }

    if (req.files?.file) {
      const file = req.files.file[0];
      if (file.mimetype !== "application/pdf") {
        throw ApiError.badRequest("Only PDF files are allowed");
      }
      if (!env.AWS_BUCKET) {
        throw ApiError.badRequest("S3 is not configured");
      }
      const key = `books/${Date.now()}-${sanitizeFileKeySegment(file.originalname)}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: env.AWS_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: "application/pdf",
          ContentDisposition: `inline; filename="${file.originalname}"`,
        })
      );
      data.fileUrl = `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    }
  }

  const book = await service.updateBookService(req.params.id, data);
  res.json({ success: true, data: book });
});

export const deleteBook = asyncHandler(async (req, res) => {
  await service.deleteBookService(req.params.id);
  res.json({ success: true, message: "Book deleted" });
});

export const downloadBook = asyncHandler(async (req, res) => {
  const book = await service.getBookByIdService(req.params.id);
  if (!book.fileUrl) throw ApiError.notFound("Book file not found");

  await service.incrementDownload(book._id);

  const { bucket, key } = resolveS3GetParams(book.fileUrl);

  if (!bucket || !key) {
    return res.redirect(book.fileUrl);
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: `attachment; filename="${book.title}.pdf"`,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  res.redirect(signedUrl);
});


export const viewBook = asyncHandler(async (req, res) => {
  const book = await service.getBookByIdService(req.params.id);
  if (!book.fileUrl) throw ApiError.notFound("Book file not found");

  const { bucket, key } = resolveS3GetParams(book.fileUrl);

  if (!bucket || !key) {
    return res.redirect(book.fileUrl);
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: "inline",
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  res.redirect(signedUrl);
});

