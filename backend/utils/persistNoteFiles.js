import { uploadToS3 } from "./s3Upload.js";

/** Turn multer file(s) into public S3 URLs. */
export async function persistNoteFiles(files) {
  if (!files) return {};

  const out = {};

  const img = files.image?.[0];
  if (img?.buffer) {
    out.image = {
      url: await uploadToS3({
        buffer: img.buffer,
        mimetype: img.mimetype,
        keyPrefix: "notes/images",
        filename: img.originalname,
      }),
    };
  } else if (img) {
    const url = img.location || img.path;
    if (url) out.image = { url };
  }

  const pdf = files.pdf?.[0];
  if (pdf?.buffer) {
    out.pdf = {
      url: await uploadToS3({
        buffer: pdf.buffer,
        mimetype: "application/pdf",
        keyPrefix: "notes",
        filename: pdf.originalname,
        contentDisposition: `inline; filename="${pdf.originalname}"`,
      }),
    };
  } else if (pdf) {
    const url = pdf.location || pdf.path;
    if (url) out.pdf = { url };
  }

  return out;
}
