// routes/salaryRoutes.js
import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import {
  upload,
  uploadSalarySlip,
  getMySalarySlips,
  downloadSlip,
  requestSalarySlip,
  viewSalaryRequests,
  getMyRequests,
} from "../controllers/salaryController.js";

const router = express.Router();

// 👨‍💼 Admin Upload
router.post("/upload", verifyToken, upload.single("file"), uploadSalarySlip);

// 👨‍🔧 Staff View Their Slips
router.get("/my-slips", verifyToken, getMySalarySlips);

// 🔽 Download by filename
router.get("/download/:filename", downloadSlip);

// 🧾 Staff requests salary slip
router.post("/request-slip", verifyToken, requestSalarySlip);

// 📋 Admin views requests
router.get("/requests", verifyToken, verifyAdmin, viewSalaryRequests);

router.get("/staff/my-requests", verifyToken, getMyRequests);

export default router;
