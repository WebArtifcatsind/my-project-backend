


import express from "express";
import { getAdminDashboard, getStaffDashboard } from "../controllers/dashboardController.js";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", verifyAdmin, getAdminDashboard);
router.get("/staff", verifyToken, getStaffDashboard);  // 🔸 This one

export default router;
