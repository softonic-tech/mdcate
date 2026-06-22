import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/awsS3.js";
import env from "../config/env.config.js";
import ApiError from "./ApiError.js";
import { parseS3VirtualHostUrl } from "./s3FileUrl.js";

export const resolveS3GetParams = (fileUrl) => {
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
};

export const createSignedS3Url = async (fileUrl, { expiresIn = 3600, disposition = "inline" } = {}) => {
  if (!fileUrl) throw ApiError.badRequest("File URL is required");

  const { bucket, key } = resolveS3GetParams(fileUrl);
  if (!bucket || !key) {
    throw ApiError.badRequest("Invalid S3 file URL");
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: disposition,
  });

  return getSignedUrl(s3, command, { expiresIn });
};
