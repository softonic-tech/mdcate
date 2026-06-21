/**
 * Presign via the admin Next.js API (not the Express API). Browser then PUTs files straight to S3.
 */
export async function presignBookUploads(payload) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const res = await fetch("/api/upload/s3-presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Presign failed (${res.status})`);
  }
  return json;
}
