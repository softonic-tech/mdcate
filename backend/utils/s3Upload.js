import fs from "fs/promises";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/awsS3.js";
import env from "../config/env.config.js";
import ApiError from "./ApiError.js";
import { parseS3VirtualHostUrl } from "./s3FileUrl.js";
import { sanitizeFileKeySegment } from "./sanitizeFileKey.js";

export function assertS3Configured() {
  if (!env.AWS_BUCKET || !env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw ApiError.internal("S3 is not configured");
  }
}

export function publicS3Url(key) {
  return `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

export function buildS3Key(prefix, filename = "file") {
  return `${prefix}/${Date.now()}-${sanitizeFileKeySegment(filename)}`;
}

export async function uploadBufferToS3({
  buffer,
  key,
  contentType,
  contentDisposition,
}) {
  assertS3Configured();

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ...(contentDisposition ? { ContentDisposition: contentDisposition } : {}),
    })
  );

  return publicS3Url(key);
}

export async function uploadToS3({
  buffer,
  filePath,
  mimetype,
  keyPrefix,
  filename,
  contentDisposition,
}) {
  const body = buffer ?? (filePath ? await fs.readFile(filePath) : null);
  if (!body) throw ApiError.badRequest("No file data to upload");

  const key = buildS3Key(keyPrefix, filename || "file");
  const url = await uploadBufferToS3({
    buffer: body,
    key,
    contentType: mimetype || "application/octet-stream",
    contentDisposition,
  });

  if (filePath) {
    try {
      await fs.unlink(filePath);
    } catch {
      /* ignore cleanup errors */
    }
  }

  return url;
}

export async function deleteS3ObjectByUrl(url) {
  const parsed = parseS3VirtualHostUrl(url);
  if (!parsed?.bucket || !parsed?.key) return;

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key,
      })
    );
  } catch (err) {
    console.warn("S3 delete failed:", err.message);
  }
}
