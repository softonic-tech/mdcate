import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "../config/env.config.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    socket.join(`user:${userId}`);

    import("../utils/pushUnreadCount.js")
      .then(({ pushUnreadCount }) => pushUnreadCount(userId))
      .catch((err) => console.error("Failed to push unread count on connect:", err));

    socket.on("join:thread", (threadId) => {
      socket.join(`thread:${threadId}`);
    });

    socket.on("leave:thread", (threadId) => {
      socket.leave(`thread:${threadId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

export const emitToThread = (threadId, event, data) => {
  if (io) io.to(`thread:${threadId}`).emit(event, data);
};
