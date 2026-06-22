import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";

const YOUTUBE_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

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

export const fetchYoutubeTranscript = async (videoId) => {
  const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
  const text = segments.map((segment) => segment.text).join(" ").replace(/\s+/g, " ").trim();

  if (!text) {
    throw new Error("No transcript found for this video. Try a video with captions enabled.");
  }

  return text;
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
