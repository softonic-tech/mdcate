import crypto from "crypto";

/** JazzCash Page Redirection — HMAC-SHA256 per merchant docs */
export const generateJazzCashHash = (fields, integritySalt) => {
  const sortedKeys = Object.keys(fields)
    .filter((key) => key.startsWith("pp_") && key !== "pp_SecureHash")
    .sort();

  let hashString = integritySalt;
  for (const key of sortedKeys) {
    const value = fields[key];
    if (value !== undefined && value !== null && value !== "") {
      hashString += `&${value}`;
    }
  }

  return crypto.createHmac("sha256", integritySalt).update(hashString).digest("hex");
};

/** Easypaisa hosted checkout — AES-128-ECB + PKCS5 padding */
export const generateEasypaisaHash = (payload, hashKey) => {
  const sortedKeys = Object.keys(payload).sort();
  const rawString = sortedKeys.map((key) => `${key}=${payload[key]}`).join("&");

  const blockSize = 16;
  const padLen = blockSize - (rawString.length % blockSize);
  const padded = rawString + String.fromCharCode(padLen).repeat(padLen);

  const keyBuffer = Buffer.from(hashKey, "utf8");
  if (keyBuffer.length !== 16) {
    throw new Error("Easypaisa hash key must be 16 bytes");
  }

  const cipher = crypto.createCipheriv("aes-128-ecb", keyBuffer, null);
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(padded, "utf8"), cipher.final()]);
  return encrypted.toString("base64");
};

export const formatTxnDateTime = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

export const formatEasypaisaExpiry = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(date.getTime() + 60 * 60 * 1000);
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
};

export const amountToJazzCashPaisa = (amountPkr) =>
  String(Math.round(Number(amountPkr) * 100));
