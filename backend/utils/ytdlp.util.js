import fs from "fs";
import env from "../config/env.config.js";

export const YTDLP_TIMEOUT_MS = 4 * 60 * 1000;

const BASE_OPTIONS = {
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
};

export const getYtdlpBaseOptions = () => {
  const opts = { ...BASE_OPTIONS };

  if (env.YTDLP_EXTRACTOR_ARGS) {
    opts.extractorArgs = env.YTDLP_EXTRACTOR_ARGS;
  }

  if (env.YTDLP_COOKIES_FILE) {
    if (fs.existsSync(env.YTDLP_COOKIES_FILE)) {
      opts.cookies = env.YTDLP_COOKIES_FILE;
    } else {
      console.warn(
        `[yt-dlp] YTDLP_COOKIES_FILE not found at ${env.YTDLP_COOKIES_FILE}`
      );
    }
  }

  return opts;
};

export const ytdlpOptions = (extra = {}) => ({
  ...getYtdlpBaseOptions(),
  ...extra,
});

export const logYtdlpProductionHint = () => {
  if (env.NODE_ENV !== "production") return;

  if (!env.YTDLP_COOKIES_FILE) {
    console.warn(
      "[yt-dlp] YTDLP_COOKIES_FILE is unset — YouTube downloads from production servers often fail without browser cookies."
    );
    return;
  }

  if (!fs.existsSync(env.YTDLP_COOKIES_FILE)) {
    console.warn(
      `[yt-dlp] YTDLP_COOKIES_FILE is set but missing on disk: ${env.YTDLP_COOKIES_FILE}`
    );
  }
};
