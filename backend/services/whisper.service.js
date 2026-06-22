import OpenAI from "openai";
import fs from "fs";
import fsp from "fs/promises";
import env from "../config/env.config.js";

// Whisper's documented upload cap. We pre-check so we can return a clear
// error instead of a generic 413 from OpenAI.
const WHISPER_MAX_BYTES = 25 * 1024 * 1024;

const buildClient = () => {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
};

export const transcribeAudioFile = async (filePath) => {
  const stat = await fsp.stat(filePath);
  if (stat.size > WHISPER_MAX_BYTES) {
    throw new Error(
      `AUDIO_TOO_LARGE_FOR_WHISPER: file is ${(stat.size / 1024 / 1024).toFixed(
        1
      )}MB but the limit is 25MB. Try a shorter video.`
    );
  }
  if (stat.size === 0) {
    throw new Error("Speech-to-text input file is empty.");
  }

  const client = buildClient();
  const transcription = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: env.OPENAI_WHISPER_MODEL,
    language: "en",
  });

  const text = transcription?.text?.trim();
  if (!text) {
    throw new Error("Speech-to-text returned an empty transcript for this video.");
  }

  return text;
};
