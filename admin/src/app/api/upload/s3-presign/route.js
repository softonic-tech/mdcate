import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const COVER_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function sanitizeFileKeySegment(name) {
  if (!name || typeof name !== "string") return "file";
  const base = name.split(/[/\\]/).pop() || "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "file";
}

function apiBaseUrl() {
  const u = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!u) return "";
  return u.replace(/\/$/, "");
}

/** Confirms Bearer token belongs to an admin (small JSON call to main API; files never go there). */
async function verifyAdmin(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const base = apiBaseUrl();
  if (!base) return false;
  const res = await fetch(`${base}/auth/me`, {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  if (!res.ok) return false;
  const body = await res.json();
  return body?.data?.role === "admin";
}

/** Netlify (and some hosts) reserve AWS_* names; S3_* is preferred there. */
function s3ConfigFromEnv() {
  return {
    bucket: process.env.S3_BUCKET || process.env.AWS_BUCKET,
    region: process.env.S3_REGION || process.env.AWS_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  };
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  if (!(await verifyAdmin(authHeader))) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { bucket, region, accessKeyId, secretAccessKey } = s3ConfigFromEnv();

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      {
        success: false,
        message:
          "S3 env missing: set S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET (use S3_* on Netlify; AWS_* is reserved there).",
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const { pdfFileName, coverContentType } = body || {};
  if (!pdfFileName && !coverContentType) {
    return NextResponse.json(
      { success: false, message: "Provide pdfFileName and/or coverContentType" },
      { status: 400 }
    );
  }

  const s3 = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  const baseUrl = `https://${bucket}.s3.${region}.amazonaws.com`;
  const out = {};
  const ttl = 3600;

  if (pdfFileName) {
    const safe = sanitizeFileKeySegment(pdfFileName);
    const key = `books/${Date.now()}-${safe}`;
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: "application/pdf",
    });
    out.pdf = {
      uploadUrl: await getSignedUrl(s3, cmd, { expiresIn: ttl }),
      fileUrl: `${baseUrl}/${key}`,
      contentType: "application/pdf",
    };
  }

  if (coverContentType) {
    const ct = String(coverContentType).toLowerCase();
    if (!COVER_TYPES.includes(ct)) {
      return NextResponse.json(
        { success: false, message: "coverContentType must be JPEG, PNG, or WebP" },
        { status: 400 }
      );
    }
    const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
    const key = `books/covers/${Date.now()}.${ext}`;
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: ct,
    });
    out.cover = {
      uploadUrl: await getSignedUrl(s3, cmd, { expiresIn: ttl }),
      fileUrl: `${baseUrl}/${key}`,
      contentType: ct,
    };
  }

  return NextResponse.json({ success: true, data: out });
}
