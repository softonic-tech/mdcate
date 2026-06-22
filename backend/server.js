import dotenv from "dotenv";
import "./cron.js";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.config.js";
import { initSocket } from "./websocket/socket.js";
import { startWorkers } from "./jobs/index.js";
import env from "./config/env.config.js";
import { seedDefaultPlansService } from "./services/pricingPlan.service.js";

const SHUTDOWN_TIMEOUT_MS = 15000;
let shuttingDown = false;

const startServer = async () => {
  await connectDB();
  await seedDefaultPlansService();

  const httpServer = http.createServer(app);

  initSocket(httpServer);

  const rabbitChannel = await connectRabbitMQ();
  if (rabbitChannel) {
    await startWorkers();
  }

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown — closes the HTTP listener (so the load balancer marks
  // us out of rotation), drains in-flight requests, then closes the Mongo
  // pool. SIGTERM is what `docker stop` / k8s send on rolling deploys.
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received — shutting down gracefully`);

    const forceExit = setTimeout(() => {
      console.error("Shutdown timeout reached, forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref?.();

    httpServer.close(async (err) => {
      if (err) console.error(`HTTP close error: ${err.message}`);
      await disconnectDB();
      clearTimeout(forceExit);
      process.exit(0);
    });
  };

  ["SIGTERM", "SIGINT"].forEach((sig) => process.on(sig, () => shutdown(sig)));

  // Crash safety: log loudly but DO NOT kill the process for transient errors.
  // Killing on every unhandled rejection means one stray Mongoose timeout
  // (very common during Atlas primary failovers) takes down the whole server
  // and drops every in-flight request. We track repeated failures and only
  // bail when something is clearly wedged.
  let unhandledCount = 0;
  setInterval(() => {
    unhandledCount = 0;
  }, 60 * 1000).unref?.();

  process.on("unhandledRejection", (reason) => {
    unhandledCount += 1;
    console.error("Unhandled Rejection:", reason);
    if (unhandledCount > 25) {
      console.error("Too many unhandled rejections — exiting for orchestrator to restart");
      shutdown("UNHANDLED_REJECTION_STORM");
    }
  });

  process.on("uncaughtException", (err) => {
    // uncaughtException is genuinely scary (the process state may be corrupt
    // — see Node docs), so we DO exit here, but via the graceful path so
    // in-flight requests get a chance to finish if possible.
    console.error("Uncaught Exception:", err);
    shutdown("UNCAUGHT_EXCEPTION");
  });
};

startServer().catch((err) => {
  console.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
