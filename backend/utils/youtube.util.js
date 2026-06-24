import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import env from "../config/env.config.js";

const YOUTUBE_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

// Transcript fallback order. youtube-transcript only ever returns ONE language
// per call, so we try a few common variants before giving up.
const TRANSCRIPT_LANG_PRIORITY = ["en", "en-US", "en-GB", undefined];

export const extractYoutubeVideoId = (url = "") => {
  const trimmed = url.trim();
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

export const fetchYoutubeTitle = async (videoId) => {
  try {
    const { data } = await axios.get("https://www.youtube.com/oembed", {
      params: { url: `https://www.youtube.com/watch?v=${videoId}`, format: "json" },
      timeout: 10000,
    });
    return data?.title || "";
  } catch {
    return "";
  }
};

const joinSegments = (segments = []) =>
  segments
    .map((segment) => segment.text)
    .join(" ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const fetchTranscriptViaWorker = async (videoId) => {
  if (!env.YOUTUBE_WORKER_URL) return null;

  for (const lang of TRANSCRIPT_LANG_PRIORITY) {
    try {
      const url = new URL(env.YOUTUBE_WORKER_URL);
      url.searchParams.set("videoId", videoId);
      if (lang) url.searchParams.set("lang", lang);

      const headers = { "Content-Type": "application/json" };
      if (env.YOUTUBE_WORKER_SECRET) {
        headers["Authorization"] = `Bearer ${env.YOUTUBE_WORKER_SECRET}`;
      }

      const resp = await fetch(url.toString(), { headers, signal: AbortSignal.timeout(15000) });
      if (!resp.ok) continue;

      const data = await resp.json();
      if (data?.transcript) return data.transcript;
    } catch {
      // Try next lang variant.
    }
  }

  return null;
};

export const fetchYoutubeTranscript = async (videoId) => {
  // Try Cloudflare Worker proxy first — bypasses EC2 IP bot detection.
  const workerTranscript = await fetchTranscriptViaWorker(videoId);
  if (workerTranscript) return workerTranscript;

  let lastError;
  for (const lang of TRANSCRIPT_LANG_PRIORITY) {
    try {
      const options = lang ? { lang } : undefined;
      const segments = await YoutubeTranscript.fetchTranscript(videoId, options);
      const text = joinSegments(segments);
      if (text) return text;
    } catch (error) {
      lastError = error;
      // Keep trying the next language variant. `youtube-transcript` throws a
      // generic Error("Could not retrieve transcript") for most failures.
    }
  }

  if (lastError) {
    throw new Error(
      lastError.message
        ? `No usable captions: ${lastError.message}`
        : "No captions available for this video."
    );
  }

  throw new Error("No captions available for this video.");
};

export const getYoutubeContent = async (url) => {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    throw new Error("Could not read this YouTube link.");
  }

  const [title, transcript] = await Promise.all([
    fetchYoutubeTitle(videoId),
    fetchYoutubeTranscript(videoId),
  ]);

  return { videoId, title, transcript };
};
