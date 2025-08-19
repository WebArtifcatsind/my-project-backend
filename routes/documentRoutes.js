

import express from "express";
import {
  uploadStaffDocument,
  getAllStaffDocuments,
  downloadStaffDocument,
  adminUploadToClient,
  downloadClientDocument
} from "../controllers/documentController.js";

import { staffUpload, toClientsUpload } from "../middleware/fileUpload.js";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Staff uploads
router.post("/staff-upload", verifyToken, staffUpload.single("file"), uploadStaffDocument);

// 🔹 Admin views staff uploads
router.get("/staff-uploads", verifyAdmin, getAllStaffDocuments);

// 🔹 Admin downloads from staff
router.get("/download/:filename", verifyAdmin, downloadStaffDocument);

// 🔹 Admin uploads to client
router.post("/admin-upload", verifyAdmin, toClientsUpload.single("file"), adminUploadToClient);

// 🔹 Client downloads shared document
router.get("/client-download/:filename", verifyToken, downloadClientDocument);

// ✅ Export the router
export default router;
