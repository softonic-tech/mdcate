import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import env from "./config/env.config.js";
import errorHandler from "./middlewares/error.middleware.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import ApiError from "./utils/ApiError.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import chapterRoutes from "./routes/chapter.routes.js";
import questionRoutes from "./routes/question.routes.js";
import testRoutes from "./routes/test.routes.js";
import testAttemptRoutes from "./routes/testAttempt.routes.js";
import bookRoutes from "./routes/book.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import flashcardRoutes from "./routes/flashcard.routes.js";
import badgeRoutes from "./routes/badge.routes.js";
import challengeRoutes from "./routes/challenge.routes.js";
import challengeAttemptRoutes from "./routes/challengeAttempt.routes.js";
import performanceRoutes from "./routes/performance.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import videoRoutes from "./routes/video.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import contactRoutes from "./routes/contactMessage.routes.js";
import counselingSessionRoutes from "./routes/counselingSession.routes.js";
import counselingParticipantRoutes from "./routes/counselingParticipant.routes.js";
import mnemonicRoutes from "./routes/mnemonic.routes.js";
import highYieldFactRoutes from "./routes/highYieldFact.routes.js";
import studyPlanRoutes from "./routes/studyPlan.routes.js";
import examCountdownRoutes from "./routes/examCountdown.routes.js";
import deviceRoutes from "./routes/device.routes.js";
import syncLogRoutes from "./routes/syncLog.routes.js";
import offlineContentRoutes from "./routes/offlineContent.routes.js";
import discussionThreadRoutes from "./routes/discussionThread.routes.js";
import discussionMessageRoutes from "./routes/discussionMessage.routes.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);

if (env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, message: "MedPrep Pro API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/chapters", chapterRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/tests", testRoutes);
app.use("/api/v1/test-attempts", testAttemptRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/flashcards", flashcardRoutes);
app.use("/api/v1/badges", badgeRoutes);
app.use("/api/v1/challenges", challengeRoutes);
app.use("/api/v1/challenge-attempts", challengeAttemptRoutes);
app.use("/api/v1/performance", performanceRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/counseling-sessions", counselingSessionRoutes);
app.use("/api/v1/counseling-participants", counselingParticipantRoutes);
app.use("/api/v1/mnemonics", mnemonicRoutes);
app.use("/api/v1/high-yield-facts", highYieldFactRoutes);
app.use("/api/v1/study-plans", studyPlanRoutes);
app.use("/api/v1/exam-countdowns", examCountdownRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/sync-logs", syncLogRoutes);
app.use("/api/v1/offline-content", offlineContentRoutes);
app.use("/api/v1/discussion-threads", discussionThreadRoutes);
app.use("/api/v1/discussion-messages", discussionMessageRoutes);

app.use((req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

export default app;
