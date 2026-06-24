import axios from "axios";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import youtubedl from "youtube-dl-exec";
import {
  detectVideoPlatform,
  getPlatformLabel,
  validateVideoUrl,
} from "./videoUrl.util.js";
import {
  extractYoutubeVideoId,
  fetchYoutubeTitle,
  fetchYoutubeTranscript,
} from "./youtube.util.js";
import { transcribeAudioFile } from "../services/whisper.service.js";
import { YTDLP_TIMEOUT_MS, ytdlpOptions } from "./ytdlp.util.js";

const FFMPEG_TIMEOUT_MS = 4 * 60 * 1000;
const DIRECT_DOWNLOAD_TIMEOUT_MS = 3 * 60 * 1000;

// Whisper's hard upload limit is 25 MB. We keep some headroom for HTTP overhead
// and to absorb the slight inflation Whisper itself does when re-decoding.
const MAX_WHISPER_BYTES = 24 * 1024 * 1024;
const MAX_AUDIO_DOWNLOAD_BYTES = 80 * 1024 * 1024;
// 24 kbps mono opus ≈ 10.8 MB/hr, enough for a ~2 hr lecture under Whisper's
// 25 MB cap. We tighten further (16 kbps) on the second pass if needed.
const COMPRESS_BITRATES = ["24k", "16k", "12k"];

const ytdlpExec = (url, options) =>
  youtubedl(url, options, { timeout: YTDLP_TIMEOUT_MS });

const withTempDir = async (handler) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mdcate-video-"));
  try {
    return await handler(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
};

const cleanTranscriptText = (text = "") =>
  text.replace(/\s+/g, " ").replace(/\u0000/g, "").trim();

const parseSubtitleFile = (content = "") =>
  cleanTranscriptText(
    content
      .replace(/^WEBVTT[\s\S]*?\n\n/i, "")
      .replace(/^\d+\s*$/gm, "")
      .replace(/\d{2}:\d{2}:\d{2}[.,]\d{3}\s-->\s\d{2}:\d{2}:\d{2}[.,]\d{3}.*$/gm, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\{[^}]+\}/g, "")
  );

const fetchTitleFromMetadata = async (url) => {
  try {
    const info = await ytdlpExec(
      url,
      ytdlpOptions({ dumpSingleJson: true, skipDownload: true })
    );
    return info?.title || info?.fulltitle || "";
  } catch {
    return "";
  }
};

const fetchYoutubeFastPath = async (url) => {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return null;

  // Run title and transcript independently — losing one shouldn't lose both.
  const [titleResult, transcriptResult] = await Promise.allSettled([
    fetchYoutubeTitle(videoId),
    fetchYoutubeTranscript(videoId),
  ]);

  const transcript =
    transcriptResult.status === "fulfilled" ? transcriptResult.value : "";
  if (!transcript) return null;

  return {
    title: titleResult.status === "fulfilled" ? titleResult.value : "",
    transcript,
    platform: "youtube",
    method: "captions",
  };
};

// yt-dlp can leave behind metadata, live_chat, or empty caption files. Only
// accept a subtitle file with actual readable transcript content.
const SUBTITLE_FILE_REGEX = /\.(vtt|srt)$/i;
const SUBTITLE_REJECT_REGEX = /(live_chat|\.json)/i;
const MIN_SUBTITLE_CHARS = 80;

const pickBestSubtitleFile = async (dir) => {
  const files = await fs.readdir(dir);
  const candidates = files
    .filter((file) => SUBTITLE_FILE_REGEX.test(file))
    .filter((file) => !SUBTITLE_REJECT_REGEX.test(file))
    // Prefer manual (no ".auto" / "auto-generated" hints) and English variants.
    .sort((a, b) => {
      const score = (name) => {
        let s = 0;
        if (/\.en\./i.test(name) || /\.en\.vtt$/i.test(name)) s += 10;
        if (/auto/i.test(name)) s -= 5;
        return s;
      };
      return score(b) - score(a);
    });

  for (const file of candidates) {
    const fullPath = path.join(dir, file);
    let raw = "";
    try {
      raw = await fs.readFile(fullPath, "utf8");
    } catch {
      continue;
    }
    const parsed = parseSubtitleFile(raw);
    if (parsed.length >= MIN_SUBTITLE_CHARS) {
      return { transcript: parsed, file };
    }
  }

  return null;
};

const extractSubtitlesWithYtdlp = async (url) => {
  return withTempDir(async (dir) => {
    const outputBase = path.join(dir, "subs");

    await ytdlpExec(
      url,
      ytdlpOptions({
        skipDownload: true,
        writeAutoSub: true,
        writeSub: true,
        subLangs: "en.*,en",
        subFormat: "vtt",
        output: outputBase,
      })
    );

    const best = await pickBestSubtitleFile(dir);
    if (!best) return null;

    const title = await fetchTitleFromMetadata(url);
    return { title, transcript: best.transcript, method: "captions" };
  });
};

const findDownloadedAudio = async (dir) => {
  const files = await fs.readdir(dir);
  const audioFile = files.find(
    (file) => /^audio\./i.test(file) && !file.endsWith(".part") && !file.endsWith(".ytdl")
  );
  return audioFile ? path.join(dir, audioFile) : null;
};

