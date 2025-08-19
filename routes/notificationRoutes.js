

// routes/notificationRoutes.js
import express from "express";
import {
  sendNotification,
  getNotificationsForStaff,
  markNotificationRead,
  markAllNotificationsRead,
  getAllNotifications,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔸 Admin sends notification (to specific users or all staff)
router.post("/send", verifyAdmin, sendNotification);

// 🔹 Staff fetches their notifications (own + broadcasted)
router.get("/my", verifyToken, getNotificationsForStaff);

// 🔹 Staff marks a single notification as read
router.post("/mark-read/:notificationId", verifyToken, markNotificationRead);

// 🔹 Staff marks all notifications as read
router.post("/mark-all-read", verifyToken, markAllNotificationsRead);

// 🔸 Admin fetches all notifications
router.get("/all", verifyAdmin, getAllNotifications);

// 🔸 Admin updates a notification
router.put("/update/:id", verifyAdmin, updateNotification);

// 🔸 Admin deletes a notification
router.delete("/delete/:id", verifyAdmin, deleteNotification);

export default router;

