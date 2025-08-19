// ✅ FIXED & VERIFIED: web-backend/routes/attendanceRoutes.js
import express from "express";
import {
  markAttendance,
  getAttendanceByDate,
  updateAttendance,
  getMyAttendance,
  getAttendanceByUser,
} from "../controllers/attendanceController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ IT Staff marks their attendance
router.post("/mark", verifyToken, markAttendance);

// ✅ Admin views all attendance
router.get("/all", verifyAdmin, getAttendanceByDate);

// ✅ Admin updates attendance of any staff
router.put("/update", verifyAdmin, updateAttendance);

// ✅ IT Staff views their own attendance
router.get("/my", verifyToken, getMyAttendance);

// ✅ Admin or IT Staff (only for their own) views user-wise attendance
router.get("/user/:id", verifyToken, (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.id);
    const loggedInUserId = parseInt(req.user.userId);
    const role = req.user.role;

    if (!requestedUserId || isNaN(requestedUserId)) {
      return res.status(400).json({ message: "Invalid user ID in URL" });
    }

    if (role === "admin" || requestedUserId === loggedInUserId) {
      return getAttendanceByUser(req, res);
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    console.error("❌ Error in user/:id route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
