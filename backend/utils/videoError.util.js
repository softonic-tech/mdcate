const GENERIC_FAILURE =
  "We couldn't process this video. Make sure the link is public, has clear speech, and captions are enabled if possible.";

/** Pull the richest possible text from thrown values (yt-dlp often uses empty .message). */
export const formatErrorForLog = (error) => {
  if (!error) return "Unknown error (nothing was thrown)";

  if (typeof error === "string") return error.trim() || "Unknown error (empty string)";

  const chunks = [];

  if (error.message?.trim()) chunks.push(error.message.trim());
  if (error.stderr?.trim()) chunks.push(error.stderr.trim());
  if (error.stdout?.trim()) chunks.push(error.stdout.trim());

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") chunks.push(data);
    else if (data?.error?.message) chunks.push(data.error.message);
    else chunks.push(JSON.stringify(data));
  }

  if (error.cause) {
    const causeText = formatErrorForLog(error.cause);
    if (causeText) chunks.push(`Caused by: ${causeText}`);
  }

  if (error.code) chunks.push(`code: ${error.code}`);
  if (error.status) chunks.push(`status: ${error.status}`);

  const unique = [...new Set(chunks.map((part) => part.trim()).filter(Boolean))];
  if (unique.length > 0) return unique.join("\n");

  if (error.stack) return error.stack;

  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch {
    return String(error) || "Unknown error (unserializable)";
  }
};

const collapseMessage = (error) => {
  const formatted = formatErrorForLog(error);
  const uniqueLines = [
    ...new Set(formatted.split("\n").map((line) => line.trim()).filter(Boolean)),
  ];
  return uniqueLines.join(" ");
};

export const toUserFriendlyVideoError = (error) => {
  const raw = collapseMessage(error).toLowerCase();

  if (!raw) return GENERIC_FAILURE;

  if (raw.includes("maximum") && raw.includes("attempt")) {
    return error?.message || GENERIC_FAILURE;
  }

  if (raw.includes("openai_api_key") || raw.includes("api key is not configured")) {
    return "AI summarization is not configured on the server. Please contact support.";
  }

  if (
    raw.includes("is a directory") &&
    (raw.includes("cookies") || raw.includes("youtube-cookies") || raw.includes("/secrets/"))
  ) {
    return "Video processing is misconfigured on the server (YouTube cookies path is a folder, not a file). Please contact support.";
  }

  if (
    raw.includes("read-only file system") ||
    (raw.includes("errno 30") && raw.includes("cookies"))
  ) {
    return "Video processing hit a server configuration issue with YouTube cookies. Please contact support.";
  }

  if (raw.includes("incorrect api key") || raw.includes("invalid_api_key")) {
    return "AI service authentication failed. Please contact support.";
  }

  if (
    raw.includes("audio_too_large") ||
    raw.includes("file is too large") ||
    raw.includes("maximum content size") ||
    (raw.includes("25mb") && raw.includes("limit"))
  ) {
    return "This video's audio is too long for transcription. Please try a video under ~2 hours, or use one that has captions enabled.";
  }

  if (
    raw.includes("job_timeout") ||
    raw.includes("ffmpeg_timeout") ||
    raw.includes("etimedout") ||
    raw.includes("signal") && raw.includes("sigterm")
  ) {
    return "This video took too long to process and was cancelled. Try a shorter video or one with captions enabled.";
  }

  if (
    raw.includes("postprocessing") ||
    raw.includes("audio conversion failed") ||
    raw.includes("max-downloads") ||
    raw.includes("maximum number of downloads") ||
    raw.includes("ffmpeg") ||
    raw.includes("invalid argument")
  ) {
    return "We couldn't extract audio from this video. Try a shorter lecture or a video with captions/subtitles enabled.";
  }

  if (
    raw.includes("private") ||
    raw.includes("sign in to confirm") ||
    raw.includes("not a bot") ||
    raw.includes("login") ||
    raw.includes("members only") ||
    raw.includes("403") ||
    raw.includes("forbidden")
  ) {
    return "This video appears to be private, restricted, or blocked by YouTube from our server. Try a fully public video with captions enabled.";
  }

  if (raw.includes("video unavailable") || raw.includes("not available")) {
    return "This video is unavailable. Check that the link is correct and still public.";
  }

  if (raw.includes("no transcript") || raw.includes("captions") || raw.includes("subtitle")) {
    return "No captions were found for this video and audio could not be processed. Try a video with subtitles enabled.";
  }

  if (raw.includes("429") || raw.includes("rate limit") || raw.includes("too many requests")) {
    return "Too many requests right now. Please wait a few minutes and try again.";
  }

  if (raw.includes("network") || raw.includes("econnreset") || raw.includes("timeout")) {
    return "Network error while fetching the video. Check your connection and try again.";
  }

  if (raw.includes("valid video link") || raw.includes("valid url")) {
    return error?.message || "Please paste a valid public video URL.";
  }

  if (
    raw.length > 180 ||
    raw.includes("yt-dlp") ||
    raw.includes("error:") ||
    (raw.match(/error/g) || []).length > 1
  ) {
    return GENERIC_FAILURE;
  }

  return error?.message || GENERIC_FAILURE;
};
