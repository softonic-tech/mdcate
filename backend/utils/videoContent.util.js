import axios from "axios";
import fs from "fs/promises";
import path from "path";
import os from "os";
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

const YTDLP_BASE_OPTIONS = {
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
};

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
      .replace(/\d+\n/g, "")
      .replace(/\d{2}:\d{2}:\d{2}[.,]\d{3}\s-->\s\d{2}:\d{2}:\d{2}[.,]\d{3}\n/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\{[^}]+\}/g, "")
  );

const fetchTitleFromMetadata = async (url) => {
  try {
    const info = await youtubedl(url, {
      ...YTDLP_BASE_OPTIONS,
      dumpSingleJson: true,
      skipDownload: true,
    });
    return info?.title || info?.fulltitle || "";
  } catch {
    return "";
  }
};

const fetchYoutubeFastPath = async (url) => {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return null;

  try {
    const [title, transcript] = await Promise.all([
      fetchYoutubeTitle(videoId),
      fetchYoutubeTranscript(videoId),
    ]);

    return {
      title,
      transcript,
      platform: "youtube",
      method: "captions",
    };
  } catch {
    return null;
  }
};

const extractSubtitlesWithYtdlp = async (url) => {
  return withTempDir(async (dir) => {
    const outputBase = path.join(dir, "subs");

    await youtubedl(url, {
      ...YTDLP_BASE_OPTIONS,
      skipDownload: true,
      writeAutoSub: true,
      writeSub: true,
      subLangs: "en.*,en",
      subFormat: "vtt",
      output: outputBase,
    });

    const files = await fs.readdir(dir);
    const subtitleFile = files.find((file) => /\.(vtt|srt)$/i.test(file));
    if (!subtitleFile) return null;

    const raw = await fs.readFile(path.join(dir, subtitleFile), "utf8");
    const transcript = parseSubtitleFile(raw);
    if (!transcript) return null;

    const title = await fetchTitleFromMetadata(url);
    return { title, transcript, method: "captions" };
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

  // Download raw audio only — Whisper accepts webm/m4a/opus. Avoid ffmpeg mp3 conversion
  // and never use --max-downloads here (it aborts post-processing mid-conversion).
  try {
    await youtubedl(url, {
      ...YTDLP_BASE_OPTIONS,
      format: "bestaudio[filesize<25M]/bestaudio/best",
      output: outputTemplate,
    });
  } catch (error) {
    // yt-dlp sometimes exits non-zero even after writing the file
    const partial = await findDownloadedAudio(dir);
    if (partial) return partial;
    throw error;
  }

  const audioPath = await findDownloadedAudio(dir);
  if (audioPath) return audioPath;

  throw new Error("AUDIO_EXTRACTION_FAILED");
};

const downloadDirectMedia = async (url, dir) => {
  const parsed = new URL(url);
  const extension = path.extname(parsed.pathname) || ".mp4";
  const filePath = path.join(dir, `media${extension}`);

  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 120000,
    maxContentLength: 25 * 1024 * 1024,
    maxBodyLength: 25 * 1024 * 1024,
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

    const title = await fetchTitleFromMetadata(url);
    const transcript = await transcribeAudioFile(mediaPath);

    return {
      title,
      transcript,
      method: "whisper",
    };
  });
};

export const getVideoContent = async (rawUrl, onStage) => {
  const url = validateVideoUrl(rawUrl);
  const platform = detectVideoPlatform(url);

  onStage?.("fetching_content");

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
    if (platform === "direct") {
      // Direct files won't have subtitles — fall through to Whisper.
    } else if (platform === "youtube") {
      // Continue to Whisper fallback for YouTube without captions.
    } else {
      console.warn(`Subtitle extraction failed for ${platform}: ${error.message}`);
    }
  }

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
