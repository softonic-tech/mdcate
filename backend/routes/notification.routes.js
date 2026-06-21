import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import * as ctrl from "../controllers/notification.controller.js";

const router = express.Router();
router.use(protect);

// Admin-only routes
router.post("/", isAdmin, ctrl.createNotification);
router.put("/:id", isAdmin, ctrl.updateNotification);
router.delete("/:id", isAdmin, ctrl.deleteNotification);
router.get("/all", isAdmin, ctrl.getAllNotifications);
router.get("/admin/:id", isAdmin, ctrl.getNotificationById); // rename to avoid conflict

// User routes
router.get("/", ctrl.getAllNotifications); // filtered by user
router.get("/unread-count", ctrl.getUnreadCount);
router.patch("/:id/read", ctrl.markAsRead);
router.patch("/:id/unread", ctrl.markAsUnread);
router.patch("/read-all", ctrl.markAllAsRead);
export default router;
