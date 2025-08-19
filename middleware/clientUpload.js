
//D:\office\webartifacts\web-backend\middleware\clientUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const complaintDir = path.resolve("uploads/complaints");
if (!fs.existsSync(complaintDir)) fs.mkdirSync(complaintDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, complaintDir),
  filename: (req, file, cb) => {
    const uniqueName = `complaint_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const complaintUpload = multer({ storage });
