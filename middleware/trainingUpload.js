
// D:\office\webartifacts\web-backend\middleware\trainingUpload.js

import multer from "multer";
import { put } from "@vercel/blob";

// 📦 Multer config
// Use multer.memoryStorage() to handle the file in RAM instead of on the disk.
const storage = multer.memoryStorage();

// Middleware to handle Multer processing
const trainingMulter = multer({ storage });

// Middleware to handle Vercel Blob upload
const uploadToBlob = async (req, res, next) => {
  if (!req.file) {
    return next(); // No file to upload, move on.
  }

  try {
    // Generate a unique path for the blob in the "training" folder
    const blobPath = `training/${Date.now()}_${req.file.originalname}`;
    
    // Upload the file's buffer to Vercel Blob
    const blob = await put(blobPath, req.file.buffer, {
      access: "public",
    });
    
    // Save the new Blob URL to the request object
    req.blobUrl = blob.url;
    next();
  } catch (err) {
    console.error("Vercel Blob upload error:", err);
    return res.status(500).json({ error: "Failed to upload file to Vercel Blob." });
  }
};

// Export a single middleware that chains the Multer and Blob upload logic
export const trainingUpload = [trainingMulter.single("file"), uploadToBlob];







// //D:\office\webartifacts\web-backend\middleware\trainingUpload.js

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // 📁 Ensure training folder exists
// const trainingDir = path.resolve("uploads/training");
// if (!fs.existsSync(trainingDir)) fs.mkdirSync(trainingDir, { recursive: true });

// // 📦 Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, trainingDir),
//   filename: (req, file, cb) => {
//     const uniqueName = `training_${Date.now()}_${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });

// export const trainingUpload = multer({ storage });
