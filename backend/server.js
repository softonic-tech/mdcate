import dotenv from "dotenv";
import "./cron.js";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.config.js";
import { initSocket } from "./websocket/socket.js";
import { startWorkers } from "./jobs/index.js";
import env from "./config/env.config.js";

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  initSocket(httpServer);

  const rabbitChannel = await connectRabbitMQ();
  if (rabbitChannel) {
    await startWorkers();
  }

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (reason) => {
    console.error(`${reason}. Shutting down...`);
    httpServer.close(() => process.exit(1));
  };

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    shutdown("Unhandled Rejection");
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    shutdown("Uncaught Exception");
  });
};

startServer();
