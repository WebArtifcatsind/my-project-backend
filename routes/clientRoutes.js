
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

import { upload, uploadToBlob } from "../middleware/fileUpload.js";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Client actions
// Chain the two middlewares: first multer to get the file, then uploadToBlob to upload to Vercel.
router.post("/complaint", upload.single("file"), uploadToBlob, submitComplaint);
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