

// routes/leaveRoutes.js
import express from "express";
import {
  applyLeave,
  getAllLeaveRequests,
  updateLeaveStatus,
} from "../controllers/leaveController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Staff applies
router.post("/apply", verifyToken, applyLeave);

// Admin views all leave requests
router.get("/all", verifyAdmin, getAllLeaveRequests);

// Admin updates leave status
router.put("/update/:id", verifyAdmin, updateLeaveStatus);

export default router;
