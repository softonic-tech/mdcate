import fs from "fs";
import env from "../config/env.config.js";

export const YTDLP_TIMEOUT_MS = 4 * 60 * 1000;

const BASE_OPTIONS = {
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
};

const resolveCookiesFile = () => {
  const path = env.YTDLP_COOKIES_FILE?.trim();
  if (!path) return null;

  if (!fs.existsSync(path)) {
    console.warn(`[yt-dlp] YTDLP_COOKIES_FILE not found at ${path}`);
    return null;
  }

  const stat = fs.statSync(path);
  if (stat.isDirectory()) {
    console.error(
      `[yt-dlp] YTDLP_COOKIES_FILE is a directory, not a file: ${path}. ` +
        "This usually means Docker created an empty folder because the host file did not exist before the first container start. " +
        "Stop backend, remove that directory on the host, upload a real cookies.txt file, then recreate the container."
    );
    return null;
  }

  if (!stat.isFile()) {
    console.warn(`[yt-dlp] YTDLP_COOKIES_FILE is not a regular file: ${path}`);
    return null;
  }

  return path;
};

export const getYtdlpBaseOptions = () => {
  const opts = { ...BASE_OPTIONS };

  if (env.YTDLP_EXTRACTOR_ARGS) {
    opts.extractorArgs = env.YTDLP_EXTRACTOR_ARGS;
  }

  const cookiesFile = resolveCookiesFile();
  if (cookiesFile) {
    opts.cookies = cookiesFile;
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

  const cookiesFile = resolveCookiesFile();
  if (!cookiesFile) {
    console.warn(
      `[yt-dlp] YouTube cookies are not usable (check YTDLP_COOKIES_FILE=${env.YTDLP_COOKIES_FILE}).`
    );
  }
};
