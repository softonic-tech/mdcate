/** Safe filename segment for S3 keys (no path traversal). */
export function sanitizeFileKeySegment(name) {
  if (!name || typeof name !== "string") return "file";
  const base = name.split(/[/\\]/).pop() || "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "file";
}
