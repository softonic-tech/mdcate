import { PutObjectCommand } from "@aws-sdk/client-s3";
import cloudinary from "../config/cloudinary.js";
import s3 from "../config/awsS3.js";
import env from "../config/env.config.js";

/**
 * Turn multer file(s) into public URLs. Uses disk paths as-is; uploads buffers to Cloudinary / S3.
 */
export async function persistNoteFiles(files) {
  if (!files) return {};

  const out = {};

  const img = files.image?.[0];
  if (img?.buffer) {
    const result = await cloudinary.uploader.upload(
      `data:${img.mimetype};base64,${img.buffer.toString("base64")}`,
      { folder: "notes/images" }
    );
    out.image = { url: result.secure_url };
  } else if (img) {
    const url = img.location || img.path;
    if (url) out.image = { url };
  }

  const pdf = files.pdf?.[0];
  if (pdf?.buffer) {
    if (env.AWS_BUCKET && env.AWS_REGION && env.AWS_ACCESS_KEY_ID) {
      const key = `notes/${Date.now()}-${pdf.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: env.AWS_BUCKET,
          Key: key,
          Body: pdf.buffer,
          ContentType: "application/pdf",
          ContentDisposition: `inline; filename="${pdf.originalname}"`,
        })
      );
      out.pdf = {
        url: `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
      };
    } else {
      const result = await cloudinary.uploader.upload(
        `data:application/pdf;base64,${pdf.buffer.toString("base64")}`,
        { folder: "notes/pdfs", resource_type: "raw" }
      );
      out.pdf = { url: result.secure_url };
    }
  } else if (pdf) {
    const url = pdf.location || pdf.path;
    if (url) out.pdf = { url };
  }

  return out;
}
