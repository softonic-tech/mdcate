"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Layers,
  Link2,
  ListChecks,
  Loader2,
  RefreshCw,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { createVideo, getVideo, getVideos, reprocessVideo } from "@/api/video.api";
import { SkeletonVsCards } from "@/components/dashboard/Skeleton";
import toast from "react-hot-toast";

const STAGE_MESSAGES = {
  queued: "Waiting in queue…",
  fetching_content: "Reading captions or preparing audio…",
  transcribing: "Transcribing speech with Whisper…",
  summarizing: "Building summary, flashcards, and MCQs…",
  done: "Complete",
};

const MAX_ATTEMPTS = 3;

const attemptsUsed = (video) => Math.min(video?.attemptCount || 1, MAX_ATTEMPTS);
const attemptsRemaining = (video) => Math.max(0, MAX_ATTEMPTS - attemptsUsed(video));
const canRetry = (video) =>
  video?.status === "failed" && attemptsUsed(video) < MAX_ATTEMPTS;

const HOW_IT_WORKS = [
  {
    title: "Paste a public video link",
    body: "YouTube, Vimeo, direct MP4, or most shareable lecture URLs.",
  },
  {
    title: "We extract the spoken content",
    body: "Captions are used first. If unavailable, audio is transcribed automatically.",
  },
  {
    title: "Get your study pack",
    body: "Summary, key points, flashcards, and practice MCQs — ready to revise.",
  },
];

const TIPS = [
  "Public videos only — private or login-required links won't work.",
  "Captions speed things up and improve accuracy.",
  "Long lectures may take a few minutes to process.",
];

const detectPlatform = (rawUrl = "") => {
  try {
    const host = new URL(rawUrl.trim()).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("youtube.com") || host === "youtu.be") return "YouTube";
    if (host.includes("vimeo.com")) return "Vimeo";
    if (/\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(rawUrl)) return "Direct file";
    return "Online video";
  } catch {
    return null;
  }
};

const validateUrlInput = (rawUrl = "") => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { valid: false, message: "Paste a video link to continue." };

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, message: "Link must start with http:// or https://" };
    }
    return { valid: true, platform: detectPlatform(trimmed) };
  } catch {
    return { valid: false, message: "Enter a valid URL." };
  }
};

const statusClass = (status) => `vs-status vs-status--${status || "pending"}`;

const POLL_INTERVAL_MS = 4000;
const isPending = (video) =>
  video?.status === "pending" || video?.status === "processing";

