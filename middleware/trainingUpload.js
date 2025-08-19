
//D:\office\webartifacts\web-backend\middleware\trainingUpload.js

import multer from "multer";
import path from "path";
import fs from "fs";

// 📁 Ensure training folder exists
const trainingDir = path.resolve("uploads/training");
if (!fs.existsSync(trainingDir)) fs.mkdirSync(trainingDir, { recursive: true });

// 📦 Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, trainingDir),
  filename: (req, file, cb) => {
    const uniqueName = `training_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const trainingUpload = multer({ storage });
