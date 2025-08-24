
// routes/trainingRoutes.js

import express from "express";
import { uploadTraining, getTrainingMaterials, deleteTrainingMaterial } from "../controllers/trainingController.js";
import { memoryUpload, uploadToBlob } from "../middleware/fileUpload.js"; // Import from the central file upload middleware
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js"; // Note: verifyAdmin might be needed here.

const router = express.Router();

// 📤 Upload training file
// Chain the two middlewares for upload: first multer, then the Blob upload
router.post(
  "/upload", 
  verifyToken, 
  verifyAdmin, // It's good practice to secure uploads with an admin check
  memoryUpload.single("file"), 
  uploadToBlob("training"), 
  uploadTraining
);

// 📥 Get all training materials
router.get("/all", verifyToken, getTrainingMaterials);

// ❌ Delete training material
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteTrainingMaterial);

export default router;









// import express from "express";
// import { uploadTraining, getTrainingMaterials } from "../controllers/trainingController.js";
// import { trainingUpload } from "../middleware/trainingUpload.js";
// import { verifyToken } from "../middleware/authMiddleware.js";
// import { deleteTrainingMaterial } from "../controllers/trainingController.js";

// const router = express.Router();

// // Upload training file (PDF/video)
// router.post("/upload", verifyToken, trainingUpload.single("file"), uploadTraining);

// // Get all training materials
// router.get("/all", verifyToken, getTrainingMaterials);

// // delete all training materials
// router.delete("/delete/:id", verifyToken, deleteTrainingMaterial);

// export default router;
