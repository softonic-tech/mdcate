const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|mov|m4v|mkv|mp3|m4a|wav)(\?.*)?$/i;

export const normalizeVideoUrl = (rawUrl = "") => rawUrl.trim();

export const validateVideoUrl = (rawUrl = "") => {
  const trimmed = normalizeVideoUrl(rawUrl);

  if (!trimmed) {
    throw new Error("Please paste a video link.");
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("That does not look like a valid link. It should start with https://");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http:// and https:// video links are supported.");
  }

  return parsed.href;
};

export const detectVideoPlatform = (rawUrl = "") => {
  const url = validateVideoUrl(rawUrl);
  const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");

  if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
  if (host.includes("vimeo.com")) return "vimeo";
  if (host.includes("dailymotion.com") || host.includes("dai.ly")) return "dailymotion";
  if (host.includes("facebook.com") || host.includes("fb.watch")) return "facebook";
  if (host.includes("drive.google.com")) return "google_drive";
  if (DIRECT_VIDEO_PATTERN.test(url)) return "direct";

  return "other";
};

export const getPlatformLabel = (platform) => {
  const labels = {
    youtube: "YouTube",
    vimeo: "Vimeo",
    dailymotion: "Dailymotion",
    facebook: "Facebook",
    google_drive: "Google Drive",
    direct: "Direct video file",
    other: "Online video",
  };

  return labels[platform] || "Video";
};

export const SUPPORTED_PLATFORM_HINTS = [
  { id: "youtube", label: "YouTube", example: "https://www.youtube.com/watch?v=..." },
  { id: "vimeo", label: "Vimeo", example: "https://vimeo.com/123456789" },
  { id: "direct", label: "Direct MP4/WebM link", example: "https://example.com/lecture.mp4" },
  { id: "other", label: "Most public lecture links", example: "Paste any shareable video URL" },
];
