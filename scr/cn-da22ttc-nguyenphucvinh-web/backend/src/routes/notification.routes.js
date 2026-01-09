import express from "express";
import {
  broadcastNotification,
  deleteNotification,
  getUnreadNotificationCount,
  getUnreadNotifications,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notifyEventVolunteers
} from "../controllers/notification.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= ADMIN ONLY ================= */
// Send notification to volunteers in a specific event
router.post(
  "/event/:eventId",
  authenticate,
  requireRole("ADMIN"),
  notifyEventVolunteers
);

// Broadcast notification to all volunteers
router.post(
  "/broadcast",
  authenticate,
  requireRole("ADMIN"),
  broadcastNotification
);

/* ================= USER ROUTES ================= */
// Get all notifications for user (paginated)
router.get(
  "/",
  authenticate,
  getUserNotifications
);

// Get unread notifications only
router.get(
  "/unread",
  authenticate,
  getUnreadNotifications
);

// Mark all notifications as read
router.put(
  "/mark-all-read",
  authenticate,
  markAllNotificationsAsRead
);

// Mark notification as read
router.put(
  "/:notificationId/read",
  authenticate,
  markNotificationAsRead
);

// Delete notification
router.delete(
  "/:notificationId",
  authenticate,
  deleteNotification
);

// Get unread notification count
router.get(
  "/count",
  authenticate,
  getUnreadNotificationCount
);

export default router;