const extractAudioWithYtdlp = async (url, dir) => {
  const outputTemplate = path.join(dir, "audio.%(ext)s");

  // Prefer compact m4a/opus formats and skip absurdly large ones up front. We
  // still re-encode below if the chosen format ends up bigger than Whisper
  // accepts. Never use --max-downloads here (it aborts post-processing mid-run).
  try {
    await ytdlpExec(
      url,
      ytdlpOptions({
        format:
          "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best[filesize<80M]/best",
        output: outputTemplate,
      })
    );
  } catch (error) {
    // yt-dlp sometimes exits non-zero even after writing the file.
    const partial = await findDownloadedAudio(dir);
    if (partial) return partial;
    throw error;
  }

  const audioPath = await findDownloadedAudio(dir);
  if (audioPath) return audioPath;

  throw new Error("AUDIO_EXTRACTION_FAILED");
};

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });

    let stderr = "";
    proc.stderr?.on("data", (chunk) => {
      // Keep only the tail to avoid memory blowup on long encodes.
      stderr = (stderr + chunk.toString()).slice(-2000);
    });

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error("FFMPEG_TIMEOUT"));
    }, FFMPEG_TIMEOUT_MS);

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    proc.on("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.trim() || "unknown error"}`));
    });
  });

const compressAudioForWhisper = async (audioPath, dir, bitrate) => {
  const outputPath = path.join(dir, `compressed_${bitrate}.ogg`);
  await runFfmpeg([
    "-y",
    "-i", audioPath,
    "-vn",
    "-ac", "1",
    "-ar", "16000",
    "-c:a", "libopus",
    "-b:a", bitrate,
    "-application", "voip",
    outputPath,
  ]);
  return outputPath;
};

const fileSize = async (filePath) => {
  const stat = await fs.stat(filePath);
  return stat.size;
};

// Guarantees the returned file is under Whisper's 25 MB cap. If the raw audio
// is already small enough we return it as-is; otherwise we transcode at
// progressively lower bitrates until it fits.
const ensureWhisperCompatibleAudio = async (audioPath, dir) => {
  let size = await fileSize(audioPath);
  if (size <= MAX_WHISPER_BYTES) return audioPath;

  let lastPath = audioPath;
  let lastSize = size;
  for (const bitrate of COMPRESS_BITRATES) {
    let compressedPath;
    try {
      compressedPath = await compressAudioForWhisper(audioPath, dir, bitrate);
    } catch (err) {
      if (err.message === "FFMPEG_TIMEOUT") throw err;
      // If a bitrate level fails, try the next one.
      continue;
    }
    const compressedSize = await fileSize(compressedPath);
    lastPath = compressedPath;
    lastSize = compressedSize;
    if (compressedSize <= MAX_WHISPER_BYTES) return compressedPath;
  }

  throw new Error(
    `AUDIO_TOO_LARGE_AFTER_COMPRESS: still ${(lastSize / 1024 / 1024).toFixed(
      1
    )}MB after compression — try a shorter video (≤ ~2 hours).`
  );
};

const downloadDirectMedia = async (url, dir) => {
  const parsed = new URL(url);
  const extension = path.extname(parsed.pathname) || ".mp4";
  const filePath = path.join(dir, `media${extension}`);

  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: DIRECT_DOWNLOAD_TIMEOUT_MS,
    maxContentLength: MAX_AUDIO_DOWNLOAD_BYTES,
    maxBodyLength: MAX_AUDIO_DOWNLOAD_BYTES,
    headers: { "User-Agent": "medprep.study-VideoSummarizer/1.0" },
  });

  await fs.writeFile(filePath, response.data);
  return filePath;
};

const transcribeFromMediaUrl = async (url, platform) => {
  return withTempDir(async (dir) => {
    let mediaPath;

    if (platform === "direct") {
      mediaPath = await downloadDirectMedia(url, dir);
    } else {
      mediaPath = await extractAudioWithYtdlp(url, dir);
    }

    const whisperReadyPath = await ensureWhisperCompatibleAudio(mediaPath, dir);

    // Title lookup is best-effort — failing this should never block transcription.
    let title = "";
    if (platform !== "direct") {
      title = await fetchTitleFromMetadata(url);
    }

    const transcript = await transcribeAudioFile(whisperReadyPath);
    return { title, transcript, method: "whisper" };
  });
};

export const getVideoContent = async (rawUrl, onStage) => {
  const url = validateVideoUrl(rawUrl);
  const platform = detectVideoPlatform(url);

  onStage?.("fetching_content");

  // 1. YouTube fast path — public unofficial transcript endpoint.
  if (platform === "youtube") {
    const fastResult = await fetchYoutubeFastPath(url);
    if (fastResult?.transcript) {
      return {
        ...fastResult,
        platform,
        platformLabel: getPlatformLabel(platform),
      };
    }
  }

  // 2. yt-dlp subtitles — skip for direct files (yt-dlp cannot parse those URLs).
  if (platform !== "direct") {
    try {
      const subtitleResult = await extractSubtitlesWithYtdlp(url);
      if (subtitleResult?.transcript) {
        return {
          ...subtitleResult,
          platform,
          platformLabel: getPlatformLabel(platform),
        };
      }
    } catch (error) {
      // Subtitle failure is non-fatal — Whisper fallback will run next. Only
      // log for unusual platforms where this isn't an expected miss.
      if (platform !== "youtube") {
        console.warn(`Subtitle extraction failed for ${platform}: ${error.message}`);
      }
    }
  }

  // 3. Whisper fallback.
  onStage?.("transcribing");

  const whisperResult = await transcribeFromMediaUrl(url, platform);
  if (!whisperResult.transcript) {
    throw new Error(
      "We couldn't read this video. Make sure the link is public and includes speech audio."
    );
  }

  return {
    ...whisperResult,
    platform,
    platformLabel: getPlatformLabel(platform),
  };
};
