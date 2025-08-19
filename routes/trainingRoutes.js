

import express from "express";
import { uploadTraining, getTrainingMaterials } from "../controllers/trainingController.js";
import { trainingUpload } from "../middleware/trainingUpload.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { deleteTrainingMaterial } from "../controllers/trainingController.js";

const router = express.Router();

// Upload training file (PDF/video)
router.post("/upload", verifyToken, trainingUpload.single("file"), uploadTraining);

// Get all training materials
router.get("/all", verifyToken, getTrainingMaterials);

// delete all training materials
router.delete("/delete/:id", verifyToken, deleteTrainingMaterial);

export default router;
