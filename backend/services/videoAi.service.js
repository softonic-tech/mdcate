import OpenAI from "openai";
import env from "../config/env.config.js";

const MAX_TRANSCRIPT_CHARS = 12000;

const buildClient = () => {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }

  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
};

const truncateTranscript = (transcript) => {
  if (transcript.length <= MAX_TRANSCRIPT_CHARS) return transcript;
  return `${transcript.slice(0, MAX_TRANSCRIPT_CHARS)}\n\n[Transcript truncated for processing]`;
};

export const summarizeVideoTranscript = async ({ transcript, videoTitle = "" }) => {
  const client = buildClient();
  const trimmedTranscript = truncateTranscript(transcript);

  const response = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are an expert MDCAT study assistant.",
          "Summarize lecture videos for Pakistani medical/dental entry test preparation.",
          "Return valid JSON only with this shape:",
          "{",
          '  "title": "short descriptive title",',
          '  "summary": "2-4 paragraph summary",',
          '  "keyPoints": ["5-8 concise bullet points"],',
          '  "flashcards": [{"front": "question/term", "back": "answer/explanation"}],',
          '  "questions": [{',
          '    "text": "MCQ stem",',
          '    "options": ["A", "B", "C", "D"],',
          '    "correctAnswer": 0,',
          '    "explanation": "why the answer is correct"',
          "  }]",
          "}",
          "Generate exactly 5 flashcards and 3 MCQs.",
          "Keep language clear and exam-focused.",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          videoTitle ? `Video title: ${videoTitle}` : "",
          "Transcript:",
          trimmedTranscript,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  const raw = response.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse AI summary response.");
  }

  return {
    title: String(parsed.title || videoTitle || "Video Summary").trim(),
    summary: String(parsed.summary || "").trim(),
    keyPoints: Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.map((point) => String(point).trim()).filter(Boolean)
      : [],
    flashcards: Array.isArray(parsed.flashcards)
      ? parsed.flashcards
          .map((card) => ({
            front: String(card?.front || "").trim(),
            back: String(card?.back || "").trim(),
          }))
          .filter((card) => card.front && card.back)
          .slice(0, 8)
      : [],
    questions: Array.isArray(parsed.questions)
      ? parsed.questions
          .map((question) => ({
            text: String(question?.text || "").trim(),
            options: Array.isArray(question?.options)
              ? question.options.map((option) => String(option).trim()).filter(Boolean)
              : [],
            correctAnswer: Number.isInteger(question?.correctAnswer)
              ? question.correctAnswer
              : 0,
            explanation: String(question?.explanation || "").trim(),
          }))
          .filter(
            (question) =>
              question.text &&
              question.options.length >= 2 &&
              question.correctAnswer >= 0 &&
              question.correctAnswer < question.options.length
          )
          .slice(0, 5)
      : [],
  };
};
