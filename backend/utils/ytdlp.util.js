import fs from "fs";
import os from "os";
import path from "path";
import env from "../config/env.config.js";

export const YTDLP_TIMEOUT_MS = 4 * 60 * 1000;

const WRITABLE_COOKIES_PATH = path.join(os.tmpdir(), "ytdlp-youtube-cookies.txt");

const BASE_OPTIONS = {
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
  // Default extractor args used when YTDLP_EXTRACTOR_ARGS env var is unset.
  // The "web" client returns formats without URLs since YouTube enforced SABR
  // streaming. tv/ios/web_safari are the clients that still serve real URLs.
  extractorArgs: "youtube:player_client=tv,ios,web_safari",
};

let cachedSourceMtime = 0;

const resolveCookiesSource = () => {
  const sourcePath = env.YTDLP_COOKIES_FILE?.trim();
  if (!sourcePath) return null;

  if (!fs.existsSync(sourcePath)) {
    console.warn(`[yt-dlp] YTDLP_COOKIES_FILE not found at ${sourcePath}`);
    return null;
  }

  const stat = fs.statSync(sourcePath);
  if (stat.isDirectory()) {
    console.error(
      `[yt-dlp] YTDLP_COOKIES_FILE is a directory, not a file: ${sourcePath}. ` +
        "This usually means Docker created an empty folder because the host file did not exist before the first container start. " +
        "Stop backend, remove that directory on the host, upload a real cookies.txt file, then recreate the container."
    );
    return null;
  }

  if (!stat.isFile()) {
    console.warn(`[yt-dlp] YTDLP_COOKIES_FILE is not a regular file: ${sourcePath}`);
    return null;
  }

  if (stat.size === 0) {
    console.warn(`[yt-dlp] YTDLP_COOKIES_FILE is empty: ${sourcePath}`);
    return null;
  }

  return sourcePath;
};

/** yt-dlp writes cookies back on exit; copy read-only mounts to a writable temp file. */
const resolveWritableCookiesFile = () => {
  const sourcePath = resolveCookiesSource();
  if (!sourcePath) return null;

  try {
    const sourceMtime = fs.statSync(sourcePath).mtimeMs;
    const writableExists = fs.existsSync(WRITABLE_COOKIES_PATH);
    const writableStale =
      !writableExists ||
      sourceMtime > cachedSourceMtime ||
      fs.statSync(WRITABLE_COOKIES_PATH).mtimeMs < sourceMtime;

    if (writableStale) {
      fs.copyFileSync(sourcePath, WRITABLE_COOKIES_PATH);
      fs.chmodSync(WRITABLE_COOKIES_PATH, 0o600);
      cachedSourceMtime = sourceMtime;
    }

    return WRITABLE_COOKIES_PATH;
  } catch (error) {
    console.error(
      `[yt-dlp] Failed to copy cookies to writable path (${WRITABLE_COOKIES_PATH}): ${error.message}`
    );
    return null;
  }
};

export const getYtdlpBaseOptions = () => {
  const opts = { ...BASE_OPTIONS };

  if (env.YTDLP_EXTRACTOR_ARGS) {
    opts.extractorArgs = env.YTDLP_EXTRACTOR_ARGS;
  }

  const cookiesFile = resolveWritableCookiesFile();
  if (cookiesFile) {
    opts.cookies = cookiesFile;
  }

  if (env.YTDLP_PROXY) {
    opts.proxy = env.YTDLP_PROXY;
  }

  return opts;
};

export const ytdlpOptions = (extra = {}) => ({
  ...getYtdlpBaseOptions(),
  ...extra,
});

export const logYtdlpProductionHint = () => {
  if (env.NODE_ENV !== "production") return;

  if (!env.YTDLP_COOKIES_FILE?.trim()) {
    console.warn(
      "[yt-dlp] YTDLP_COOKIES_FILE is unset — YouTube downloads from production servers often fail without browser cookies."
    );
    return;
  }

  const sourcePath = resolveCookiesSource();
  const cookiesFile = resolveWritableCookiesFile();
  if (!cookiesFile) {
    console.warn(
      `[yt-dlp] YouTube cookies are not usable (check YTDLP_COOKIES_FILE=${env.YTDLP_COOKIES_FILE}).`
    );
    return;
  }

  console.log(
    `[yt-dlp] YouTube cookies loaded from ${sourcePath} (writable copy: ${cookiesFile})`
  );
};
