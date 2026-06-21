/**
 * Parse S3 virtual-hosted–style URLs:
 * https://{bucket}.s3.{region}.amazonaws.com/{key}
 */
export function parseS3VirtualHostUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") return null;
  try {
    const u = new URL(fileUrl);
    const match = u.hostname.match(/^([^.]+)\.s3\.([^.]+)\.amazonaws\.com$/);
    if (!match) return null;
    const key = decodeURIComponent(u.pathname.replace(/^\//, ""));
    if (!key) return null;
    return { bucket: match[1], region: match[2], key };
  } catch {
    return null;
  }
}
