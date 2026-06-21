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

    socket.on("join:thread", (threadId) => {
      socket.join(`thread:${threadId}`);
    });

    socket.on("leave:thread", (threadId) => {
      socket.leave(`thread:${threadId}`);
    });

    socket.on("join:counseling", (sessionId) => {
      socket.join(`counseling:${sessionId}`);
      io.to(`counseling:${sessionId}`).emit("participant:joined", { userId });
    });

    socket.on("leave:counseling", (sessionId) => {
      socket.leave(`counseling:${sessionId}`);
      io.to(`counseling:${sessionId}`).emit("participant:left", { userId });
    });

    socket.on("disconnect", () => {
      socket.rooms.forEach((room) => {
        if (room.startsWith("counseling:")) {
          io.to(room).emit("participant:left", { userId });
        }
      });
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

export const emitToCounseling = (sessionId, event, data) => {
  if (io) io.to(`counseling:${sessionId}`).emit(event, data);
};
