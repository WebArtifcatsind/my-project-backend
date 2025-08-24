import express from "express";
import {
  uploadStaffDocument,
  getAllStaffDocuments,
  downloadStaffDocument,
  adminUploadToClient,
  downloadClientDocument
} from "../controllers/documentController.js";

import { memoryUpload, uploadToBlob } from "../middleware/fileUpload.js"; // Import new middleware exports
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Staff uploads
// Use memoryUpload to get the file buffer, then uploadToBlob to send to Vercel Blob
router.post("/staff-upload", verifyToken, memoryUpload.single("file"), uploadToBlob('fromStaff'), uploadStaffDocument);

// 🔹 Admin views staff uploads (No changes)
router.get("/staff-uploads", verifyAdmin, getAllStaffDocuments);

// 🔹 Admin downloads from staff (Now redirects to Blob URL)
// The `filename` in the URL will be used to query the DB for the Blob URL
router.get("/download/:filename", verifyAdmin, downloadStaffDocument);

// 🔹 Admin uploads to client
// Use memoryUpload to get the file buffer, then uploadToBlob to send to Vercel Blob
router.post("/admin-upload", verifyAdmin, memoryUpload.single("file"), uploadToBlob('toClients'), adminUploadToClient);

// 🔹 Client downloads shared document (Now redirects to Blob URL)
// The `filename` in the URL will be used to query the DB for the Blob URL
router.get("/client-download/:filename", verifyToken, downloadClientDocument);

// ✅ Export the router
export default router;










// import express from "express";
// import {
//   uploadStaffDocument,
//   getAllStaffDocuments,
//   downloadStaffDocument,
//   adminUploadToClient,
//   downloadClientDocument
// } from "../controllers/documentController.js";

// import { staffUpload, toClientsUpload } from "../middleware/fileUpload.js";
// import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // 🔹 Staff uploads
// router.post("/staff-upload", verifyToken, staffUpload.single("file"), uploadStaffDocument);

// // 🔹 Admin views staff uploads
// router.get("/staff-uploads", verifyAdmin, getAllStaffDocuments);

// // 🔹 Admin downloads from staff
// router.get("/download/:filename", verifyAdmin, downloadStaffDocument);

// // 🔹 Admin uploads to client
// router.post("/admin-upload", verifyAdmin, toClientsUpload.single("file"), adminUploadToClient);

// // 🔹 Client downloads shared document
// router.get("/client-download/:filename", verifyToken, downloadClientDocument);

// // ✅ Export the router
// export default router;