export default function VideoSummarizerPage() {
  const [videos, setVideos] = useState([]);
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  // Refs let the single stable poller read the latest state without recreating
  // the interval (or fighting useEffect dependency churn) on every refresh.
  const hasPendingRef = useRef(false);
  const selectedRef = useRef(null);
  const inFlightRef = useRef(false);

  const urlCheck = useMemo(() => validateUrlInput(url), [url]);

  const loadVideos = useCallback(async () => {
    try {
      const response = await getVideos();
      const list = response?.data || [];
      setVideos(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error?.message || "Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVideoDetails = useCallback(async (id, silent = false) => {
    try {
      const response = await getVideo(id);
      const video = response?.data;
      if (video) {
        setSelected((current) => {
          // Avoid clobbering the user's revealed-answers state when polling
          // returns the same logical entity.
          if (current?._id !== video._id) {
            return video;
          }
          return { ...current, ...video };
        });
        if (!silent) setRevealedAnswers({});
      }
      return video;
    } catch (error) {
      if (!silent) toast.error(error?.message || "Failed to load video");
      return null;
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    hasPendingRef.current = videos.some(isPending);
  }, [videos]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const tick = async () => {
      if (!hasPendingRef.current || inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await loadVideos();
        const sel = selectedRef.current;
        if (sel && isPending(sel)) {
          await loadVideoDetails(sel._id, true);
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadVideos, loadVideoDetails]);

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!urlCheck.valid) {
      toast.error(urlCheck.message);
      return;
    }

    setSubmitting(true);
    try {
      await createVideo({ url: url.trim() });
      toast.success("Video submitted — your study pack is being generated.");
      setUrl("");
      await loadVideos();
    } catch (error) {
      toast.error(error?.message || "Failed to submit video");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async (id) => {
    if (selected && !canRetry(selected)) {
      toast.error(`Maximum ${MAX_ATTEMPTS} attempts reached for this video.`);
      return;
    }

    try {
      await reprocessVideo(id);
      toast.success("Reprocessing started");
      await loadVideos();
      if (selected?._id === id) await loadVideoDetails(id, true);
    } catch (error) {
      toast.error(error?.message || "Retry failed");
    }
  };

  const progressMessage = (video) => {
    if (!video) return "";
    if (video.status === "completed") return "Your study pack is ready.";
    if (video.status === "failed") {
      return video.errorMessage || "Processing failed. See tips below and try again.";
    }
    return STAGE_MESSAGES[video.processingStage] || STAGE_MESSAGES.queued;
  };

  return (
    <div className="vs-page page-shell">
      <section className="vs-hero">
        <div className="vs-hero__content">
          <span className="vs-hero__badge">
            <Sparkles size={14} />
            AI Powered
          </span>
          <h1>Video Summarizer</h1>
          <p>
            Turn lecture videos into MDCAT-ready notes. Paste any public link and get a
            summary, key points, flashcards, and MCQs in minutes.
          </p>
        </div>
        <div className="vs-hero__stats">
          <div className="vs-stat-pill">
            <FileText size={18} />
            Smart summary
          </div>
          <div className="vs-stat-pill">
            <Layers size={18} />
            Auto flashcards
          </div>
          <div className="vs-stat-pill">
            <ListChecks size={18} />
            Practice MCQs
          </div>
        </div>
      </section>

      {selected && (
        <section className="vs-detail">
          <button type="button" className="vs-close" onClick={() => setSelected(null)}>
            <ChevronLeft size={16} />
            Back to library
          </button>

          <div className="vs-detail__head">
            <div>
              <h2>{selected.title || "Untitled Video"}</h2>
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                className="vs-detail__link"
              >
                {selected.url}
              </a>
            </div>
            <span className={statusClass(selected.status)}>{selected.status}</span>
          </div>

          <div
            className={`vs-progress-bar ${
              selected.status === "failed" ? "vs-progress-bar--error" : ""
            }`}
          >
            {selected.status === "failed" ? (
              <>
                <strong style={{ display: "block", marginBottom: 6 }}>Something went wrong</strong>
                {progressMessage(selected)}
              </>
            ) : (
              progressMessage(selected)
            )}
            {selected.status === "failed" && (
              <span style={{ display: "block", marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                Attempt {attemptsUsed(selected)} of {MAX_ATTEMPTS}
                {attemptsRemaining(selected) > 0
                  ? ` · ${attemptsRemaining(selected)} retry left`
                  : " · no retries left"}
              </span>
            )}
          </div>

          {canRetry(selected) && (
            <button type="button" className="vs-retry" onClick={() => handleRetry(selected._id)}>
              <RefreshCw size={14} />
              Try again ({attemptsRemaining(selected)} left)
            </button>
          )}

          {selected.status === "failed" && !canRetry(selected) && (
            <p style={{ marginTop: 12, fontSize: 13, color: "var(--graphite)" }}>
              All {MAX_ATTEMPTS} attempts used. Submit a new link to try again.
            </p>
          )}

          {selected.summary && (
            <div className="vs-block">
              <h3>
                <BookOpen size={18} />
                Summary
              </h3>
              <p style={{ whiteSpace: "pre-line" }}>{selected.summary}</p>
            </div>
          )}

          {selected.keyPoints?.length > 0 && (
            <div className="vs-block">
              <h3>
                <Zap size={18} />
                Key Points
              </h3>
              <ul>
                {selected.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {selected.aiFlashcards?.length > 0 && (
            <div className="vs-block">
              <h3>
                <Layers size={18} />
                Flashcards
              </h3>
              <div className="vs-flash-grid">
                {selected.aiFlashcards.map((card, index) => (
                  <div key={index} className="vs-flash">
                    <p className="vs-flash__q">{card.front}</p>
                    <p className="vs-flash__a">{card.back}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.aiQuestions?.length > 0 && (
            <div className="vs-block">
              <h3>
                <ListChecks size={18} />
                Practice MCQs
              </h3>
              {selected.aiQuestions.map((question, index) => (
                <div key={index} className="vs-mcq">
                  <p className="vs-mcq__stem">
                    {index + 1}. {question.text}
                  </p>
                  {question.options?.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`vs-mcq__opt ${
                        revealedAnswers[index] && optionIndex === question.correctAnswer
                          ? "vs-mcq__opt--correct"
                          : ""
                      }`}
                    >
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="vs-mcq__btn"
                    onClick={() =>
                      setRevealedAnswers((current) => ({
                        ...current,
                        [index]: !current[index],
                      }))
                    }
                  >
                    {revealedAnswers[index] ? "Hide answer" : "Show answer"}
                  </button>
                  {revealedAnswers[index] && question.explanation && (
                    <p className="vs-mcq__explain">{question.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="vs-layout">
        <aside>
          <div className="vs-panel">
            <h2 className="vs-panel__title">
              <Link2 size={18} />
              Add a video
            </h2>
            <p className="vs-panel__subtitle">Paste any public lecture or video URL.</p>

            <form onSubmit={handleSubmit}>
              <div className="vs-input-row">
                <div className="vs-input-wrap">
                  <Link2 size={16} />
                  <input
                    className="vs-input"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <button
                  type="submit"
                  className="vs-submit"
                  disabled={submitting || !urlCheck.valid}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate
                    </>
                  )}
                </button>
              </div>

              <p
                className={`vs-feedback ${
                  url.trim() === ""
                    ? "vs-feedback--muted"
                    : urlCheck.valid
                    ? "vs-feedback--ok"
                    : "vs-feedback--warn"
                }`}
              >
                {url.trim() === ""
                  ? "Supports YouTube, Vimeo, MP4 links, and more."
                  : urlCheck.valid
                  ? `Ready — detected as ${urlCheck.platform}.`
                  : urlCheck.message}
              </p>
            </form>

            <div className="vs-tags">
              {["YouTube", "Vimeo", "MP4 / WebM", "Public links"].map((tag) => (
                <span key={tag} className="vs-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="vs-panel">
            <h2 className="vs-panel__title">How it works</h2>
            <div className="vs-steps">
              {HOW_IT_WORKS.map((step, index) => (
                <div key={step.title} className="vs-step">
                  <span className="vs-step__num">{index + 1}</span>
                  <div className="vs-step__body">
                    <h4>{step.title}</h4>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vs-panel">
            <h2 className="vs-panel__title">Tips for best results</h2>
            <div className="vs-tips">
              {TIPS.map((tip) => (
                <div key={tip} className="vs-tip">
                  <CheckCircle2 size={16} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section>
          <div className="vs-section-head">
            <div>
              <h2>Your library</h2>
              <p>{videos.length} video{videos.length !== 1 ? "s" : ""} saved</p>
            </div>
          </div>

          {loading ? (
            <SkeletonVsCards count={4} />
          ) : videos.length === 0 ? (
            <div className="vs-empty">
              <Video size={40} strokeWidth={1.5} />
              <h3>No videos yet</h3>
              <p>Paste a lecture link on the left to generate your first AI study pack.</p>
            </div>
          ) : (
            <div className="vs-grid">
              {videos.map((video) => (
                <button
                  key={video._id}
                  type="button"
                  className={`vs-card ${selected?._id === video._id ? "vs-card--active" : ""}`}
                  onClick={() => loadVideoDetails(video._id)}
                >
                  <div className="vs-card__top">
                    <span className="vs-card__title">{video.title || "Untitled video"}</span>
                    <span className={statusClass(video.status)}>{video.status}</span>
                  </div>
                  <p className="vs-card__url">{video.url}</p>
                  {(video.status === "pending" || video.status === "processing") && (
                    <p className="vs-card__progress">
                      {STAGE_MESSAGES[video.processingStage] || STAGE_MESSAGES.queued}
                    </p>
                  )}
                  {video.summary && <p className="vs-card__preview">{video.summary}</p>}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
