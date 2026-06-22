import OpenAI from "openai";
import fs from "fs";
import env from "../config/env.config.js";

const buildClient = () => {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
};

export const transcribeAudioFile = async (filePath) => {
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
