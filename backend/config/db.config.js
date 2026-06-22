import mongoose from "mongoose";
import env from "./env.config.js";
import { fixStudyPlanIndexes } from "../utils/fixStudyPlanIndexes.js";

const num = (raw, fallback) => {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Tunable via env so prod can be sized to the Atlas tier without code changes.
//
//   MAX_POOL_SIZE         – Atlas connection caps: M0=500, M2=500, M5=1000,
//                           M10=1500. Each Node instance opens up to this many
//                           connections; keep `instances * MAX_POOL_SIZE` below
//                           the cluster cap with some headroom.
//   MIN_POOL_SIZE         – pre-warmed connections (lower cold-start latency).
//   SERVER_SELECTION_MS   – how long a request waits for a healthy primary
//                           before giving up (default 30s is too patient and
//                           lets bad gateways stack up).
//   SOCKET_TIMEOUT_MS     – kill stuck queries instead of pinning a connection
//                           in the pool forever (0 = disabled).
const MAX_POOL_SIZE = num(process.env.MONGODB_MAX_POOL_SIZE, 50);
const MIN_POOL_SIZE = num(process.env.MONGODB_MIN_POOL_SIZE, 2);
const SERVER_SELECTION_MS = num(process.env.MONGODB_SERVER_SELECTION_MS, 8000);
const SOCKET_TIMEOUT_MS = num(process.env.MONGODB_SOCKET_TIMEOUT_MS, 45000);
const CONNECT_TIMEOUT_MS = num(process.env.MONGODB_CONNECT_TIMEOUT_MS, 15000);
const MAX_RETRY_ATTEMPTS = num(process.env.MONGODB_MAX_RETRY_ATTEMPTS, 8);

const MONGOOSE_OPTIONS = {
  maxPoolSize: MAX_POOL_SIZE,
  minPoolSize: MIN_POOL_SIZE,
  serverSelectionTimeoutMS: SERVER_SELECTION_MS,
  socketTimeoutMS: SOCKET_TIMEOUT_MS,
  connectTimeoutMS: CONNECT_TIMEOUT_MS,
  // Atlas defaults to retryWrites=true server-side, but being explicit avoids
  // surprises if the cluster gets re-provisioned with different defaults.
  retryWrites: true,
  // We run syncIndexes() manually for the StudyPlan migration. Auto-build is
  // dangerous on large collections — it blocks writes during the build.
  autoIndex: env.NODE_ENV !== "production",
  // Heartbeat / family preferences
  heartbeatFrequencyMS: 10000,
  family: 4, // prefer IPv4 — many ISPs return broken AAAA records for Atlas
};

let connectionPromise = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRecoverableConnectError = (err) => {
  const code = err?.name || "";
  const msg = String(err?.message || "");
  // ENOTFOUND / EAI_AGAIN / ETIMEDOUT / Mongo selection timeouts are all worth
  // a retry. Auth failures or bad URIs are not.
  if (msg.toLowerCase().includes("authentication failed")) return false;
  if (msg.toLowerCase().includes("bad auth")) return false;
  if (msg.toLowerCase().includes("uri must include hostname")) return false;
  return (
    code === "MongooseServerSelectionError" ||
    code === "MongoNetworkError" ||
    /(ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNREFUSED|ECONNRESET)/i.test(msg) ||
    /server selection/i.test(msg)
  );
};

const attemptConnect = async () => {
  let attempt = 0;
  // Exponential backoff with a 30s ceiling. Total wall-clock budget at
  // MAX_RETRY_ATTEMPTS=8 is ≈ 1 + 2 + 4 + 8 + 16 + 30 + 30 + 30 = ~2 min,
  // long enough for an Atlas M0 cold-start or a brief network blip.
  // We never give up beyond MAX_RETRY_ATTEMPTS so a permanently broken cluster
  // still fails fast and lets the orchestrator alert/restart.
  while (true) {
    attempt += 1;
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);
      console.log(
        `MongoDB connected: ${conn.connection.host} (pool ${MIN_POOL_SIZE}-${MAX_POOL_SIZE})`
      );
      return conn;
    } catch (error) {
      const recoverable = isRecoverableConnectError(error);
      const willRetry = recoverable && attempt < MAX_RETRY_ATTEMPTS;

      console.error(
        `MongoDB connect attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed: ${error.message}`
      );

      if (!willRetry) throw error;

      const delay = Math.min(30000, 2 ** (attempt - 1) * 1000);
      console.warn(`Retrying in ${Math.round(delay / 1000)}s...`);
      await wait(delay);
    }
  }
};

const wireConnectionEvents = () => {
  const c = mongoose.connection;

  c.on("disconnected", () => console.warn("MongoDB disconnected"));
  c.on("reconnected", () => console.log("MongoDB reconnected"));
  c.on("error", (err) => console.error(`MongoDB connection error: ${err.message}`));
  // We don't process.exit on these events — the driver auto-reconnects, and
  // /api/v1/health will start returning 503 so load balancers stop routing to
  // us until we're healthy again.
};

export const connectDB = async () => {
  if (connectionPromise) return connectionPromise;

  wireConnectionEvents();
  connectionPromise = attemptConnect()
    .then(async (conn) => {
      try {
        await fixStudyPlanIndexes();
      } catch (indexErr) {
        console.warn(`StudyPlan index migration: ${indexErr.message}`);
      }
      return conn;
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected gracefully");
  } catch (err) {
    console.error(`MongoDB disconnect error: ${err.message}`);
  }
};

/**
 * Snapshot of the current Mongo state for the health endpoint. We expose the
 * raw readyState (0 disconnected, 1 connected, 2 connecting, 3 disconnecting)
 * plus a boolean so callers don't have to hardcode the enum.
 */
export const getDbHealth = () => {
  const state = mongoose.connection.readyState;
  return {
    readyState: state,
    connected: state === 1,
    host: mongoose.connection.host || null,
  };
};
