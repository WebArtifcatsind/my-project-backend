// routes/clientRoutes.js

import express from "express";
import {
  submitComplaint,
  submitFeedback,
  getAllComplaints,
  getAllFeedbacks,
  deleteFeedback,
  deleteComplaint,
  markFeedbackPublic,
  getPublicFeedbacks,
  assignComplaint,
  removePublicStatus,
  getAssignedComplaints,
  markComplaintResolved,
  deleteStaffComplaint,
} from "../controllers/clientController.js";

// IMPORTANT: Import 'memoryUpload' and 'uploadToBlob' from your central fileUpload.js
import { memoryUpload, uploadToBlob } from "../middleware/fileUpload.js"; 
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Client actions
// Correctly chain the middlewares:
// 1. memoryUpload.single("file"): Multer processes the file and stores it in memory (req.file.buffer).
// 2. uploadToBlob('complaints'): This middleware factory is CALLED with 'complaints'
//    to upload the file to Vercel Blob and set req.blobUrl.
// 3. submitComplaint: Your controller function.
router.post(
  "/complaint", 
  memoryUpload.single("file"), // Use memoryUpload for the file
  uploadToBlob("complaints"), // Correctly call the factory with folder name
  submitComplaint
);
router.post("/feedback", submitFeedback);

router.put("/feedback/public/:id", verifyAdmin, markFeedbackPublic);

// Admin actions
router.get("/complaints", verifyAdmin, getAllComplaints);
router.get("/feedbacks", verifyAdmin, getAllFeedbacks);
router.delete("/feedback/:id", verifyAdmin, deleteFeedback);
router.delete("/complaint/:id", verifyAdmin, deleteComplaint);

// Public feedbacks for frontend
router.get("/public-feedbacks", getPublicFeedbacks);

router.post("/complaint/assign", verifyAdmin, assignComplaint);
router.put("/feedback/unpublic/:id", verifyAdmin, removePublicStatus);

// Staff-specific
router.get("/complaints/assigned", verifyToken, getAssignedComplaints);
router.put("/complaint/resolve/:id", verifyToken, markComplaintResolved);
router.delete("/complaints/staff/:id", verifyToken, deleteStaffComplaint);

export default router;














// // routes/clientRoutes.js
// import express from "express";
// import {
//   submitComplaint,
//   submitFeedback,
//   getAllComplaints,
//   getAllFeedbacks,
//   deleteFeedback,
//   deleteComplaint,
//   markFeedbackPublic,
//   getPublicFeedbacks,
//   assignComplaint,
//   removePublicStatus,
//   getAssignedComplaints,
//   markComplaintResolved,
//   deleteStaffComplaint,
// } from "../controllers/clientController.js";

// import { upload } from "../middleware/fileUpload.js";
// import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Client actions
// router.post("/complaint", upload.single("file"), submitComplaint);
// router.post("/feedback", submitFeedback);

// router.put("/feedback/public/:id", verifyAdmin, markFeedbackPublic);

// // Admin actions
// router.get("/complaints", verifyAdmin, getAllComplaints);
// router.get("/feedbacks", verifyAdmin, getAllFeedbacks);
// router.delete("/feedback/:id", verifyAdmin, deleteFeedback);
// router.delete("/complaint/:id", verifyAdmin, deleteComplaint);

// // Public feedbacks for frontend
// router.get("/public-feedbacks", getPublicFeedbacks);

// router.post("/complaint/assign", verifyAdmin, assignComplaint);
// router.put("/feedback/unpublic/:id", verifyAdmin, removePublicStatus);

// // Staff-specific
// router.get("/complaints/assigned", verifyToken, getAssignedComplaints);
// router.put("/complaint/resolve/:id", verifyToken, markComplaintResolved);
// router.delete("/complaints/staff/:id", verifyToken, deleteStaffComplaint);

// export default router;